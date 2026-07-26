import { z } from "zod";

function isTrustedImageInput(value: string) {
  const v = value.trim();
  if (!v) return false;

  // Allow base64 data URLs for images (prevent huge payloads / non-image data)
  if (v.startsWith("data:image/")) {
    return v.length <= 5_000_000;
  }

  // Allow base64 data string
  if (v.length > 50 && !v.includes(" ") && !v.startsWith("http")) {
    return v.length <= 5_000_000;
  }

  // Allow trusted remote image hosts
  try {
    const url = new URL(v);
    if (url.protocol !== "https:") return false;
    if (url.hostname !== "res.cloudinary.com") return false;
    return true;
  } catch {
    return false;
  }
}

function sanitizeHtml(html: string) {
  // Basic XSS prevention: remove script tags and on* attributes
  return html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/on\w+="[^"]*"/gim, "")
    .replace(/on\w+='[^']*'/gim, "")
    .replace(/javascript:[^"']*/gim, "");
}

const chatMessagePartSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string().trim().min(1, "Message content cannot be empty").transform(sanitizeHtml),
  }),
  z.object({
    type: z.literal("image"),
    image: z.string().trim().min(1, "Image content cannot be empty").refine(isTrustedImageInput, {
      message: "Untrusted or invalid image input",
    }),
  }),
]);

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.union([
          z.string().trim().min(1, "Message content cannot be empty").transform(sanitizeHtml),
          z.array(chatMessagePartSchema).min(1, "Message content cannot be empty"),
        ]),
      })
    )
    .min(1)
    .max(20),
  model: z.enum(["thinking", "balanced", "fast", "flash"]).optional().default("balanced"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const uploadRequestSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid characters in filename")
    .refine((name) => /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt)$/i.test(name), {
      message: "Invalid file extension",
    }),
});

export const emailRequestSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, "Subject cannot be empty").transform(sanitizeHtml),
  html: z.string().min(1, "Email content cannot be empty").transform(sanitizeHtml),
});

export type EmailRequest = z.infer<typeof emailRequestSchema>;
