"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300",
          isOpen
            ? "border-primary/50 bg-background/80 backdrop-blur-xl shadow-lg ring-2 ring-primary/10"
            : "border-border/40 bg-background/60 backdrop-blur-xl hover:bg-background/80"
        )}
      >
        <span
          className={cn("block truncate font-medium", !selectedOption && "text-muted-foreground")}
        >
          {selectedOption
            ? selectedOption.label
            : placeholder || (language === "ar" ? "اختر..." : "Select...")}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="absolute z-50 w-full mt-2 bg-background/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl max-h-60 overflow-hidden"
          >
            <div className="p-1.5 overflow-auto max-h-56 scrollbar-hide">
              {options.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  {language === "ar" ? "لا توجد خيارات" : "No options"}
                </div>
              ) : (
                options.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 mb-0.5 last:mb-0 relative z-10",
                      option.value === value
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground hover:bg-white/5 active:scale-[0.98]"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && <Check className="w-4 h-4 text-primary" />}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
