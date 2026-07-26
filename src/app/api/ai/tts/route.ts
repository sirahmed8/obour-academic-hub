import { NextResponse } from "next/server";
import { corsOptions, withCors } from "@/lib/server/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text") || "";
    const cleanText = text.trim().slice(0, 180);

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
    const body = await req.json().catch(() => ({}));
    const text = body.text || "";
    const cleanText = text.trim().slice(0, 180);

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
