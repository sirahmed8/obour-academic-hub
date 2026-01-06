import { streamText } from "ai";
import { getAIModel, SYSTEM_PROMPT, AIModelProvider } from "@/lib/ai";
import { NextRequest } from "next/server";
import { chatRequestSchema } from "@/lib/zod-schemas";
import { rateLimit } from "@/lib/rate-limit";

// Force dynamic rendering for this route (streaming requires it)
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Rate Limiting (Basic: 10 requests per minute per IP/Token)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const token = authHeader.split(" ")[1];
    // Use token as key if available (more precise), otherwise IP
    const identifier = token.length > 20 ? token.substring(token.length - 20) : ip;

    const { success, limit, remaining, reset } = rateLimit(identifier);

    if (!success) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }

    const body = await req.json();

    // Validate request body with Zod
    const validationResult = chatRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: validationResult.error.format(),
        }),
        { status: 400 }
      );
    }

    const { messages, model } = validationResult.data;

    // Get the appropriate AI model based on user selection
    const aiModel = getAIModel(model as AIModelProvider);

    // Convert messages to proper format with role typing
    const formattedMessages: ChatMessage[] = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    // Stream the response
    const result = streamText({
      model: aiModel,
      messages: formattedMessages,
      system: SYSTEM_PROMPT,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);

    // Return a helpful error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
