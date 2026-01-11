"use client";

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
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();

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
