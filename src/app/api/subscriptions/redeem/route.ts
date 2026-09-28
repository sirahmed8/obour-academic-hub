import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext, handleRouteError } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { corsOptions, withCors } from "@/lib/server/cors";
import { adminDb, FieldValue } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

const redeemSchema = z.object({
  code: z.string().trim().min(3).max(30),
});

// Built-in seed promo codes for instant launch
const SEED_PROMO_CODES: Record<
  string,
  { durationDays: number; maxUses: number; description: string }
> = {
  OBOUR2026: {
    durationDays: 120,
    maxUses: 1000,
    description: "Full Semester VIP Pass Promo",
  },
  VIPPASS: {
    durationDays: 30,
    maxUses: 1000,
    description: "Monthly VIP Pass Promo",
  },
  ELITE2026: {
    durationDays: 365,
    maxUses: 500,
    description: "Full Academic Year VIP Pass Promo",
  },
  OBOURFREE: {
    durationDays: 30,
    maxUses: 2000,
    description: "Complimentary Student VIP Pass Promo",
  },
};

export async function POST(req: NextRequest) {
  try {
    const context = await getRequestContext(req);

    // Rate limit: 5 attempts per 10 minutes to prevent brute forcing
    const limiter = await rateLimit({
      key: `api:promo_redeem:${context.uid}`,
      limit: 5,
      windowMs: 10 * 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Too many code attempts. Please wait 10 minutes." },
          { status: 429 }
        )
      );
    }

    const body = await req.json();
    const parsed = redeemSchema.safeParse(body);

    if (!parsed.success) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Invalid promo code format", details: parsed.error.format() },
          { status: 400 }
        )
      );
    }

    const normalizedCode = parsed.data.code.toUpperCase();
    const now = new Date();
    const nowIso = now.toISOString();

    // Check Firestore promo_codes collection first
    const codeQuery = await adminDb
      .collection("promo_codes")
      .where("code", "==", normalizedCode)
      .limit(1)
      .get();

    let durationDays = 30;
    let promoDocRef = null;

    if (!codeQuery.empty) {
      const promoDoc = codeQuery.docs[0];
      const promoData = promoDoc.data();
      promoDocRef = promoDoc.ref;

      if (promoData.isActive === false) {
        return withCors(
          req,
          NextResponse.json(
            { error: "كود الخصم غير نشط حالياً (Promo code is inactive)" },
            { status: 400 }
          )
        );
      }

      if (promoData.expiresAt && new Date(promoData.expiresAt).getTime() < now.getTime()) {
        return withCors(
          req,
          NextResponse.json(
            { error: "كود الخصم منتهي الصلاحية (Promo code expired)" },
            { status: 400 }
          )
        );
      }

      if (
        promoData.maxUses &&
        promoData.usedCount !== undefined &&
        promoData.usedCount >= promoData.maxUses
      ) {
        return withCors(
          req,
          NextResponse.json(
            { error: "وصل هذا الكود للحد الأقصى لمرات الاستخدام (Code limit reached)" },
            { status: 400 }
          )
        );
      }

      if (Array.isArray(promoData.usedBy) && promoData.usedBy.includes(context.uid)) {
        return withCors(
          req,
          NextResponse.json(
            { error: "لقد قمت باستخدام كود التفعيل هذا مسبقاً (Already redeemed)" },
            { status: 400 }
          )
        );
      }

      durationDays = promoData.durationDays || 30;
    } else if (normalizedCode in SEED_PROMO_CODES) {
      const seed = SEED_PROMO_CODES[normalizedCode];
      durationDays = seed.durationDays;

      // Check if user already used this seed code
      const userDoc = await adminDb.collection("users").doc(context.uid).get();
      const userData = userDoc.data();
      if (userData?.redeemedPromoCodes && Array.isArray(userData.redeemedPromoCodes)) {
        if (userData.redeemedPromoCodes.includes(normalizedCode)) {
          return withCors(
            req,
            NextResponse.json(
              { error: "لقد قمت باستخدام كود التفعيل هذا مسبقاً (Already redeemed)" },
              { status: 400 }
            )
          );
        }
      }
    } else {
      return withCors(
        req,
        NextResponse.json(
          { error: "كود التفعيل غير صحيح أو غير متاح (Invalid promo code)" },
          { status: 404 }
        )
      );
    }

    // Calculate expiration date:
    // If the user already has an active future expiration date, extend from it!
    const userDoc = await adminDb.collection("users").doc(context.uid).get();
    const existingUserData = userDoc.data();
    let baseTime = now.getTime();

    if (existingUserData?.vipExpiresAt) {
      const currentExpiry = new Date(existingUserData.vipExpiresAt).getTime();
      if (currentExpiry > baseTime) {
        baseTime = currentExpiry; // Extend existing active duration
      }
    }

    const expiryDate = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
    const vipExpiresAt = expiryDate.toISOString();

    // Perform atomic updates
    const batch = adminDb.batch();

    // 1. Update user document
    const userRef = adminDb.collection("users").doc(context.uid);
    batch.set(
      userRef,
      {
        isVip: true,
        subscriptionTier: "vip",
        vipType: "gifted",
        vipGrantedBy: `Promo Code: ${normalizedCode}`,
        vipGrantedAt: nowIso,
        vipExpiresAt,
        redeemedPromoCodes: FieldValue.arrayUnion(normalizedCode),
      },
      { merge: true }
    );

    // 2. Update promo code usage if doc exists
    if (promoDocRef) {
      batch.update(promoDocRef, {
        usedCount: FieldValue.increment(1),
        usedBy: FieldValue.arrayUnion(context.uid),
        lastUsedAt: nowIso,
      });
    }

    // 3. Create celebratory notification for user
    const notifRef = adminDb.collection("notifications").doc();
    batch.set(notifRef, {
      id: notifRef.id,
      titleAr: "🎉 تم تفعيل اشتراك العبور بلس بنجاح!",
      titleEn: "🎉 Obour VIP Pass Activated!",
      messageAr: `تم تفعيل اشتراك VIP لمدة ${durationDays} يوماً عبر الكود ${normalizedCode}. استمتع بمميزات الذكاء الاصطناعي ومضاعف الـ XP!`,
      messageEn: `VIP Pass activated for ${durationDays} days using promo code ${normalizedCode}. Enjoy AI perks and 2x XP boost!`,
      type: "success",
      target: context.uid,
      createdAt: nowIso,
      readBy: [],
    });

    // 4. Log audit action
    const logRef = adminDb.collection("logs").doc();
    batch.set(logRef, {
      action: "PROMO_CODE_REDEEMED",
      details: `User ${context.email} (${context.uid}) redeemed ${normalizedCode} for ${durationDays} days VIP`,
      userId: context.uid,
      code: normalizedCode,
      durationDays,
      createdAt: nowIso,
      timestamp: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return withCors(
      req,
      NextResponse.json({
        success: true,
        message: `تم تفعيل اشتراك العبور بلس بنجاح لمدة ${durationDays} يوماً!`,
        durationDays,
        expiresAt: vipExpiresAt,
      })
    );
  } catch (error) {
    return handleRouteError(req, error);
  }
}
