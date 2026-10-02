import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/zod-schemas";
import { corsOptions, withCors } from "@/lib/server/cors";
import { getRequestContext, handleRouteError } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { logServerError } from "@/lib/server/error-sanitizer";
import { streamAIResponse, ChatHistoryMessage } from "@/lib/aiService";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(req: Request) {
  try {
    let uid = "guest";
    let isOwnerOrVip = false;
    try {
      const context = await getRequestContext(req, { allowMissingProfile: true });
      uid = context.uid;
      const isOwner =
        context.role === "owner" ||
        (context.email && context.email.toLowerCase() === "a7medorabe7@gmail.com");
      const isVipUser = Boolean(
        context.profile?.isVip ||
        context.profile?.subscriptionTier === "vip" ||
        isOwner ||
        context.role === "admin"
      );
      isOwnerOrVip = isVipUser;
    } catch (authError) {
      console.warn(
        "[API /api/chat] Auth context fallback to guest:",
        authError instanceof Error ? authError.message : String(authError)
      );
    }

    // 1. Minute-level burst rate limiter (Owner bypassed)
    if (!isOwnerOrVip) {
      const limiter = await rateLimit({
        key: `api:chat:${uid}`,
        limit: 30,
        windowMs: 60_000,
      });

      if (!limiter.allowed) {
        return withCors(
          req,
          NextResponse.json(
            { error: "Too many chat requests. Please try again shortly." },
            {
              status: 429,
              headers: {
                "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
              },
            }
          )
        );
      }

      // 2. Free-tier daily quota guard (10 messages per 24 hours)
      const todayStr = new Date().toISOString().slice(0, 10);
      const dailyQuota = await rateLimit({
        key: `api:chat:daily_quota:${uid}:${todayStr}`,
        limit: 10,
        windowMs: 86_400_000, // 24 hours
      });

      if (!dailyQuota.allowed) {
        return withCors(
          req,
          NextResponse.json(
            {
              error: "quota_exceeded",
              message:
                "لقد استنفذت الحد اليومي المجاني للمساعد الذكي (10 رسائل/يوم). قم بالترقية إلى باقة العبور بلس (VIP) للاستمتاع بوصول أكاديمي غير محدود طوال الترم.",
              messageEn:
                "You have reached today's free AI support limit (10 messages/day). Upgrade to Obour Plus (VIP) for unlimited academic assistance.",
              upgradeUrl: "/pricing",
              dailyLimit: 10,
            },
            {
              status: 403,
            }
          )
        );
      }
    }

    const json = chatRequestSchema.parse(await req.json());
    const messages = json.messages as ChatHistoryMessage[];

    const stream = streamAIResponse(messages, uid);

    try {
      const { adminDb } = await import("@/lib/server/firebase-admin");
      if (adminDb) {
        const estimatedTokens = Math.max(150, Math.round(JSON.stringify(messages).length / 3));
        await adminDb.collection("logs").add({
          action: "AI_GENERATION",
          type: "qa",
          totalTokens: estimatedTokens,
          userId: uid,
          timestamp: new Date().toISOString(),
          details: `Q&A AI Assistant processed streaming query`,
        });
      }
    } catch {
      // Ignore background log error
    }

    const response = new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });

    return withCors(req, response);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return withCors(req, NextResponse.json({ error: "Invalid chat payload" }, { status: 400 }));
    }

    logServerError("AI Generation Error:", error, { route: "/api/chat" });
    return handleRouteError(req, error);
  }
}
