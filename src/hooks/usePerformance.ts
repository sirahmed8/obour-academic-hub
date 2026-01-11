import { useState, useEffect, useRef } from "react";

interface PerformanceData {
  isLagging: boolean;
  currentFps: number;
  isLowEndDevice: boolean;
}

export function usePerformance(): PerformanceData {
  const [isLagging, setIsLagging] = useState(false);
  const currentFpsRef = useRef(60);
  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef<number>(0);

  // Detect low-end device (few CPU cores or low memory)
  const isLowEndDevice =
    typeof navigator !== "undefined" &&
    ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
      // @ts-expect-error - deviceMemory is not standard but available in Chrome
      (navigator.deviceMemory && navigator.deviceMemory < 4));

  useEffect(() => {
    lastTime.current = performance.now();

    const calcFps = () => {
      const now = performance.now();
      frameCount.current++;

      if (now - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));

        // Update ref instead of state to avoid re-renders
        currentFpsRef.current = fps;

        // User's requested threshold: 35 FPS
        const lagDetected = fps < 35;

        // Only trigger re-render if lag state actually changes
        setIsLagging((prev) => {
          if (prev !== lagDetected) return lagDetected;
          return prev;
        });

        frameCount.current = 0;
        lastTime.current = now;
      }

      rafId.current = requestAnimationFrame(calcFps);
    };

    rafId.current = requestAnimationFrame(calcFps);

    return () => cancelAnimationFrame(rafId.current);
  }, []);

  return { isLagging, currentFps: currentFpsRef.current, isLowEndDevice };
}
