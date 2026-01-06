export interface BotResponse {
  text: string;
  confidence: number;
  suggestions?: string[];
  action?: "live_chat" | "link";
  link?: string;
}

export interface QA {
  questions: string[];
  answer: {
    ar: string;
    en: string;
  };
  suggestions?: { ar: string[]; en: string[] };
}
