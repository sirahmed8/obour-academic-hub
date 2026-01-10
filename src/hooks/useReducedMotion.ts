"use client";

import { useSyncExternalStore } from "react";

interface MotionPreferences {
  prefersReducedMotion: boolean;
  isLowEndDevice: boolean;
  shouldReduceMotion: boolean;
  shouldDisableBlur: boolean;
}

// Default preferences for SSR
const defaultPreferences: MotionPreferences = {
  prefersReducedMotion: false,
  isLowEndDevice: false,
  shouldReduceMotion: false,
  shouldDisableBlur: false,
};

// Calculate preferences from browser APIs
function getPreferences(): MotionPreferences {
  if (typeof window === "undefined") return defaultPreferences;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Check for low-end device (2 or fewer CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  const isLowEndDevice = cores <= 2;

  // Check for Save-Data header preference
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const saveData = connection?.saveData || false;

  // Determine if we should reduce motion
  const shouldReduceMotion = prefersReducedMotion || isLowEndDevice || saveData;

  // Disable blur on low-end devices (blur is expensive)
  const shouldDisableBlur = isLowEndDevice || saveData;

  return {
    prefersReducedMotion,
    isLowEndDevice,
    shouldReduceMotion,
    shouldDisableBlur,
  };
}

// Store for motion preferences
let cachedPreferences = defaultPreferences;
let listeners: Array<() => void> = [];

function subscribe(callback: () => void): () => void {
  listeners.push(callback);

  // Subscribe to reduced motion changes
  if (typeof window !== "undefined") {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      cachedPreferences = getPreferences();
      listeners.forEach((listener) => listener());
    };
    mediaQuery.addEventListener("change", handleChange);

    // Initialize cached preferences
    cachedPreferences = getPreferences();

    return () => {
      listeners = listeners.filter((l) => l !== callback);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }

  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function getSnapshot(): MotionPreferences {
  return cachedPreferences;
}

function getServerSnapshot(): MotionPreferences {
  return defaultPreferences;
}

/**
 * Hook to detect user's motion preferences and device capabilities
 * Returns flags to conditionally disable heavy animations and blur effects
 * Uses useSyncExternalStore for React 18+ compatibility
 */
export function useReducedMotion(): MotionPreferences {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Check if device is low-end (server-safe)
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 4;
  return cores <= 2;
}

/**
 * Get animation variants based on motion preferences
 * Returns empty object if motion should be reduced
 */
export function getMotionProps(
  shouldReduceMotion: boolean,
  props: Record<string, unknown>
): Record<string, unknown> {
  if (shouldReduceMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 },
    };
  }
  return props;
}
