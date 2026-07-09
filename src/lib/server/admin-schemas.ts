import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .default("");

export const subjectPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nameAr: optionalTrimmedString,
  profName: z.string().trim().min(1).max(120),
  profNameAr: optionalTrimmedString,
  description: optionalTrimmedString,
  descriptionAr: optionalTrimmedString,
  icon: z.string().trim().min(1).max(64),
  color: z
    .string()
    .trim()
    .regex(/^bg-[a-z0-9-]+$/i),
  orderIndex: z.number().int().min(0).optional(),
});

export const resourcePayloadSchema = z.object({
  subjectId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200),
  titleAr: optionalTrimmedString,
  description: optionalTrimmedString,
  descriptionAr: optionalTrimmedString,
  url: z.string().trim().url(),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal("")),
  type: z.enum(["pdf", "link", "video", "image", "document", "other"]),
  displayAsFile: z.boolean().optional().default(false),
  orderIndex: z.number().int().min(0),
});

export const bannerPayloadSchema = z.object({
  textAr: z.string().trim().min(1).max(500),
  textEn: z.string().trim().min(1).max(500),
  type: z.enum(["info", "warning", "success", "urgent"]),
  isActive: z.boolean().optional().default(true),
});

export const notificationPayloadSchema = z.object({
  titleAr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  messageAr: z.string().trim().min(1).max(2000),
  messageEn: z.string().trim().min(1).max(2000),
  type: z.enum(["info", "warning", "success", "urgent"]),
  target: z.string().trim().min(1).default("all"),
});

export const userUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  studentCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{1,12}$/)
    .optional()
    .or(z.literal("")),
  role: z.enum(["student", "admin", "owner"]).optional(),
  permissions: z
    .array(
      z.enum([
        "manage_subjects",
        "manage_resources",
        "send_notifications",
        "delete_chats",
        "manage_users",
        "access_inbox",
        "manage_announcements",
        "view_analytics",
      ])
    )
    .optional(),
});

export const settingsUpdateSchema = z
  .object({
    aiEnabled: z.boolean().optional(),
    chatbotEnabled: z.boolean().optional(),
  })
  .refine((value) => value.aiEnabled !== undefined || value.chatbotEnabled !== undefined, {
    message: "At least one setting must be provided",
  });

export const approvalUpdateSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});
