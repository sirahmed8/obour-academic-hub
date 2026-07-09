"use client";

import { apiFetch } from "@/lib/api-client";

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export async function uploadFileToFirebase(file: File): Promise<UploadResult> {
  // NOTE: Function name kept as 'uploadFileToFirebase' to avoid breaking imports in other files,
  // even though it now uploads to Cloudinary via our API.

  const formData = new FormData();
  formData.append("file", file);

  try {
    const data = await apiFetch<UploadResult>("/api/upload", {
      method: "POST",
      body: formData,
    });

    return {
      url: data.url,
      name: data.name,
      size: data.size,
      type: data.type,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload file");
  }
}
