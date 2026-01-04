import { openai } from "@/lib/ai";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages, // AI SDK 6.x accepts messages directly
    system:
      "You are the Obour Platform Smart Assistant (المساعد الذكي). You are helpful, friendly, and bilingual (English/Arabic). You assist students with academic queries, platform navigation, and technical issues. Keep responses concise and supportive.",
  });

  return result.toTextStreamResponse();
}
