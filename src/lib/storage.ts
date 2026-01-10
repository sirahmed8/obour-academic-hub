"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export async function uploadFileToFirebase(file: File): Promise<UploadResult> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized");
  }

  // Create a unique path: chat-uploads/<timestamp>-<safe-filename>
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `chat-uploads/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      name: file.name,
      size: file.size,
      type: file.type.startsWith("image/") ? "image" : "document",
    };
  } catch (error) {
    console.error("Firebase Upload Error:", error);
    throw new Error("Failed to upload file to Firebase Storage");
  }
}
