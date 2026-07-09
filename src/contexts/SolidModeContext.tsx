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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("obour-solid-mode");

    // Advanced Hardware Capability Detection
    let isLowEnd = false;
    if (typeof navigator !== "undefined") {
      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean };
      };

      const ram = nav.deviceMemory || 8;
      const cpu = nav.hardwareConcurrency || 8;
      const saveData = nav.connection?.saveData;

      // Logic: If (RAM < 4GB OR CPU cores < 4 OR Data-Saver is ON)
      if (ram < 4 || cpu < 4 || saveData === true) {
        isLowEnd = true;
      }
    }

    if (stored === "true" || (stored === null && isLowEnd)) {
      setIsSolid(true);
      document.body.classList.add("solid-mode");
      if (isLowEnd && stored === null) {
        console.log("[Performance] Auto-enabling Solid Mode for low-end device resilience");
      }
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
    <SolidModeContext.Provider value={{ isSolid: mounted ? isSolid : false, toggleSolidMode }}>
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
