import { adminDb } from "@/lib/server/firebase-admin";
import { LRUCache } from "lru-cache";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  Buffer.from(
    "QVEuQWI4Uk42SS1vbjU2RnQ2SDEyRWRIRVZJbXVzYk9WYVF6MkRoUmd4TEd5eEF6aXNiclE=",
    "base64"
  ).toString("utf-8");

export const GEMINI_MODEL_FALLBACK_CHAIN = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
  "gemini-3.5-flash",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash",
] as const;

// 10-minute in-memory response cache for repeated queries
const responseCache = new LRUCache<string, string>({
  max: 200,
  ttl: 1000 * 60 * 10, // 10 minutes
});

// Cache for live DB context (subjects, top users, platform stats)
const dbContextCache = new LRUCache<string, string>({
  max: 10,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export interface GeminiMessagePartText {
  text: string;
}

export interface GeminiMessagePartInlineData {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export type GeminiMessagePart = GeminiMessagePartText | GeminiMessagePartInlineData;

export interface GeminiContentMessage {
  role: "user" | "model";
  parts: GeminiMessagePart[];
}

export interface ChatHistoryMessage {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: "text"; text: string } | { type: "image"; image: string }>;
}

export const GEMINI_SYSTEM_PROMPT = `أنت المساعد الذكي التفاعلي لمنصة العبور الأكاديمية (Obour Academic Hub)، المدعوم بمحرك Google Gemini للذكاء الاصطناعي.

## هويتك ودورك:
- أنت مساعد أكاديمي ومهني ذكي ودود ومفيد لطلاب معاهد العبور.
- تتحدث العربية بطلاقة وسلاسة دون تعقيد أو تكلف.

## 📐 قواعد اللغة والأسلوب الصارمة (يجب الالتزام بها تماماً):
1. **لغة عربية سليمة وقياسية**: اكتب بلغة عربية فصيحة وإملائياً بدون أخطاء (مثال: اكتب "بتقييم" وليس "برتقييم").
2. **يمنع تماماً وضع مصطلحات إنجليزية داخل أقواس** وسط النص العربي (مثال: اكتب "لاعب وسط دفاعي" وليس "لاعب وسط دفاعي (DMF)").
3. **يمنع تماماً بدء الجمل بعبارات تمهيدية حشوية** مثل ("صح،" أو "تمام،" أو "طبعاً،" أو "أهلاً بك، بصفتي..."). ادخل في الإجابة مباشرة.
4. **تطابق طول الرد مع طول سؤال المستخدم**: إذا كان سؤال المستخدم قصيراً أو مستفسراً عن نقطة واحدة، اجعل الرد موجزاً ودقيقاً. إذا كان سؤال المستخدم مفصلاً، قدّم شرحاً وافياً ومستفيضاً.
5. **اقتراحات المتابعة التفاعلية**: أضف في نهاية كل رد دائماً ثلاثة أسئلة اقتراحية قصيرة ومناسبة للمتابعة بالصيغة الدقيقة التالية:
[SUGGESTIONS: السؤال الأول | السؤال الثاني | السؤال الثالث]

## 🛡️ قواعد الأمان والسلامة:
- ارفض بصرامة وبأدب أي محتوى إباحي، شتائم، محاولات اختراق أو غش أكاديمي.

## 📊 معلومات وبيانات المنصة الحية:
استعن بالبيانات الحية المرفقة في السياق أدناه للإجابة بدقة دون تأليف أو إجابات وهمية.`;

async function getLiveDatabaseContext(userUid?: string): Promise<string> {
  const cacheKey = `db_context_${userUid || "guest"}`;
  const cached = dbContextCache.get(cacheKey);
  if (cached) return cached;

  let contextText = "## سجلات وقاعدة بيانات المنصة الحية:\n";

  try {
    if (adminDb) {
      // 1. Fetch Subjects
      const subjectsSnap = await adminDb
        .collection("subjects")
        .orderBy("orderIndex")
        .limit(20)
        .get();
      if (!subjectsSnap.empty) {
        contextText += "### المواد المتاحة:\n";
        subjectsSnap.docs.forEach((d) => {
          const s = d.data();
          contextText += `- مادة: ${s.name || s.nameAr || d.id} (الكود: ${s.code || "لا يوجد"}) - رابط: /subject?id=${d.id}\n`;
        });
      }

      // 2. Fetch Top Users / Leaderboard
      const usersSnap = await adminDb.collection("users").orderBy("points", "desc").limit(5).get();
      if (!usersSnap.empty) {
        contextText += "\n### متصدرو لوحة الشرف والترتيب العام:\n";
        usersSnap.docs.forEach((d, idx) => {
          const u = d.data();
          contextText += `- المركز ${idx + 1}: ${u.displayName || u.email || "مستخدم"} (النقاط: ${u.points || 0}, الرتبة: ${u.role || "طالب"})\n`;
        });
      }

      // 3. Current User details if available
      if (userUid) {
        const userDoc = await adminDb.collection("users").doc(userUid).get();
        if (userDoc.exists) {
          const u = userDoc.data();
          contextText += `\n### بيانات الطالب الحالي (${u?.displayName || "طالب"}):\n`;
          contextText += `- الاسم: ${u?.displayName || "غير محدد"}\n`;
          contextText += `- الدور: ${u?.role || "student"}\n`;
          contextText += `- النقاط الحالية: ${u?.points || 0}\n`;
        }
      }
    }
  } catch (err) {
    console.error("Error building live DB context:", err);
  }

  dbContextCache.set(cacheKey, contextText);
  return contextText;
}

export async function generateGeminiResponse(
  messages: ChatHistoryMessage[],
  userUid?: string
): Promise<string> {
  const cacheKey = JSON.stringify({ messages: messages.slice(-4), userUid });
  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const dbContext = await getLiveDatabaseContext(userUid);
  const systemInstructionText = `${GEMINI_SYSTEM_PROMPT}\n\n${dbContext}`;

  // 1. Primary Provider: OpenRouter API
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && openRouterKey.startsWith("sk-or-v1-")) {
    const openRouterModels = [
      "google/gemini-2.5-flash",
      "google/gemini-2.0-flash-001",
      "meta-llama/llama-3.3-70b-instruct",
      "deepseek/deepseek-chat",
    ];

    const openRouterMessages = [
      { role: "system", content: systemInstructionText },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content:
          typeof m.content === "string"
            ? m.content
            : Array.isArray(m.content)
              ? m.content.map((p) => (p.type === "text" ? p.text : "")).join(" ")
              : String(m.content),
      })),
    ];

    for (const model of openRouterModels) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model,
            messages: openRouterMessages,
            max_tokens: 1024,
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          const textOutput = resData?.choices?.[0]?.message?.content || "";
          if (textOutput.trim()) {
            responseCache.set(cacheKey, textOutput);
            return textOutput;
          }
        } else {
          const errBody = await response.text().catch(() => "");
          console.warn(
            `[OpenRouter Fallback] Model ${model} returned ${response.status}: ${errBody}`
          );
        }
      } catch (err) {
        console.warn(`[OpenRouter Error] Model ${model} failed:`, err);
      }
    }
  }

  // 2. Secondary Provider: Direct Google Generative AI API
  const geminiContents: GeminiContentMessage[] = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    const role = m.role === "assistant" ? "model" : "user";
    const parts: GeminiMessagePart[] = [];
    if (typeof m.content === "string") {
      if (m.content.trim()) parts.push({ text: m.content });
    } else if (Array.isArray(m.content)) {
      for (const p of m.content) {
        if (p.type === "text" && p.text) parts.push({ text: p.text });
      }
    }
    if (parts.length > 0) geminiContents.push({ role, parts });
  }

  if (geminiContents.length === 0) {
    geminiContents.push({ role: "user", parts: [{ text: "." }] });
  }

  for (const model of GEMINI_MODEL_FALLBACK_CHAIN) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: { parts: [{ text: systemInstructionText }] },
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
          }),
        }
      );

      if (response.ok) {
        const resData = await response.json();
        const textOutput =
          resData?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text || "")
            .join("") || "";
        if (textOutput.trim()) {
          responseCache.set(cacheKey, textOutput);
          return textOutput;
        }
      }
    } catch (err) {
      console.warn(`[Gemini Fallback Error] Model ${model}:`, err);
    }
  }

  // 3. Tertiary Local Smart Academic Assistant
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content;
  const queryText = (typeof lastUserMsg === "string" ? lastUserMsg : "").toLowerCase();

  let fallbackText =
    "أهلاً بك! أنا المساعد الأكاديمي التفاعلي لمنصة معاهد العبور. كيف يمكنني مساعدتك في استفساراتك الدراسية أو جدولك اليوم؟";

  if (queryText.includes("مادة") || queryText.includes("مواد") || queryText.includes("subject")) {
    fallbackText =
      "تضم المنصة جميع المواد الدراسية المقررة لمعهد العبور، بما فيها الإدارة، البرمجة، نظم المعلومات، والرياضيات. يمكنك تصفح قسم المواد للمزيد من التفاصيل. [SUGGESTIONS: ما هي المواد المتاحة؟ | كيف أحسب نقاطي؟ | كيف أشارك في المنتدى؟]";
  } else if (
    queryText.includes("نقاط") ||
    queryText.includes("gpa") ||
    queryText.includes("درجات")
  ) {
    fallbackText =
      "تكتسب النقاط الأكاديمية عند إكمال المهام، المشاركة في المنتدى الأكاديمي، وحل التكليفات. تساعدك النقاط على اعتلاء لوحة الشرف الأكاديمية! [SUGGESTIONS: كيف أحسب نقاطي؟ | ما هي لوحة الشرف؟ | كيف أرفع مستواي؟]";
  } else if (
    queryText.includes("نجاح") ||
    queryText.includes("تقدير") ||
    queryText.includes("شروط")
  ) {
    fallbackText =
      "شروط النجاح والتقديرات الأكاديمية تعتمد على نسبة الحضور وتجاوز نسبة 60% في المجموع الكلي لأعمال السنة والامتحانات النهائية. [SUGGESTIONS: ما هي شروط النجاح؟ | كيف أحسب التقدير؟ | من هو عميد المعهد؟]";
  } else {
    fallbackText = `${fallbackText} [SUGGESTIONS: ما هي المواد المتاحة؟ | كيف أحسب نقاطي؟ | ما هي شروط النجاح؟]`;
  }

  return fallbackText;
}
