export interface Banner {
  id: string;
  textAr: string;
  textEn: string;
  type: "info" | "warning" | "success" | "urgent";
  isActive: boolean;
  createdAt: string | { seconds: number; nanoseconds: number } | null;
}

export type NotificationTab = "send" | "banners" | "email";
export type NotificationAudience = "all" | "admins";
export type NotificationKind = "info" | "warning" | "success";

export interface BannerDraft {
  textAr: string;
  textEn: string;
  type: Banner["type"];
  isActive: boolean;
}
