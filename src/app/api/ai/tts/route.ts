import { NextResponse } from "next/server";
import { corsOptions, withCors } from "@/lib/server/cors";
import { rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "anonymous";
}

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function GET(req: Request) {
  try {
    const identifier = getClientIdentifier(req);
    const limiter = await rateLimit({
      key: `api:tts:${identifier}`,
      limit: 30,
      windowMs: 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Too many TTS requests. Please try again shortly." },
          { status: 429 }
        )
      );
    }

    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text") || "";
    const cleanText = text
      .replace(/[\x00-\x1F\x7F]/g, "")
      .trim()
      .slice(0, 180);

    if (!cleanText) {
      return withCors(
        req,
        NextResponse.json({ error: "Text parameter is required" }, { status: 400 })
      );
    }

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanText
    )}&tl=ar&client=tw-ob`;

    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return withCors(
        req,
        NextResponse.json(
          { error: `TTS request failed with status ${response.status}` },
          { status: response.status }
        )
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();

    return withCors(
      req,
      new NextResponse(audioArrayBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      })
    );
  } catch (error) {
    console.error("TTS Route Error:", error);
    return withCors(req, NextResponse.json({ error: "Speech synthesis failed" }, { status: 500 }));
  }
}

export async function POST(req: Request) {
  try {
    const identifier = getClientIdentifier(req);
    const limiter = await rateLimit({
      key: `api:tts:${identifier}`,
      limit: 30,
      windowMs: 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        req,
        NextResponse.json(
          { error: "Too many TTS requests. Please try again shortly." },
          { status: 429 }
        )
      );
    }

    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text : "";
    const cleanText = text
      .replace(/[\x00-\x1F\x7F]/g, "")
      .trim()
      .slice(0, 180);

    if (!cleanText) {
      return withCors(
        req,
        NextResponse.json({ error: "Text parameter is required" }, { status: 400 })
      );
    }

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanText
    )}&tl=ar&client=tw-ob`;

    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return withCors(
        req,
        NextResponse.json(
          { error: `TTS request failed with status ${response.status}` },
          { status: response.status }
        )
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();

    return withCors(
      req,
      new NextResponse(audioArrayBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      })
    );
  } catch (error) {
    console.error("TTS Route Error:", error);
    return withCors(req, NextResponse.json({ error: "Speech synthesis failed" }, { status: 500 }));
  }
}
