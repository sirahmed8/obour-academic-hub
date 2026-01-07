export interface BotResponse {
  text: string;
  confidence: number;
  suggestions?: string[];
  action?: "live_chat" | "link" | "confirm_task";
  link?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taskData?: any;
}

export interface QA {
  questions: string[];
  answer: {
    ar: string;
    en: string;
  };
  suggestions?: { ar: string[]; en: string[] };
}
