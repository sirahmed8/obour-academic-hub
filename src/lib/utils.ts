import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to safely convert Firestore Timestamp or string to Date
function toDate(date: any): Date {
  if (!date) return new Date();
  if (typeof date === "object" && "seconds" in date) {
    return new Date(date.seconds * 1000); // Firestore Timestamp
  }
  if (typeof date === "object" && "toDate" in date) {
    return date.toDate(); // Firestore Timestamp (client SDK)
  }
  return new Date(date);
}

export function formatDate(date: any): string {
  const validDate = toDate(date);
  if (isNaN(validDate.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(validDate);
}

export function formatDateArabic(date: any): string {
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
