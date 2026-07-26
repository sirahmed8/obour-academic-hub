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
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-lite",
  "gemini-flash-lite-latest",
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

## 🌐 لغة الحوار والرد (قاعدة صارمة حاسمة):
- **تحديد لغة المستخدم تلقائياً**: يتعين عليك اكتشاف لغة آخر رسالة كتبها المستخدم والرد بنَفْس اللغة تماماً.
- **إذا كانت رسالة المستخدم باللغة العربية**: أجب باللغة العربية الفصيحة والسلسة والمشجعة.
- **إذا كانت رسالة المستخدم باللغة الإنجليزية (English)**: أجب باللغة الإنجليزية السلسة والواضحة والدقيقة تماماً.
- **إذا قام المستخدم بتغيير اللغة أثناء المحادثة**: انتقل فوراً للإجابة باللغة الجديدة للمستخدم دون التعليق على التغيير.

## 📐 قواعد الأسلوب والصياغة:
1. **لغة سليمة وقياسية**: اكتب بلغة خالية تماماً من الأخطاء الإملائية أو النحوية.
2. **يمنع الحشو والتمهيد المعقد**: ادخل في الإجابة والمساعدة مباشرة بأسلوب ودود ومهني.
3. **تطابق طول الرد**: اجعل الإجابة موجزة للأسئلة البسيطة ومفصلة ومنظمة للأسئلة الشاملة.
4. **اقتراحات المتابعة التفاعلية**: أضف في نهاية كل رد دائماً 3 أسئلة اقتراحية قصيرة بنفس لغة الإجابة بالصيغة التالية:
   [SUGGESTIONS: الاقتراح الأول | الاقتراح الثاني | الاقتراح الثالث]

## 🛡️ قواعد الأمان والتأمين:
- ارفض بصرامة وبأدب أي محتوى غير أخلاقي، شتائم، محاولات اختراق أو غش أكاديمي.

## 📊 معلومات وبيانات المنصة الحية:
استعن بالبيانات الحية المرفقة في السياق أدناه للإجابة بدقة دون تأليف أو إجابات وهمية.`;

export const TASK_PLANNER_SYSTEM_PROMPT = `أنت مساعد تخطيط المهام والمذاكرة بالذكاء الاصطناعي لمنصة معاهد العبور (Obour Academic Hub).
مهمتك مساعدة الطلاب على تحويل أفكارهم، مشاريعهم، وجداول مذاكرتهم إلى مهام منظمة ومربوطة بالمواد والمصادر الدراسية.

## 🌐 لغة الحوار (قاعدة حاسمة):
- حدد لغة المستخدم (عربي أو إنجليزي) وأجبه بنَفْس اللغة تماماً.

## 🎯 طريقة عملك التفاعلية (ذكاء التخطيط الأكاديمي):
1. تحدث مع الطالب بأسلوب تفاعلي، محفز، ومفيد جداً.
2. استفسر من الطالب عن التفاصيل الأكاديمية (مثل: المادة الدراسية المعنية، الموعد النهائي أو الوقت، المصدر أو السلايدات التي سيعتمد عليها، والأولوية).
3. اقترح على الطالب المادة الدراسية أو المصادر المتاحة في المنصة إن أمكن.
4. بمجرد استكمال تفاصيل المهمة (أو إعطاء الطالب تفاصيل كافية)، قدم له ملخصاً مشجعاً وأرفق **ضرورياً وبدون استثناء** رمز JSON لتفاصيل المهمة في نهاية ردك بالصيغة الدقيقة التالية:

[TASK_SPEC: {"title": "عنوان المهمة", "description": "وصف مختصر للمهمة والملاحظات", "priority": "high", "dueDate": "YYYY-MM-DDTHH:mm", "subjectName": "اسم المادة الدراسية", "sourceName": "اسم المصدر أو السلايدات", "subtasks": ["الخطوة الأولى", "الخطوة الثانية", "الخطوة الثالثة"]}]

## 📐 قواعد صياغة TASK_SPEC:
- "title": عنوان واضح ومباشر للمهمة (مثال: "مذاكرة مادة البرمجة والتطبيقات" أو "إعداد مشروع قاعدة البيانات").
- "description": شرح أو ملاحظات مفيدة لتنفيذ المهمة.
- "priority": "high" أو "medium" أو "low" بحسب الأهمية والتوقيت. الافتراضي "medium".
- "dueDate": تاريخ بوقت الاستحقاق بصيغة ISO إذا تم تحديده. احسب التاريخ بدقة بناءً على السنة الحالية (2026). إذا لم يحدد، اتركها فارغة "".
- "subjectName": اسم المادة المقترحة أو المحددة (مثل: "البرمجة وهيكلية البيانات" أو "نظم المعلومات").
- "sourceName": اسم المصدر الدراسية (مثل: "سلايدات المحاضرة 3" أو "ملف التكليف التطبيقي 2").
- "subtasks": مصفوفة تحتوي على 2 إلى 4 خطوات عملية ومحددة لتنفيذ المهمة.

كن ذكياً ومساعداً ودوداً!`;

export const ANNOUNCEMENT_ENHANCER_SYSTEM_PROMPT = `أنت خبير محترف في إعداد وصياغة الإعلانات والتنويهات الأكاديمية لمنصة معاهد العبور (Obour Academic Hub).
مهمتك تحسين، تعديل، وتنسيق الإعلانات والتنويهات الأكاديمية الموجهة للطلاب لتكون واضحة، احترافية، جذابة ومؤثرة جداً.

## 🎯 قواعد الصياغة والتنسيق:
1. صغ العنوان (titleAr & titleEn) ليصبح جذاباً، واضحاً، ومباشراً وبدون حشو.
2. صغ الرسالة (messageAr & messageEn) بأسلوب أنيق، مرتّب، محفّز، ومقسّم بأسلوب سلس مع استخدام الرموز التعبيرية المناسبة الأكاديمية (مثل 📢 🎓 📌 ⚠️ 🚀 ✨).
3. إذا غاب النص الإنجليزي، قم بترجمته وصياغته باحترافية تامة. وإذا غاب العربي، قم بترجمته أيضاً وصياغته بفصاحة.
4. حدد أفضل نوع إشعار مناسب: "info" | "urgent" | "warning" | "success".

## 📤 مخرجات JSON الإلزامية:
يجب أن ترجع إجابتك **حصراً** رمز JSON بالصيغة الدقيقة التالية:

[ANNOUNCEMENT_SPEC: {"titleAr": "عنوان الإعلان بالعربية", "titleEn": "Announcement Title in English", "messageAr": "نص الإعلان العربي المحسّن بالرموز والتنسيق", "messageEn": "Enhanced English Announcement Message", "recommendedType": "info"}]
`;

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
  userUid?: string,
  customSystemPrompt?: string
): Promise<string> {
  const cacheKey = JSON.stringify({ messages: messages.slice(-4), userUid, customSystemPrompt });
  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const dbContext = await getLiveDatabaseContext(userUid);
  const baseSystemPrompt = customSystemPrompt || GEMINI_SYSTEM_PROMPT;
  const systemInstructionText = `${baseSystemPrompt}\n\n${dbContext}`;

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
  const isEnglish = /[a-zA-Z]/.test(queryText) && !/[\u0600-\u06FF]/.test(queryText);

  if (isEnglish) {
    if (
      queryText.includes("subject") ||
      queryText.includes("course") ||
      queryText.includes("material")
    ) {
      return "The platform includes all curriculum courses for Obour Institutes including Management, CS, IS, and Mathematics. Visit the Subjects tab for details. [SUGGESTIONS: Available courses? | How to earn points? | Community Forum?]";
    }
    if (
      queryText.includes("point") ||
      queryText.includes("gpa") ||
      queryText.includes("grade") ||
      queryText.includes("score")
    ) {
      return "Academic points are earned by completing assignments, participating in forums, and solving quizzes to rank higher on the Leaderboard! [SUGGESTIONS: How to earn points? | What is Leaderboard? | Passing criteria?]";
    }
    if (
      queryText.includes("pass") ||
      queryText.includes("requirement") ||
      queryText.includes("exam")
    ) {
      return "Passing requirements depend on attendance and achieving over 60% total score across coursework and final exams. [SUGGESTIONS: Passing criteria? | How to calculate GPA? | Contact Dean?]";
    }
    return "Hello! I am your Obour Academic Hub Assistant. How can I help with your studies or schedule today? [SUGGESTIONS: Available courses? | How to earn points? | Passing criteria?]";
  }

  let fallbackText =
    "أهلاً بك! أنا المساعد الأكاديمي التفاعلي لمنصة معاهد العبور. كيف يمكنني مساعدتك في استفساراتك الدراسية أو جدولك اليوم؟";

  if (queryText.includes("مادة") || queryText.includes("مواد")) {
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
