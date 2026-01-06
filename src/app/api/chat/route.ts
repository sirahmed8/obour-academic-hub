import { openai } from "@/lib/ai";
import { streamText } from "ai";

// Using Node.js runtime (default) for static generation compatibility

export async function POST(req: Request) {
  // Simple check for authorization header presence to prevent direct public access
  // For production, you should verify the Firebase ID token here using firebase-admin
  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages, // AI SDK 6.x accepts messages directly
    system:
      "You are the Obour Platform Smart Assistant (المساعد الذكي). You are helpful, friendly, and bilingual (English/Arabic). You assist students with academic queries, platform navigation, and technical issues. Keep responses concise and supportive.",
  });

  return result.toTextStreamResponse();
}
