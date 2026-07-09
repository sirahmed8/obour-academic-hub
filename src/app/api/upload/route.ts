import { NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { corsOptions, withCors } from "@/lib/server/cors";
import { getRequestContext, handleRouteError } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { logServerError } from "@/lib/server/error-sanitizer";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const EXTENSION_MIME_MAP: Record<string, string[]> = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".gif": ["image/gif"],
  ".mp4": ["video/mp4"],
  ".webm": ["video/webm"],
  ".mov": ["video/quicktime"],
  ".qt": ["video/quicktime"],
  ".pdf": ["application/pdf"],
  ".txt": ["text/plain"],
  ".doc": ["application/msword"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

function getFileExtension(name: string): string | null {
  const idx = name.lastIndexOf(".");
  if (idx === -1) return null;
  return name.slice(idx).toLowerCase();
}

function validateFileType(file: File) {
  const ext = getFileExtension(file.name);

  if (!ext || !(ext in EXTENSION_MIME_MAP)) {
    throw new Error("Unsupported file type");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type");
  }

  const expectedMimes = EXTENSION_MIME_MAP[ext];
  if (!expectedMimes.includes(file.type)) {
    throw new Error("File type does not match extension");
  }
}

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  try {
    const context = await getRequestContext(request, { allowMissingProfile: true });
    const limiter = await rateLimit({
      key: `api:upload:${context.uid}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Too many upload attempts. Please try again shortly." },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
            },
          }
        )
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return withCors(request, NextResponse.json({ error: "No file provided" }, { status: 400 }));
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return withCors(
        request,
        NextResponse.json({ error: "File size must be between 1 byte and 10 MB" }, { status: 400 })
      );
    }

    try {
      validateFileType(file);
    } catch (validationError) {
      return withCors(
        request,
        NextResponse.json(
          {
            error: validationError instanceof Error ? validationError.message : "Unsupported file",
          },
          { status: 400 }
        )
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    // Upload to Cloudinary using a stream
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `chatbot-uploads/${context.uid}`,
          resource_type: isImage ? "image" : isVideo ? "video" : "raw",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error("Upload failed without error"));
        }
      );

      // Write buffer to stream
      uploadStream.end(buffer);
    });

    return withCors(
      request,
      NextResponse.json({
        url: result.secure_url,
        name: file.name,
        size: result.bytes,
        type: isImage ? "image" : "document",
      })
    );
  } catch (error) {
    logServerError("Cloudinary upload error:", error, { route: "/api/upload" });
    return handleRouteError(request, error);
  }
}
