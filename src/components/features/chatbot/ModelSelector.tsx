"use client";

import { useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";
import { AI_MODEL_INFO, AIModel } from "./constants";

interface ModelSelectorProps {
  currentModel: AIModel;
  onSelect: (model: AIModel) => void;
}

export function ModelSelector({ currentModel, onSelect }: ModelSelectorProps) {
  const { language } = useLanguage();

  return (
    <div className="flex gap-1 mb-2 p-1 bg-muted/50 rounded-xl overflow-x-auto scrollbar-hide">
      {(["thinking", "balanced", "fast", "flash"] as AIModel[]).map((key) => {
        const info = AI_MODEL_INFO[key];
        const Icon = info.icon;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              currentModel === key
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{info.name[language as "en" | "ar"]}</span>
          </button>
        );
      })}
    </div>
  );
}
