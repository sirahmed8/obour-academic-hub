import { Bot, Sparkles, Zap } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type AIModel = "local" | "thinking" | "balanced" | "fast" | "flash";

export interface AIModelInfo {
  name: { en: string; ar: string };
  icon: LucideIcon;
  description: { en: string; ar: string };
  color: string;
}

export const AI_MODEL_INFO: Record<AIModel, AIModelInfo> = {
  local: {
    name: { en: "Smart Bot", ar: "البوت الذكي" },
    icon: Bot,
    description: { en: "Instant responses", ar: "ردود فورية" },
    color: "text-primary",
  },
  thinking: {
    name: { en: "Thinking", ar: "تفكير" },
    icon: Zap,
    description: { en: "Deep reasoning", ar: "تفكير عميق" },
    color: "text-purple-500",
  },
  balanced: {
    name: { en: "Balanced", ar: "متوازن" },
    icon: Bot,
    description: { en: "Best for most tasks", ar: "الأفضل لمعظم المهام" },
    color: "text-green-500",
  },
  fast: {
    name: { en: "Fast", ar: "سريع" },
    icon: Zap,
    description: { en: "Quick responses", ar: "ردود سريعة" },
    color: "text-orange-500",
  },
  flash: {
    name: { en: "Flash", ar: "فلاش" },
    icon: Sparkles,
    description: { en: "Vision + Speed", ar: "يفهم الصور" },
    color: "text-blue-500",
  },
};
