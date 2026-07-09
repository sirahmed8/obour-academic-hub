import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getAIModel, AIModelProvider, SYSTEM_PROMPT } from "@/lib/ai";
import { chatRequestSchema } from "@/lib/zod-schemas";
import { corsOptions, withCors } from "@/lib/server/cors";
import { getRequestContext, handleRouteError } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { logServerError } from "@/lib/server/error-sanitizer";
import { adminDb } from "@/lib/server/firebase-admin";
import { Subject, Resource } from "@/types";

interface RawPart {
  type: string;
  text?: string;
  image?: string;
  [key: string]: unknown;
}

interface RawMessage {
  role: string;
  content: string | RawPart[];
}

type AIMessages = NonNullable<Parameters<typeof generateText>[0]["messages"]>;

import { LRUCache } from "lru-cache";

// Cache for subjects and resources to avoid repeated full-table scans
const cache = new LRUCache<string, Subject[] | Resource[]>({
  max: 100,
  ttl: 1000 * 60 * 60, // 1 hour
});

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(req: Request) {
  let messages: RawMessage[] = [];
  let sanitizedMessages: AIMessages = [];

  try {
    const context = await getRequestContext(req, { allowMissingProfile: true });
    const limiter = await rateLimit({
      key: `api:chat:${context.uid}`,
      limit: 20,
      windowMs: 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Too many chat requests. Please try again shortly." },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
            },
          }
        )
      );
    }

    const json = chatRequestSchema.parse(await req.json());
    messages = json.messages as RawMessage[];
    const model = json.model;

    // --- KNOWLEDGE BASE INTEGRATION (WITH CACHING) ---
    let subjects = cache.get("all_subjects") as Subject[];
    if (!subjects) {
      const subjectsSnap = await adminDb.collection("subjects").orderBy("orderIndex").get();
      subjects = subjectsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Subject);
      cache.set("all_subjects", subjects);
    }

    let knowledgeContext = "## الموارد المتاحة حالياً:\n";
    subjects.forEach((s) => {
      knowledgeContext += `- مادة: ${s.name} (رابط: /subject?id=${s.id})\n`;
    });

    const lastMessage = messages[messages.length - 1];
    const lastText = typeof lastMessage.content === "string" ? lastMessage.content : "";

    const matchedSubject = subjects.find(
      (s) =>
        lastText.toLowerCase().includes(s.name.toLowerCase()) ||
        (s.nameAr && lastText.includes(s.nameAr))
    );

    if (matchedSubject) {
      let resources = cache.get(`resources:${matchedSubject.id}`) as Resource[];
      if (!resources) {
        const resourcesSnap = await adminDb
          .collection("subjects")
          .doc(matchedSubject.id)
          .collection("resources")
          .limit(10)
          .get();
        resources = resourcesSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Resource);
        cache.set(`resources:${matchedSubject.id}`, resources);
      }

      if (resources.length > 0) {
        knowledgeContext += `\n### ملفات مادة ${matchedSubject.name}:\n`;
        resources.forEach((r) => {
          knowledgeContext += `- ${r.title}: ${r.url}\n`;
        });
      }
    }

    // 1. Prepend System Prompt and Knowledge Context
    const initialMessages: AIMessages = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\n${knowledgeContext}` },
    ];

    // 2. Map and Sanitize history
    const mappedMessages = messages.map((m: RawMessage) => {
      const role = m.role as "user" | "assistant" | "system";
      let content = m.content;

      if (Array.isArray(content)) {
        const parts = content
          .map((part: RawPart) => {
            if (part && part.type === "image" && part.image)
              return { type: "image", image: part.image };
            if (part && (part.type === "text" || !part.type)) {
              const textVal = typeof part === "string" ? part : part.text;
              if (textVal) return { type: "text", text: textVal };
            }
            return null;
          })
          .filter(
            (p): p is { type: "image"; image: string } | { type: "text"; text: string } =>
              p !== null
          );

        const hasImage = parts.some((p) => p.type === "image");
        content = hasImage ? parts : parts.map((p) => ("text" in p ? p.text : "")).join("\n");
      }

      // Ensure content is a non-empty string if not an array
      if (!content || (Array.isArray(content) && content.length === 0)) content = ".";
      if (typeof content === "string") content = content.trim() || ".";

      return { role, content };
    });

    // 3. Filter out "Invalid" history states
    sanitizedMessages = [
      ...initialMessages,
      ...mappedMessages.filter((m, i) => {
        // Skip leading assistant messages (after our prepended system message)
        if (i === 0 && m.role === "assistant") return false;
        // Skip "error" assistant messages
        if (
          m.role === "assistant" &&
          typeof m.content === "string" &&
          m.content.includes("Sorry, error occurred")
        )
          return false;
        return true;
      }),
    ] as AIMessages;

    const selectedModel = getAIModel(model as AIModelProvider);

    const { text } = await generateText({
      model: selectedModel,
      headers: {
        "HTTP-Referer": "https://obourinstitutes.web.app",
        "X-Title": "Obour Academic Hub",
      },
      messages: sanitizedMessages,
    });

    return withCors(req, NextResponse.json({ role: "assistant", content: text }));
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return withCors(req, NextResponse.json({ error: "Invalid chat payload" }, { status: 400 }));
    }

    logServerError("AI Generation Error:", error, { route: "/api/chat" });
    return handleRouteError(req, error);
  }
}
