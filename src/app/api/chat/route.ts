import { streamText } from "ai";
import { getAIModel, SYSTEM_PROMPT, AIModelProvider } from "@/lib/ai";
import { NextRequest } from "next/server";

// Edge runtime for streaming
export const runtime = "edge";

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

    const body = await req.json();
    const { messages, model = "balanced" } = body as {
      messages: { role: string; content: string }[];
      model?: AIModelProvider;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages required", { status: 400 });
    }

    // Get the appropriate AI model based on user selection
    const aiModel = getAIModel(model);

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
