import { z } from "zod";

export const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1, "Message content cannot be empty"),
    })
  ),
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
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
});

export type EmailRequest = z.infer<typeof emailRequestSchema>;
