"use client";

import { apiFetch } from "@/lib/api-client";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfvh4jcsh";

export interface UploadResult {
  url: string;
  publicId?: string;
  thumbnailUrl?: string;
}

export async function uploadToCloudinary(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiFetch<{
    url: string;
    name: string;
    size: number;
    type: "image" | "document";
  }>("/api/upload", {
    method: "POST",
    body: formData,
  });

  let thumbnailUrl: string | undefined;
  if (file.type === "application/pdf") {
    thumbnailUrl = data.url
      .replace("/upload/", "/upload/c_thumb,w_400,h_300,pg_1/")
      .replace(".pdf", ".jpg");
  }

  return {
    url: data.url,
    thumbnailUrl,
  };
}

export function getCloudinaryUrl(
  publicId: string,
  options?: { width?: number; height?: number }
): string {
  const transforms = options ? `c_fill,w_${options.width || 400},h_${options.height || 300}/` : "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}${publicId}`;
}
