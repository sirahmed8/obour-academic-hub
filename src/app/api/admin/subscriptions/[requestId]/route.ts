import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, requirePermission } from "@/lib/server/auth";
import { corsOptions, withCors } from "@/lib/server/cors";
import { adminDb, FieldValue } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

const subscriptionActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().max(500).optional(),
  customDurationDays: z.number().int().min(1).max(1000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const context = await requirePermission(req, "manage_users");

    const { requestId } = await params;

    const body = await req.json();
    const parsed = subscriptionActionSchema.safeParse(body);

    if (!parsed.success) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Invalid action payload", details: parsed.error.format() },
          { status: 400 }
        )
      );
    }

    const { action, rejectionReason, customDurationDays } = parsed.data;
    const nowIso = new Date().toISOString();

    const requestRef = adminDb.collection("subscription_requests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return withCors(
        req,
        NextResponse.json({ error: "Subscription request not found" }, { status: 404 })
      );
    }

    const requestData = requestDoc.data()!;
    const userId = requestData.userId;

    // Idempotency: prevent double approvals or duplicate review operations
    if (requestData.status === "approved" || requestData.status === "rejected") {
      return withCors(
        req,
        NextResponse.json({
          success: true,
          message: `Subscription request was already ${requestData.status}`,
          status: requestData.status,
          alreadyProcessed: true,
        })
      );
    }

    if (action === "approve") {
      const durationDays =
        customDurationDays ||
        Number(requestData.durationDays) ||
        (requestData.plan === "annual" ? 365 : requestData.plan === "semester" ? 120 : 30);

      // Determine expiration date
      let baseTime = Date.now();
      const userDoc = await adminDb.collection("users").doc(userId).get();
      const userData = userDoc.data();

      if (userData?.vipExpiresAt) {
        const existingExpiry = new Date(userData.vipExpiresAt).getTime();
        if (existingExpiry > baseTime) {
          // Additively extend existing active VIP
          baseTime = existingExpiry;
        }
      }

      const expiryDate = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
      const vipExpiresAt = expiryDate.toISOString();

      const batch = adminDb.batch();

      // 1. Update Subscription Request
      batch.update(requestRef, {
        status: "approved",
        durationDays,
        reviewedBy: context.uid,
        reviewedAt: nowIso,
        updatedAt: nowIso,
      });

      // 2. Update User Profile
      const userRef = adminDb.collection("users").doc(userId);
      batch.set(
        userRef,
        {
          isVip: true,
          subscriptionTier: "vip",
          vipType: "paid",
          vipGrantedBy: `Admin Approval (Order #${requestId})`,
          vipGrantedAt: nowIso,
          vipExpiresAt,
        },
        { merge: true }
      );

      // 3. Send Congratulatory In-App Notification
      const notifRef = adminDb.collection("notifications").doc();
      batch.set(notifRef, {
        id: notifRef.id,
        titleAr: "🎉 تم قبول طلب اشتراك العبور بلس!",
        titleEn: "🎉 Obour VIP Pass Activated!",
        messageAr: `تم التحقق من تحويلك وتفعيل باقة ${requestData.planNameAr || "VIP"} بنجاح حتى تاريخ ${expiryDate.toLocaleDateString("ar-EG")}. استمتع بجميع المميزات الذهبية!`,
        messageEn: `Your payment was verified and ${requestData.planNameEn || "VIP"} is active until ${expiryDate.toLocaleDateString("en-US")}. Enjoy VIP perks!`,
        type: "success",
        target: userId,
        createdAt: nowIso,
        readBy: [],
      });

      // 4. Audit Log
      const logRef = adminDb.collection("logs").doc();
      batch.set(logRef, {
        action: "SUBSCRIPTION_APPROVED",
        details: `Admin ${context.email} approved subscription request #${requestId} for user ${userId} (${requestData.userEmail}). Granted ${durationDays} days VIP.`,
        requestId,
        userId,
        adminId: context.uid,
        durationDays,
        createdAt: nowIso,
        timestamp: FieldValue.serverTimestamp(),
      });

      await batch.commit();

      return withCors(
        req,
        NextResponse.json({
          success: true,
          status: "approved",
          expiresAt: vipExpiresAt,
          durationDays,
          message: "تم تفعيل اشتراك الطالب بنجاح",
        })
      );
    } else {
      // Reject action
      const reason =
        rejectionReason ||
        "تعذر التحقق من بيانات التحويل أو رقم العملية. يرجى مراجعة إيصال الدفع وإعادة المحاولة.";

      const batch = adminDb.batch();

      // 1. Update Subscription Request
      batch.update(requestRef, {
        status: "rejected",
        rejectionReason: reason,
        reviewedBy: context.uid,
        reviewedAt: nowIso,
        updatedAt: nowIso,
      });

      // 2. Send Notification to Student Explaining Reason
      const notifRef = adminDb.collection("notifications").doc();
      batch.set(notifRef, {
        id: notifRef.id,
        titleAr: "إشعار بشأن طلب اشتراك العبور بلس",
        titleEn: "Update on your Obour VIP Pass Request",
        messageAr: `نعتذر، تعذر تفعيل طلب الاشتراك: ${reason}. يمكنك إعادة إرسال بيانات التحويل الصحيحة من صفحة العبور بلس.`,
        messageEn: `We could not verify your subscription request: ${reason}. You can re-submit from the VIP Pass page.`,
        type: "warning",
        target: userId,
        createdAt: nowIso,
        readBy: [],
      });

      // 3. Audit Log
      const logRef = adminDb.collection("logs").doc();
      batch.set(logRef, {
        action: "SUBSCRIPTION_REJECTED",
        details: `Admin ${context.email} rejected subscription request #${requestId} for user ${userId}. Reason: ${reason}`,
        requestId,
        userId,
        adminId: context.uid,
        reason,
        createdAt: nowIso,
        timestamp: FieldValue.serverTimestamp(),
      });

      await batch.commit();

      return withCors(
        req,
        NextResponse.json({
          success: true,
          status: "rejected",
          reason,
          message: "تم رفض الطلب وإشعار الطالب بالسبب",
        })
      );
    }
  } catch (error) {
    return handleRouteError(req, error);
  }
}
