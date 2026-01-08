import { KNOWLEDGE_BASE } from "./knowledgeBase";
import { BotResponse, QA } from "./types";
import { getSimilarity, normalizeArabic } from "./utils";

// Self-exporting comment removed to prevent recursion error

// ----------------------------------------------------------------------
// Matching Logic
// ----------------------------------------------------------------------
function findBestMatch(input: string): QA | null {
  const normInput = normalizeArabic(input);
  let bestMatch: QA | null = null;
  let highestScore = 0;

  for (const qa of KNOWLEDGE_BASE) {
    for (const q of qa.questions) {
      const normQ = normalizeArabic(q);

      // Exact word match check
      if (normInput.includes(normQ) || normQ.includes(normInput)) {
        // If the query is extremely short (like "hi"), require high similarity
        if (normInput.length < 3 && normQ.length < 3) {
          const score = getSimilarity(normInput, normQ);
          if (score > highestScore) {
            highestScore = score;
            bestMatch = qa;
          }
        } else {
          // Boost score for inclusion - Higher confidence for direct matches
          const score = 0.9;
          if (score > highestScore) {
            highestScore = score;
            bestMatch = qa;
          }
        }
      }

      // Fuzzy match
      const score = getSimilarity(normInput, normQ);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = qa;
      }
    }
  }

  // Very low threshold to maximize coverage - 0.2 ensures we catch more queries
  return highestScore > 0.2 ? bestMatch : null;
}

// ----------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------
export async function getLocalBotResponse(
  input: string,
  language: "ar" | "en" = "ar"
): Promise<BotResponse> {
  // 1. Check for Task Creation Intent
  const taskDetails = extractTaskDetails(input);
  if (taskDetails) {
    return {
      text:
        language === "ar"
          ? `هل تريد إنشاء مهمة: "${taskDetails.title}"؟`
          : `Do you want to create task: "${taskDetails.title}"?`,
      confidence: 0.9,
      action: "confirm_task",
      taskData: taskDetails,
    };
  }

  const match = findBestMatch(input);

  if (match) {
    const arAnswer = match.answer.ar;
    const enAnswer = match.answer.en;

    const text =
      language === "ar"
        ? Array.isArray(arAnswer)
          ? arAnswer[Math.floor(Math.random() * arAnswer.length)]
          : arAnswer
        : Array.isArray(enAnswer)
          ? enAnswer[Math.floor(Math.random() * enAnswer.length)]
          : enAnswer;

    return {
      text,
      confidence: 1, // High confidence since it matched rules
      suggestions: language === "ar" ? match.suggestions?.ar : match.suggestions?.en,
    };
  }

  // Check if user wants live support
  if (wantsLiveSupport(input)) {
    return {
      text:
        language === "ar"
          ? "بالتأكيد! يمكنك التحدث مع فريق الدعم المباشر. اضغط على زر 'LIVE CHAT' في الأعلى للتحويل. 💬"
          : "Of course! You can talk to our live support team. Click the 'LIVE CHAT' button above to switch. 💬",
      confidence: 1,
      action: "live_chat",
    };
  }

  // Fallback: Bot doesn't understand - offer live support
  return {
    text:
      language === "ar"
        ? "عذراً، لم أفهم سؤالك بشكل واضح. 🤔\nهل تريدني أحولك للدعم المباشر؟ فريقنا سيساعدك بشكل أفضل!"
        : "Sorry, I didn't quite understand your question. 🤔\nWould you like me to connect you with live support? Our team can help you better!",
    confidence: 0.3,
    suggestions:
      language === "ar"
        ? ["تحويل للدعم المباشر", "المواد الدراسية", "مشكلة تقنية"]
        : ["Switch to Live Support", "Subjects", "Technical Issue"],
  };
}

// ----------------------------------------------------------------------
// NLP Logic
// ----------------------------------------------------------------------

function extractTaskDetails(
  input: string
): { title: string; priority: string; repeat?: string } | null {
  const norm = normalizeArabic(input);
  const lower = input.toLowerCase();

  const intents = [
    "remind me to",
    "remind me",
    "create task",
    "add task",
    "new task",
    "i have a task",
    "todo",
    "ذكرني",
    "تذكير",
    "مهمة جديدة",
    "اضافة مهمة",
    "عندي مهمة",
    "سجل مهمة",
  ];

  if (!intents.some((i) => norm.includes(i) || lower.includes(i))) {
    return null;
  }

  // Extract Title
  // Try to remove the trigger phrase
  let title = input;
  // Simple replace of matched intent
  for (const intent of intents) {
    const idx = lower.indexOf(intent);
    if (idx !== -1) {
      // If "remind me to study", remove "remind me to"
      // If "create task study", remove "create task"
      // We prefer the longest match roughly
      // This is a naive heuristic
      if (input.length > intent.length + 5) {
        // ensure we don't just match "remind me" inside a sentence randomly if possible, but here we assume intent is prefix usually
      }
      // Actually better to just look for the first occurrence?
    }
  }

  // Cleaner extraction:
  // Remove the triggering phrase from the start if possible
  for (const intent of intents) {
    if (norm.startsWith(intent) || lower.startsWith(intent)) {
      title = input.slice(intent.length).trim();
      break;
    }
  }

  // Remove "to" or "b-" (بـ) if remaining
  if (title.toLowerCase().startsWith("to ")) title = title.slice(3).trim();
  if (title.startsWith("بـ") || title.startsWith("ب ")) title = title.slice(2).trim();

  if (title.length < 2) return null; // Too short to be a real task

  // Extract Priority
  let priority = "medium";
  if (
    lower.includes("urgent") ||
    lower.includes("important") ||
    lower.includes("high priority") ||
    norm.includes("عاجل") ||
    norm.includes("مهم") ||
    norm.includes("ضروري")
  ) {
    priority = "high";
  }

  // Extract Repeat
  let repeat = "none";
  if (
    lower.includes("daily") ||
    lower.includes("every day") ||
    norm.includes("يومي") ||
    norm.includes("كل يوم")
  ) {
    repeat = "daily";
  } else if (lower.includes("weekly") || norm.includes("اسبوعي") || norm.includes("كل اسبوع")) {
    repeat = "weekly";
  }

  return { title, priority, repeat };
}

export function wantsLiveSupport(input: string): boolean {
  const norm = normalizeArabic(input);
  const keywords = [
    "human",
    "person",
    "support",
    "live",
    "talk",
    "chat",
    "دعم",
    "مباشر",
    "انسان",
    "موظف",
    "تحدث",
    "شات",
    "لايف",
    "ادمن",
    "admin",
  ];
  return keywords.some((k) => norm.includes(k));
}

export function needsHelpSuggestion(input: string): boolean {
  const norm = normalizeArabic(input);
  const keywords = ["help", "what", "how", "مساعدة", "كيف", "ماذا", "ليه", "why"];
  return keywords.some((k) => norm.includes(k));
}
