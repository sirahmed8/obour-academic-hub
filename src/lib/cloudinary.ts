// Cloudinary configuration and upload utilities
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfvh4jcsh';
const UPLOAD_PRESET = 'ml_default';
const FOLDER = 'obour_resources';

export interface UploadResult {
  url: string;
  publicId: string;
  thumbnailUrl?: string;
}

export async function uploadToCloudinary(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', FOLDER);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  
  // Generate thumbnail for PDFs
  let thumbnailUrl: string | undefined;
  if (file.type === 'application/pdf') {
    thumbnailUrl = data.secure_url
      .replace('/upload/', '/upload/c_thumb,w_400,h_300,pg_1/')
      .replace('.pdf', '.jpg');
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    thumbnailUrl,
  };
}

export function getCloudinaryUrl(publicId: string, options?: { width?: number; height?: number }): string {
  const transforms = options 
    ? `c_fill,w_${options.width || 400},h_${options.height || 300}/`
    : '';
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}${publicId}`;
}
