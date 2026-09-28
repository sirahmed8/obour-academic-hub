import { NextRequest, NextResponse } from "next/server";
import { getRequestContext, handleRouteError } from "@/lib/server/auth";
import { corsOptions, withCors } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebase-admin";
import { SubscriptionRequest } from "@/types";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function GET(req: NextRequest) {
  try {
    const context = await getRequestContext(req, { allowMissingProfile: true });

    const userDocRef = adminDb.collection("users").doc(context.uid);
    const userDoc = await userDocRef.get();
    const userData = userDoc.exists ? userDoc.data() : null;

    const isOwnerOrAdmin = context.isOwner || context.role === "admin";
    let isVip = Boolean(userData?.isVip) || isOwnerOrAdmin;
    let subscriptionTier = userData?.subscriptionTier || (isVip ? "vip" : "free");
    const vipExpiresAt = userData?.vipExpiresAt || null;

    // Check expiration if not owner/admin and expiration date exists
    if (!isOwnerOrAdmin && isVip && vipExpiresAt) {
      const expiryDate = new Date(vipExpiresAt);
      if (expiryDate.getTime() < Date.now()) {
        // Expired! Revoke VIP
        isVip = false;
        subscriptionTier = "free";
        await userDocRef.set(
          {
            isVip: false,
            subscriptionTier: "free",
            vipExpiredAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }

    let daysRemaining = null;
    if (isOwnerOrAdmin) {
      daysRemaining = 9999;
    } else if (isVip && vipExpiresAt) {
      const msLeft = new Date(vipExpiresAt).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    }

    // Fetch user's subscription requests
    const requestsQuery = await adminDb
      .collection("subscription_requests")
      .where("userId", "==", context.uid)
      .limit(10)
      .get();

    const requests: SubscriptionRequest[] = [];
    requestsQuery.forEach((doc) => {
      requests.push({ id: doc.id, ...(doc.data() as Omit<SubscriptionRequest, "id">) });
    });

    // Sort requests in memory by createdAt descending
    requests.sort((a, b) => {
      const aTime = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
      const bTime = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    const latestRequest = requests.length > 0 ? requests[0] : null;

    return withCors(
      req,
      NextResponse.json({
        isVip,
        subscriptionTier,
        vipExpiresAt,
        daysRemaining,
        vipGrantedBy: userData?.vipGrantedBy || null,
        vipGrantedAt: userData?.vipGrantedAt || null,
        vipType: userData?.vipType || (isOwnerOrAdmin ? "gifted" : "paid"),
        requests,
        latestRequest,
      })
    );
  } catch (error) {
    return handleRouteError(req, error);
  }
}
