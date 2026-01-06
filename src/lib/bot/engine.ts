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

  // Lower threshold to 0.3 for better coverage
  return highestScore > 0.3 ? bestMatch : null;
}

// ----------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------
export async function getLocalBotResponse(
  input: string,
  language: "ar" | "en" = "ar",
  // _token is reserved for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _token?: string
): Promise<BotResponse> {
  const match = findBestMatch(input);

  if (match) {
    return {
      text: language === "ar" ? match.answer.ar : match.answer.en,
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
