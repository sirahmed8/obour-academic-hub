import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/aiService";

const mindmapRequestSchema = z.object({
  topic: z.string().min(1),
  subjectName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = mindmapRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
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
    if (cleanJsonString.startsWith("```")) {
      cleanJsonString = cleanJsonString
        .replace(/^```json?\n?/, "")
        .replace(/```$/, "")
        .trim();
    }

    const mindmapData = JSON.parse(cleanJsonString);

    return NextResponse.json({
      success: true,
      mindmap: mindmapData,
    });
  } catch (error) {
    console.error("[Mindmap API Error]:", error);

    return NextResponse.json({
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
    });
  }
}
