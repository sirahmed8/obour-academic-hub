"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SolidModeContextType {
  isSolid: boolean;
  toggleSolidMode: () => void;
}

const SolidModeContext = createContext<SolidModeContextType | undefined>(undefined);

export function SolidModeProvider({ children }: { children: ReactNode }) {
  // Default to false, load from localStorage on mount
  const [isSolid, setIsSolid] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("obour-solid-mode");
    if (stored === "true") {
      setIsSolid(true);
      document.body.classList.add("solid-mode");
    }
  }, []);

  const toggleSolidMode = () => {
    setIsSolid((prev) => {
      const newValue = !prev;
      localStorage.setItem("obour-solid-mode", String(newValue));

      if (newValue) {
        document.body.classList.add("solid-mode");
      } else {
        document.body.classList.remove("solid-mode");
      }

      return newValue;
    });
  };

  return (
    <SolidModeContext.Provider value={{ isSolid, toggleSolidMode }}>
      {children}
    </SolidModeContext.Provider>
  );
}

export function useSolidMode() {
  const context = useContext(SolidModeContext);
  if (context === undefined) {
    throw new Error("useSolidMode must be used within a SolidModeProvider");
  }
  return context;
}
