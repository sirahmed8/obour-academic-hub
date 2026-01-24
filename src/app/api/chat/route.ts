import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getAIModel, AIModelProvider, SYSTEM_PROMPT } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

interface RawPart {
  type: string;
  text?: string;
  image?: string;
  [key: string]: unknown;
}

interface RawMessage {
  role: string;
  content: string | RawPart[];
}

type AIMessages = NonNullable<Parameters<typeof generateText>[0]["messages"]>;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = rateLimit(ip);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let messages: RawMessage[] = [];
  let sanitizedMessages: AIMessages = [];

  try {
    const json = await req.json();
    messages = json.messages;
    const model = json.model;

    console.log("AI Request Messages Count:", messages?.length);

    // 1. Prepend System Prompt as a formal Message
    const initialMessages: AIMessages = [{ role: "system", content: SYSTEM_PROMPT }];

    // 2. Map and Sanitize history
    const mappedMessages = messages.map((m: RawMessage) => {
      const role = m.role as "user" | "assistant" | "system";
      let content = m.content;

      if (Array.isArray(content)) {
        const parts = content
          .map((part: RawPart) => {
            if (part && part.type === "image" && part.image)
              return { type: "image", image: part.image };
            if (part && (part.type === "text" || !part.type)) {
              const textVal = typeof part === "string" ? part : part.text;
              if (textVal) return { type: "text", text: textVal };
            }
            return null;
          })
          .filter(
            (p): p is { type: "image"; image: string } | { type: "text"; text: string } =>
              p !== null
          );

        const hasImage = parts.some((p) => p.type === "image");
        content = hasImage ? parts : parts.map((p) => ("text" in p ? p.text : "")).join("\n");
      }

      // Ensure content is a non-empty string if not an array
      if (!content || (Array.isArray(content) && content.length === 0)) content = ".";
      if (typeof content === "string") content = content.trim() || ".";

      return { role, content };
    });

    // 3. Filter out "Invalid" history states
    sanitizedMessages = [
      ...initialMessages,
      ...mappedMessages.filter((m, i) => {
        // Skip leading assistant messages (after our prepended system message)
        if (i === 0 && m.role === "assistant") return false;
        // Skip "error" assistant messages
        if (
          m.role === "assistant" &&
          typeof m.content === "string" &&
          m.content.includes("Sorry, error occurred")
        )
          return false;
        return true;
      }),
    ] as AIMessages;

    const selectedModel = getAIModel(model as AIModelProvider);

    const { text } = await generateText({
      model: selectedModel,
      headers: {
        "HTTP-Referer": "https://obourinstitutes.web.app",
        "X-Title": "Obour Academic Hub",
      },
      messages: sanitizedMessages,
    });

    return NextResponse.json({ role: "assistant", content: text });
  } catch (error: unknown) {
    console.error("AI Generation Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to generate response";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
