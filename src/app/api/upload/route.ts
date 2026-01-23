import { NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { rateLimit } from "@/lib/rate-limit";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // 🛡️ Sentinel: Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limiter = rateLimit(ip + "-upload", { interval: 60 * 1000, limit: 10 }); // 10 uploads per minute

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": Math.ceil((limiter.reset - Date.now()) / 1000).toString() },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using a stream
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "chatbot-uploads", // Optional: Organize in a folder
          resource_type: "auto", // Automatically detect image/video/raw
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

    return NextResponse.json({
      url: result.secure_url,
      name: file.name, // Original name
      size: result.bytes,
      type: result.resource_type === "image" ? "image" : "document", // Simplified type mapping
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
