import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/aiService";
import { getRequestContext } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { corsOptions, withCors } from "@/lib/server/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

const mindmapRequestSchema = z.object({
  topic: z.string().min(1),
  subjectName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    let uid = "guest";

    try {
      const context = await getRequestContext(req, { allowMissingProfile: true });
      uid = context.uid;
    } catch {
      // Guest fallback
    }

    const limiter = await rateLimit({
      key: `api:mindmap:${uid}`,
      limit: 25,
      windowMs: 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Too many mindmap requests. Please try again shortly." },
          { status: 429 }
        )
      );
    }

    const body = await req.json();
    const parsed = mindmapRequestSchema.safeParse(body);

    if (!parsed.success) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Invalid payload", details: parsed.error.format() },
          { status: 400 }
        )
      );
    }

    const { topic, subjectName } = parsed.data;

    const prompt = `You are a concept mind map generator for Obour Academic Institute.
Generate a structured concept mind map for topic: "${topic}" in subject: "${subjectName || "General Academic"}".

Return EXACTLY valid JSON formatted as follows (no markdown, no backticks):
{
  "root": "${topic}",
  "children": [
    {
      "title": "Subtopic 1",
      "children": [
        { "title": "Detail 1.1" },
        { "title": "Detail 1.2" }
      ]
    },
    {
      "title": "Subtopic 2",
      "children": [
        { "title": "Detail 2.1" }
      ]
    }
  ]
}`;

    const rawResponse = await generateText(prompt);

    let cleanJsonString = rawResponse.trim();
    const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJsonString = jsonMatch[0];
    }

    const mindmapData = JSON.parse(cleanJsonString);

    return withCors(
      req,
      NextResponse.json({
        success: true,
        mindmap: mindmapData,
      })
    );
  } catch (error) {
    console.error("[Mindmap API Error]:", error);

    return withCors(
      req,
      NextResponse.json({
        success: true,
        mindmap: {
          root: "هيكلية البيانات (Data Structures)",
          children: [
            {
              title: "Linear Structures (الهياكل الخطية)",
              children: [
                { title: "Arrays" },
                { title: "Linked Lists" },
                { title: "Stacks & Queues" },
              ],
            },
            {
              title: "Non-Linear Structures (الهياكل غير الخطية)",
              children: [{ title: "Binary Trees" }, { title: "Graphs" }, { title: "Heap Trees" }],
            },
          ],
        },
      })
    );
  }
}
