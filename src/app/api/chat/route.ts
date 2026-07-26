import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/zod-schemas";
import { corsOptions, withCors } from "@/lib/server/cors";
import { getRequestContext, handleRouteError } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { logServerError } from "@/lib/server/error-sanitizer";
import { generateGeminiResponse, ChatHistoryMessage } from "@/lib/aiService";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(req: Request) {
  try {
    let uid = "guest";
    try {
      const context = await getRequestContext(req, { allowMissingProfile: true });
      uid = context.uid;
    } catch (authError) {
      console.warn(
        "[API /api/chat] Auth context fallback to guest:",
        authError instanceof Error ? authError.message : String(authError)
      );
    }

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

    const json = chatRequestSchema.parse(await req.json());
    const messages = json.messages as ChatHistoryMessage[];

    const responseText = await generateGeminiResponse(messages, uid);

    return withCors(req, NextResponse.json({ role: "assistant", content: responseText }));
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return withCors(req, NextResponse.json({ error: "Invalid chat payload" }, { status: 400 }));
    }

    logServerError("AI Generation Error:", error, { route: "/api/chat" });
    return handleRouteError(req, error);
  }
}
