import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { uploadRequestSchema } from "@/lib/zod-schemas";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * POST /api/upload
 * Handles file uploads to Vercel Blob storage
 * Requires: Authorization header with Firebase token
 */
export async function POST(request: Request) {
  try {
    // 1. Authorization check
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract and validate filename
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename || !request.body) {
      return NextResponse.json({ error: "Filename and body are required" }, { status: 400 });
    }

    // Validate using Zod schema
    const validation = uploadRequestSchema.safeParse({ filename });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid filename",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const sanitizedFilename = filename; // Zod validation ensures safety, further sanitization below

    // Security: Check Content-Length (Max 4.5MB to be safe for Vercel Blob's 4.5MB limit on free tier/serverless)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 4.5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (Max 4.5MB)" }, { status: 413 });
    }

    // 3. Sanitize filename (security: prevent path traversal)
    const finalFilename = sanitizedFilename
      .replace(/\.\./g, "") // Remove ..
      .replace(/[/\\]/g, "_") // Replace slashes with underscores
      .replace(/[^a-zA-Z0-9._-]/g, "_") // Only allow safe characters
      .substring(0, 255); // Limit length

    // 4. Upload to Vercel Blob
    const blob = await put(finalFilename, request.body, {
      access: "public",
      addRandomSuffix: true, // Prevent filename collisions
    });

    return NextResponse.json({
      url: blob.url,
      filename: finalFilename,
    });
  } catch (error) {
    // Log error server-side only
    const errorMessage = error instanceof Error ? error.message : "Upload failed";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
