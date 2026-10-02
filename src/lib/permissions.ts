import { User } from "@/types";

export type FeatureKey =
  | "unlimited_quizzes"
  | "unlimited_transcriptions"
  | "unlimited_mindmaps"
  | "xp_boost"
  | "pdf_exports"
  | "unlimited_ai_chat"
  | "priority_support"
  | "exclusive_resources"
  | "admin_dashboard"
  | "manage_subscriptions"
  | "audit_logs";

export interface FeatureGateResult {
  allowed: boolean;
  reason?: "free_tier_limit" | "expired_subscription" | "unauthorized_role";
  upgradeUrl?: string;
  limit?: number;
}

export const OWNER_EMAILS = [
  "a7medorabe7@gmail.com",
  (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").trim().toLowerCase(),
].filter(Boolean);

/**
 * Checks if the user is the platform owner ("OP Mode" superuser)
 */
export function isOwner(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "owner") return true;
  if (user.email && OWNER_EMAILS.includes(user.email.trim().toLowerCase())) {
    return true;
  }
  return false;
}

/**
 * Checks if the user has administrative privileges (Owner or Admin)
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === "admin" || isOwner(user);
}

/**
 * Checks if the user has active VIP privileges (Paid VIP, Gifted VIP, or Admin/Owner OP Mode)
 */
export function isVip(user: User | null | undefined): boolean {
  if (!user) return false;
  if (isOwner(user) || isAdmin(user)) return true; // Lifetime OP Mode access

  if (user.isVip === true || user.subscriptionTier === "vip") {
    if (user.vipExpiresAt) {
      const expiresAt = new Date(user.vipExpiresAt).getTime();
      return !isNaN(expiresAt) && expiresAt > Date.now();
    }
    return true;
  }

  return false;
}

/**
 * Centralized feature-flagging gate to determine access for any platform capability
 */
export function canAccessFeature(user: User | null | undefined, feature: FeatureKey): boolean {
  // 1. Owner has total OP Mode bypass across every feature
  if (isOwner(user)) return true;

  // 2. Admin has access to all educational features and admin tools (except strictly owner audit logs if restricted)
  if (isAdmin(user) && feature !== "audit_logs") return true;

  // 3. VIP tier features
  const vipFeatures: FeatureKey[] = [
    "unlimited_quizzes",
    "unlimited_transcriptions",
    "unlimited_mindmaps",
    "xp_boost",
    "pdf_exports",
    "unlimited_ai_chat",
    "priority_support",
    "exclusive_resources",
  ];

  if (vipFeatures.includes(feature)) {
    return isVip(user);
  }

  // 4. Admin-only operations
  if (feature === "admin_dashboard" || feature === "manage_subscriptions") {
    return isAdmin(user);
  }

  return false;
}

/**
 * Returns numerical tier limits for rate-limited features
 */
export function getFeatureLimit(
  user: User | null | undefined,
  feature: "quizzes" | "transcribe" | "chat"
): number {
  if (isOwner(user) || isVip(user)) {
    return Infinity;
  }

  switch (feature) {
    case "quizzes":
      return 5; // 5 questions for free students
    case "transcribe":
      return 3; // 3 sessions per month
    case "chat":
      return 10; // 10 messages per day
    default:
      return 5;
  }
}

/**
 * Formats monetary amounts in Egyptian Pounds (EGP / ج.م) adhering to native Intl locale standards
 */
export function formatEGP(amount: number, locale: "ar" | "en" = "ar"): string {
  try {
    const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(amount);

    return formatted;
  } catch {
    return locale === "ar" ? `${amount} ج.م` : `${amount} EGP`;
  }
}
