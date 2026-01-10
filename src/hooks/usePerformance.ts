import { useState, useEffect, useRef } from "react";

export function usePerformance() {
  // We only track lagging state which is what the UI actually reacts to.
  // FPS tracking was removed to prevent unnecessary re-renders every second.
  const [isLagging, setIsLagging] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    lastTime.current = performance.now();
    const calcFps = () => {
      const now = performance.now();
      frameCount.current++;

      if (now - lastTime.current >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / (now - lastTime.current));

        // Only update state if the boolean value actually changes
        // React handles the bailout automatically if value is same, but we avoid calling setFps(currentFps)
        // which was changing almost every second.
        setIsLagging((prev) => {
           const isNowLagging = currentFps < 20;
           return prev === isNowLagging ? prev : isNowLagging;
        });

        frameCount.current = 0;
        lastTime.current = now;
      }

      rafId.current = requestAnimationFrame(calcFps);
    };

    rafId.current = requestAnimationFrame(calcFps);

    return () => cancelAnimationFrame(rafId.current);
  }, []);

  return { isLagging };
}
