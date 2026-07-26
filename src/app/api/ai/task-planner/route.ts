import { NextResponse } from "next/server";
import { corsOptions, withCors } from "@/lib/server/cors";
import { getRequestContext, handleRouteError } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { logServerError } from "@/lib/server/error-sanitizer";
import {
  generateGeminiResponse,
  ChatHistoryMessage,
  TASK_PLANNER_SYSTEM_PROMPT,
} from "@/lib/aiService";

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
    } catch {
      // Guest fallback
    }

    const limiter = await rateLimit({
      key: `api:task-planner:${uid}`,
      limit: 40,
      windowMs: 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Too many task planner requests. Please try again shortly." },
          { status: 429 }
        )
      );
    }

    const body = await req.json();
    const messages = (body.messages || []) as ChatHistoryMessage[];

    const responseText = await generateGeminiResponse(messages, uid, TASK_PLANNER_SYSTEM_PROMPT);

    return withCors(req, NextResponse.json({ role: "assistant", content: responseText }));
  } catch (error: unknown) {
    logServerError("Task Planner API Error:", error, { route: "/api/ai/task-planner" });
    return handleRouteError(req, error);
  }
}
