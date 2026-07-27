import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Optimization: Memoize Intl.DateTimeFormat to avoid expensive re-creation
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify({ locale, ...options });
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return formatterCache.get(key)!;
}

export type Timestamp = { seconds: number; nanoseconds: number } | { toDate: () => Date };
export type DateInput = string | Date | Timestamp | null | undefined;

export function toDate(date: DateInput): Date {
  if (!date) return new Date(NaN);
  if (date instanceof Date) return date;
  if (typeof date === "string") return new Date(date);

  // Handle Firestore Timestamp (duck typing for performance)
  if (typeof date === "object") {
    if ("toDate" in date && typeof date.toDate === "function") return date.toDate();
    if ("seconds" in date) return new Date(date.seconds * 1000);
  }

  return new Date(NaN);
}

/**
 * Normalizes a date input (string, Date, Firestore Timestamp) to an ISO string.
 * This is CRITICAL for React state to avoid serialization errors like #130.
 * Stability is essential for hydration: returns a fixed epoch string for invalid inputs.
 */
export function normalizeDate(date: DateInput): string {
  const d = toDate(date);
  // Using Unix Epoch as a stable fallback for missing/invalid dates to prevent hydration mismatches
  return isNaN(d.getTime()) ? "1970-01-01T00:00:00.000Z" : d.toISOString();
}

/**
 * Formats a date for English locale (e.g. "Oct 15, 2026")
 * @param date The Date, Timestamp, or date string to format
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDate(date: DateInput): string {
  const validDate = toDate(date);
  if (isNaN(validDate.getTime())) return "N/A";

  return getFormatter("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(validDate);
}

/**
 * Formats a date for Arabic locale (e.g. "١٥ أكتوبر ٢٠٢٦")
 * @param date The Date, Timestamp, or date string to format
 * @returns Formatted Arabic date string or "تاريخ غير صالح" if invalid
 */
export function formatDateArabic(date: DateInput): string {
  const validDate = toDate(date);
  if (isNaN(validDate.getTime())) return "تاريخ غير صالح";

  return getFormatter("ar-EG", {
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

/**
 * Generates a profile avatar image URL based on the user's name
 * @param name User's display name
 * @param bgColor Background color hex (default: "6366f1")
 * @returns Avatar image URL
 */
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

/**
 * Standard grade point mappings for academic GPA calculation
 */
const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

export interface CourseGradeInput {
  grade: string;
  credits: number;
  code?: string;
  name?: string;
}

/**
 * Calculates student GPA accurately based on completed courses, credit hours, and letter grades.
 * Returns cumulative GPA rounded to 2 decimal places (0.00 to 4.00).
 */
export function calculateGPA(courses: CourseGradeInput[]): number {
  if (!Array.isArray(courses) || courses.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const c of courses) {
    const credits = typeof c.credits === "number" && c.credits > 0 ? c.credits : 0;
    if (credits === 0) continue;

    const normalizedGrade = (c.grade || "").trim().toUpperCase();
    const point = GRADE_POINTS[normalizedGrade] ?? 0;

    totalPoints += point * credits;
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0;
  return parseFloat((totalPoints / totalCredits).toFixed(2));
}

/**
 * Calculates academic study streak logic based on consecutive daily activity.
 * - Same day activity: Streak remains unchanged.
 * - Consecutive day activity (1 calendar day difference): Streak increments by 1.
 * - Missed day activity (> 1 calendar day difference or empty): Streak resets to 1.
 */
export function calculateStudyStreak(
  lastActiveInput: DateInput,
  currentStreak: number = 0,
  targetDateInput: DateInput = new Date()
): { streak: number; updated: boolean; diffDays: number } {
  const lastActiveDate = toDate(lastActiveInput);
  const targetDate = toDate(targetDateInput);

  if (isNaN(targetDate.getTime())) {
    return { streak: Math.max(1, currentStreak), updated: false, diffDays: 0 };
  }

  if (isNaN(lastActiveDate.getTime())) {
    return { streak: 1, updated: true, diffDays: -1 };
  }

  // Calculate midnight-normalized calendar day difference
  const d1 = new Date(
    lastActiveDate.getFullYear(),
    lastActiveDate.getMonth(),
    lastActiveDate.getDate()
  );
  const d2 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const diffMs = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { streak: Math.max(1, currentStreak), updated: false, diffDays: 0 };
  } else if (diffDays === 1) {
    return { streak: Math.max(0, currentStreak) + 1, updated: true, diffDays: 1 };
  } else {
    return { streak: 1, updated: true, diffDays };
  }
}
