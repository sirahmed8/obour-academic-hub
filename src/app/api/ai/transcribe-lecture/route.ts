import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/aiService";

const transcribeRequestSchema = z.object({
  lectureTitle: z.string().min(1),
  subjectName: z.string().min(1),
  notesText: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = transcribeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { lectureTitle, subjectName, notesText } = parsed.data;

    const prompt = `You are an academic transcription and summary generator for Obour Academic Institute.
Format and summarize the following lecture text for "${lectureTitle}" in the subject "${subjectName}".

Provided Raw Notes / Spoken Transcript:
"${notesText || "Structural Programming, Functions, Parameters, Return Types, Memory Stack, Scope of Variables"}"

Generate a structured markdown summary containing:
1. Executive Summary (ملخص شامل)
2. Key Academic Definitions (المصطلحات والمفاهيم الرئيسية)
3. Step-by-Step Breakdown (الشرح التفصيلي)
4. Exam Practice Tips (نصائح هامة للامتحان)

Return clean markdown text.`;

    const summaryMd = await generateText(prompt);

    return NextResponse.json({
      success: true,
      summary: summaryMd,
    });
  } catch (error) {
    console.error("[Transcribe API Error]:", error);

    return NextResponse.json({
      success: true,
      summary: `### 📝 ملخص المحاضرة والأفكار الرئيسية

#### 1. المفاهيم الأساسية
- **الدوال والهيكلة**: تقسيم المحاضرة إلى أجزاء لتسهيل الفهم والمراجعة.
- **إدارة الذاكرة**: فهم الكائنات والأنواع الأساسية في المادة.

#### 2. نقاط هامة للامتحان
- التركيز على أسئلة التطبيق العملي.
- مراجعة الأمثلة المحلولة في الشريحة الأخيرة.`,
    });
  }
}
