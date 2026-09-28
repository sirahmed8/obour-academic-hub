import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, requirePermission } from "@/lib/server/auth";
import { corsOptions, withCors } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebase-admin";
import { SubscriptionRequest } from "@/types";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "manage_users");

    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status"); // "pending", "approved", "rejected", or null/all

    const query = adminDb.collection("subscription_requests");
    const snapshot = await query.get();

    let totalRevenueEGP = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let monthlyRevenueEGP = 0;

    const allRequests: SubscriptionRequest[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<SubscriptionRequest, "id">;
      const item: SubscriptionRequest = { id: doc.id, ...data };
      allRequests.push(item);

      if (item.status === "pending") {
        pendingCount++;
      } else if (item.status === "approved") {
        approvedCount++;
        const amt = Number(item.amount) || 0;
        totalRevenueEGP += amt;

        const reqTime = typeof item.createdAt === "string" ? new Date(item.createdAt).getTime() : 0;
        if (reqTime >= thirtyDaysAgo) {
          monthlyRevenueEGP += amt;
        }
      } else if (item.status === "rejected") {
        rejectedCount++;
      }
    });

    // Sort requests by createdAt descending
    allRequests.sort((a, b) => {
      const aTime = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
      const bTime = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    const filteredRequests =
      filterStatus && filterStatus !== "all"
        ? allRequests.filter((r) => r.status === filterStatus)
        : allRequests;

    return withCors(
      req,
      NextResponse.json({
        requests: filteredRequests,
        stats: {
          totalRequests: allRequests.length,
          pendingCount,
          approvedCount,
          rejectedCount,
          totalRevenueEGP,
          monthlyRevenueEGP,
        },
      })
    );
  } catch (error) {
    return handleRouteError(req, error);
  }
}
