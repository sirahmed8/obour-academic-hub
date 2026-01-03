import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to safely convert Firestore Timestamp or string to Date
type Timestamp =
  | { seconds: number; nanoseconds: number }
  | { toDate: () => Date };
type DateInput = string | Date | Timestamp | null | undefined;

function toDate(date: DateInput): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  if (typeof date === "string") return new Date(date);

  // Handle Firestore Timestamp (both raw object and SDK class)
  if ("toDate" in date && typeof date.toDate === "function") {
    return date.toDate();
  }
  if ("seconds" in date) {
    return new Date(date.seconds * 1000);
  }

  return new Date();
}

export function formatDate(date: DateInput): string {
  const validDate = toDate(date);
  if (isNaN(validDate.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(validDate);
}

export function formatDateArabic(date: DateInput): string {
  const validDate = toDate(date);
  if (isNaN(validDate.getTime())) return "تاريخ غير صالح";

  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(validDate);
}

export function getGreeting(): { en: string; ar: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { en: "Good Morning", ar: "صباح الخير" };
  if (hour < 17) return { en: "Good Afternoon", ar: "مساء الخير" };
  return { en: "Good Evening", ar: "مساء الخير" };
}

export function generateAvatarUrl(name: string, bgColor = "6366f1"): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=${bgColor}&color=fff`;
}
