import { NextResponse } from "next/server";
import { z } from "zod";
import { corsOptions, withCors } from "@/lib/server/cors";
import { getRequestContext } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { logServerError } from "@/lib/server/error-sanitizer";
import { adminDb } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

const waitlistSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2).max(100).optional(),
  gateway: z.string().min(2).max(50).default("card_online"),
  plan: z.enum(["monthly", "semester", "annual"]).default("semester"),
  notes: z.string().max(300).optional(),
});

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(req: Request) {
  try {
    let uid = "guest";
    try {
      const context = await getRequestContext(req, { allowMissingProfile: true });
      uid = context.uid;
    } catch {
      // Allow guest registrations for waitlist
    }

    const limiter = await rateLimit({
      key: `waitlist:${uid}`,
      limit: 5,
      windowMs: 600_000, // 5 requests per 10 minutes
    });

    if (!limiter.allowed) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Too many requests. Please wait a few minutes before trying again." },
          { status: 429 }
        )
      );
    }

    const body = await req.json();
    const validated = waitlistSchema.parse(body);

    if (adminDb) {
      await adminDb.collection("subscription_waitlist").add({
        email: validated.email.trim().toLowerCase(),
        name: validated.name?.trim() || null,
        gateway: validated.gateway,
        plan: validated.plan,
        notes: validated.notes?.trim() || null,
        userId: uid !== "guest" ? uid : null,
        createdAt: new Date().toISOString(),
        status: "pending",
        source: "pricing_priority_access",
      });
    }

    return withCors(
      req,
      NextResponse.json({
        success: true,
        message:
          "تم تسجيلك في قائمة أسبقية الوصول بنجاح! سنقوم بإشعارك فور تفعيل بوابات الدفع الإلكتروني المباشر.",
        messageEn:
          "You have been added to the priority access waitlist! We will notify you immediately once direct card checkout is live.",
      })
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return withCors(
        req,
        NextResponse.json({ error: "Invalid waitlist payload data" }, { status: 400 })
      );
    }

    logServerError("Waitlist submission failed", error, { route: "/api/subscriptions/waitlist" });
    return withCors(
      req,
      NextResponse.json(
        { error: "Internal server error registering for waitlist" },
        { status: 500 }
      )
    );
  }
}
