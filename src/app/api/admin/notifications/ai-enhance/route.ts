import { NextResponse } from "next/server";
import { z } from "zod";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requirePermission } from "@/lib/server/auth";
import { generateGeminiResponse, ANNOUNCEMENT_ENHANCER_SYSTEM_PROMPT } from "@/lib/aiService";

export const runtime = "nodejs";

const enhanceSchema = z.object({
  titleAr: z.string().optional(),
  titleEn: z.string().optional(),
  messageAr: z.string().optional(),
  messageEn: z.string().optional(),
  tone: z.string().optional(),
});

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission(request, "manage_announcements");
    const body = enhanceSchema.parse(await request.json());

    const promptText = `يرجى تحسين وتنسيق وإكمال الإعلان التالي:
- العنوان العربي المبدئي: ${body.titleAr || "غير محدد"}
- العنوان الإنجليزي المبدئي: ${body.titleEn || "غير محدد"}
- تفاصيل الرسالة بالعربية: ${body.messageAr || "غير محدد"}
- تفاصيل الرسالة بالإنجليزي: ${body.messageEn || "غير محدد"}
- النبرة المطلوبة: ${body.tone || "احترافية وأكاديمية ومحفزة"}

قم بصياغة عنوان ورسالة باللغتين العربية والإنجليزية بأعلى دقة واحترافية ونسقها بالرموز التعبيرية مع مخرجات ANNOUNCEMENT_SPEC الإلزامية.`;

    const aiResponse = await generateGeminiResponse(
      [{ role: "user", content: promptText }],
      context.uid,
      ANNOUNCEMENT_ENHANCER_SYSTEM_PROMPT
    );

    const match = aiResponse.match(/\[ANNOUNCEMENT_SPEC:\s*({[\s\S]*?})\]/);

    if (match && match[1]) {
      const parsed = JSON.parse(match[1]);
      return withCors(
        request,
        NextResponse.json({
          success: true,
          titleAr: parsed.titleAr || body.titleAr || "",
          titleEn: parsed.titleEn || body.titleEn || "",
          messageAr: parsed.messageAr || body.messageAr || "",
          messageEn: parsed.messageEn || body.messageEn || "",
          recommendedType: parsed.recommendedType || "info",
          rawText: aiResponse.replace(/\[ANNOUNCEMENT_SPEC:[\s\S]*?\]/, "").trim(),
        })
      );
    }

    return withCors(
      request,
      NextResponse.json({
        success: true,
        titleAr: body.titleAr || "تنويه هام للطلاب",
        titleEn: body.titleEn || "Important Student Notice",
        messageAr: aiResponse,
        messageEn: aiResponse,
        recommendedType: "info",
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Invalid enhancement payload", details: error.flatten() },
          { status: 400 }
        )
      );
    }

    return handleRouteError(request, error);
  }
}
