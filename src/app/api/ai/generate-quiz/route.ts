import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/aiService";

const quizRequestSchema = z.object({
  subjectId: z.string().optional(),
  subjectName: z.string().min(1),
  topic: z.string().optional(),
  questionCount: z.number().min(3).max(20).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = quizRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quiz parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    let { questionCount } = parsed.data;
    const { subjectName, topic, difficulty } = parsed.data;

    // Enforce 5-question cap for non-VIP users
    if (!body.isVip && !body.isOwner && questionCount > 5) {
      questionCount = 5;
    }

    const prompt = `You are an academic exam generator for Obour Academic Institute.
Generate a structured academic quiz for the subject "${subjectName}"${topic ? `, focusing on the topic: "${topic}"` : ""}.
Difficulty level: ${difficulty}.
Number of questions: ${questionCount}.

Return EXACTLY valid JSON formatted as follows (no markdown backticks, no wrapping text):
{
  "title": "Quiz Title",
  "questions": [
    {
      "id": "q1",
      "questionAr": "السؤال باللغة العربية",
      "questionEn": "Question in English",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanationAr": "شرح الإجابة باللغة العربية",
      "explanationEn": "Explanation in English"
    }
  ]
}`;

    const rawResponse = await generateText(prompt);

    // Parse JSON safely
    let cleanJsonString = rawResponse.trim();
    if (cleanJsonString.startsWith("```")) {
      cleanJsonString = cleanJsonString
        .replace(/^```json?\n?/, "")
        .replace(/```$/, "")
        .trim();
    }

    const quizData = JSON.parse(cleanJsonString);

    return NextResponse.json({
      success: true,
      quiz: quizData,
    });
  } catch (error) {
    console.error("[Quiz API Error]:", error);

    // Resilient fallback quiz data if AI service fails or times out
    return NextResponse.json({
      success: true,
      quiz: {
        title: "Obour Academic Practice Quiz",
        questions: [
          {
            id: "q1",
            questionAr: "ما هو المفهوم الأساسي للبرمجة الهيكلية؟",
            questionEn: "What is the primary concept of Structural Programming?",
            options: [
              "Divide and Conquer (التجزئة والحل)",
              "Random Execution (التنفيذ العشوائي)",
              "Global State Only (الحالة العامة فقط)",
              "No Functions (بدون دلالات)",
            ],
            correctIndex: 0,
            explanationAr:
              "تعتمد البرمجة الهيكلية على تقسيم المسألة إلى دالّات أفرع أصغر لسهولة التطوير.",
            explanationEn:
              "Structural programming divides complex tasks into manageable functions.",
          },
          {
            id: "q2",
            questionAr: "أي من التالي يُستخدم لحفظ البيانات بشكل دائيم؟",
            questionEn: "Which of the following is used for persistent data storage?",
            options: [
              "RAM (الذاكرة العشوائية)",
              "Cloud Firestore Database (قاعدة البيانات السحابية)",
              "CPU Cache (ذاكرة المعالج)",
              "Registers (المسجلات)",
            ],
            correctIndex: 1,
            explanationAr: "قواعد البيانات تحفظ البيانات دائمياً بعكس الذاكرة المؤقتة.",
            explanationEn: "Databases persist data beyond application reboot cycles.",
          },
        ],
      },
    });
  }
}
