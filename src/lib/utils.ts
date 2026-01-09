import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to safely convert Firestore Timestamp or string to Date
type Timestamp = { seconds: number; nanoseconds: number } | { toDate: () => Date };
type DateInput = string | Date | Timestamp | null | undefined;

function toDate(date: DateInput): Date {
  if (date === null || date === undefined) return new Date(NaN);
  if (date instanceof Date) return date;
  if (typeof date === "string") return new Date(date);

  // Handle Firestore Timestamp (both raw object and SDK class)
  if (date && typeof date === "object") {
    if ("toDate" in date && typeof date.toDate === "function") {
      return date.toDate();
    }
    if ("seconds" in date) {
      return new Date(date.seconds * 1000);
    }
  }

  return new Date(NaN);
}

export function formatDate(date: DateInput): string {
  const validDate = toDate(date);
  if (isNaN(validDate.getTime())) return "N/A";

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

  const morningmsgs = [
    { en: "Good Morning", ar: "صباح الخير" },
    { en: "Rise and Shine", ar: "صباح الهمة والنشاط" },
    { en: "Ready to learn?", ar: "جاهز تكسر الدنيا؟" },
    { en: "Morning Vibes", ar: "بداية يوم جميل" },
  ];

  const afternoonmsgs = [
    { en: "Good Afternoon", ar: "مساء الخير" },
    { en: "Keep Going", ar: "كمل، إنت قدها" },
    { en: "Stay Focused", ar: "ركز وحقق هدفك" },
    { en: "Halfway there", ar: "فاضل على الحلو دقة" },
  ];

  const eveningmsgs = [
    { en: "Good Evening", ar: "مساء الروقان" },
    { en: "Night Owl Mode", ar: "عاش يا بطل" },
    { en: "Time to Focus", ar: "هدوء وتركيز" },
    { en: "Wrap it up", ar: "ختامها مسك" },
    { en: "Still grinding?", ar: "لسه شغال؟ الله يقويك" },
    { en: "Late night study", ar: "مذاكرة رايقة" },
    { en: "Don't stay up too late", ar: "ماتسهرش كتير" },
    { en: "Dream Big", ar: "احلم كبير" },
  ];

  let list = eveningmsgs;
  if (hour >= 5 && hour < 12) list = morningmsgs;
  else if (hour >= 12 && hour < 17) list = afternoonmsgs;

  return list[Math.floor(Math.random() * list.length)];
}

export function generateAvatarUrl(name: string, bgColor = "6366f1"): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=${bgColor}&color=fff&uppercase=true`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
