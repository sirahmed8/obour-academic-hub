import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Simple check for authorization header presence
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename || !request.body) {
    return NextResponse.json({ error: "Filename and body are required" }, { status: 400 });
  }

  // Upload to Vercel Blob
  const blob = await put(filename, request.body, {
    access: "public",
  });

  return NextResponse.json(blob);
}
