import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateArabic(date: string | Date): string {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function getGreeting(): { en: string; ar: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { en: 'Good Morning', ar: 'صباح الخير' };
  if (hour < 17) return { en: 'Good Afternoon', ar: 'مساء الخير' };
  return { en: 'Good Evening', ar: 'مساء الخير' };
}

export function generateAvatarUrl(name: string, bgColor = '6366f1'): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff`;
}
