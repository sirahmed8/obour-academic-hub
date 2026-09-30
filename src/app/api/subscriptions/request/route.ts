import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext, handleRouteError } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { corsOptions, withCors } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebase-admin";
import { SubscriptionPlanId, SubscriptionPaymentMethod } from "@/types";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

const subscriptionRequestSchema = z.object({
  plan: z.enum(["monthly", "semester", "annual"]),
  paymentMethod: z.enum([
    "instapay",
    "vodafone_cash",
    "orange_cash",
    "etisalat_cash",
    "we_pay",
    "card",
  ]),
  senderPhoneOrAccount: z.string().trim().min(3).max(100),
  transactionReference: z.string().trim().max(100).optional().default(""),
  receiptUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().default(""),
});

const PLAN_CONFIG: Record<
  SubscriptionPlanId,
  { amount: number; durationDays: number; nameAr: string; nameEn: string }
> = {
  monthly: {
    amount: 49,
    durationDays: 30,
    nameAr: "باقة الاشتراك الشهري",
    nameEn: "Monthly VIP Pass",
  },
  semester: {
    amount: 199,
    durationDays: 120,
    nameAr: "باقة الفصل الدراسي (الترم)",
    nameEn: "Semester VIP Pass",
  },
  annual: {
    amount: 349,
    durationDays: 365,
    nameAr: "باقة العام الأكاديمي الكامل",
    nameEn: "Full Academic Year VIP Pass",
  },
};

export async function POST(req: NextRequest) {
  try {
    const context = await getRequestContext(req);

    // Rate limit: 5 subscription requests per 10 minutes per user
    const limiter = await rateLimit({
      key: `api:sub_request:${context.uid}`,
      limit: 5,
      windowMs: 10 * 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Too many subscription requests. Please wait before submitting again." },
          { status: 429 }
        )
      );
    }

    const body = await req.json();
    const parsed = subscriptionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Invalid subscription request payload", details: parsed.error.format() },
          { status: 400 }
        )
      );
    }

    const { plan, paymentMethod, senderPhoneOrAccount, transactionReference, receiptUrl, notes } =
      parsed.data;

    const planDetails = PLAN_CONFIG[plan as SubscriptionPlanId];
    const nowIso = new Date().toISOString();

    // Idempotency check via client header
    const idempotencyKey =
      req.headers.get("x-idempotency-key") || req.headers.get("idempotency-key");
    if (idempotencyKey) {
      const existingIdempotentSnap = await adminDb
        .collection("subscription_requests")
        .where("idempotencyKey", "==", idempotencyKey)
        .where("userId", "==", context.uid)
        .limit(1)
        .get();

      if (!existingIdempotentSnap.empty) {
        const existingData = existingIdempotentSnap.docs[0].data();
        return withCors(
          req,
          NextResponse.json({
            success: true,
            requestId: existingIdempotentSnap.docs[0].id,
            plan: {
              id: existingData.plan,
              nameAr: existingData.planNameAr,
              nameEn: existingData.planNameEn,
              amount: existingData.amount,
              durationDays: existingData.durationDays,
            },
            idempotentReplay: true,
            message: "Subscription request already processed",
          })
        );
      }
    }

    // Check for existing pending request to avoid duplicates
    const existingPendingQuery = await adminDb
      .collection("subscription_requests")
      .where("userId", "==", context.uid)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    let docRef;
    if (!existingPendingQuery.empty) {
      // Update existing pending request with new transfer proof/data
      docRef = existingPendingQuery.docs[0].ref;
      await docRef.set(
        {
          plan,
          planNameAr: planDetails.nameAr,
          planNameEn: planDetails.nameEn,
          amount: planDetails.amount,
          durationDays: planDetails.durationDays,
          currency: "EGP",
          paymentMethod: paymentMethod as SubscriptionPaymentMethod,
          senderPhoneOrAccount,
          transactionReference: transactionReference || "",
          receiptUrl: receiptUrl || "",
          notes: notes || "",
          updatedAt: nowIso,
          userName: context.profile?.displayName || context.email.split("@")[0],
          userEmail: context.email,
          studentCode: context.profile?.studentCode || "",
          idempotencyKey: idempotencyKey || null,
        },
        { merge: true }
      );
    } else {
      // Create new request
      docRef = adminDb.collection("subscription_requests").doc();
      await docRef.set({
        id: docRef.id,
        userId: context.uid,
        userEmail: context.email,
        userName: context.profile?.displayName || context.email.split("@")[0],
        studentCode: context.profile?.studentCode || "",
        plan,
        planNameAr: planDetails.nameAr,
        planNameEn: planDetails.nameEn,
        amount: planDetails.amount,
        durationDays: planDetails.durationDays,
        currency: "EGP",
        paymentMethod: paymentMethod as SubscriptionPaymentMethod,
        senderPhoneOrAccount,
        transactionReference: transactionReference || "",
        receiptUrl: receiptUrl || "",
        status: "pending",
        notes: notes || "",
        createdAt: nowIso,
        updatedAt: nowIso,
        idempotencyKey: idempotencyKey || null,
      });
    }

    // Trigger Admin Notification
    try {
      const notifRef = adminDb.collection("notifications").doc();
      await notifRef.set({
        id: notifRef.id,
        titleAr: "طلب اشتراك VIP جديد",
        titleEn: "New VIP Subscription Request",
        messageAr: `قام الطالب ${context.profile?.displayName || context.email} بطلب باقة ${planDetails.nameAr} بقيمة ${planDetails.amount} ج.م عبر ${paymentMethod}`,
        messageEn: `Student ${context.profile?.displayName || context.email} requested ${planDetails.nameEn} for ${planDetails.amount} EGP via ${paymentMethod}`,
        type: "info",
        target: "admins",
        createdAt: nowIso,
        readBy: [],
      });
    } catch (notifErr) {
      console.warn("[SUBSCRIPTION_REQUEST] Failed to create admin notification:", notifErr);
    }

    return withCors(
      req,
      NextResponse.json({
        success: true,
        requestId: docRef.id,
        message: "تم استلام طلب الاشتراك بنجاح وجارٍ مراجعته وتفعيله.",
        plan: planDetails,
      })
    );
  } catch (error) {
    return handleRouteError(req, error);
  }
}
