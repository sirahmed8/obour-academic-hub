import { useState, useEffect, useRef } from "react";

export function usePerformance() {
  const [fps, setFps] = useState(60);
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
        setFps(currentFps);

        // Consider lagging if FPS drops consistently below 35
        // We use a simple check here, but could smooth it over time if needed
        setIsLagging(currentFps < 20);

        frameCount.current = 0;
        lastTime.current = now;
      }

      rafId.current = requestAnimationFrame(calcFps);
    };

    rafId.current = requestAnimationFrame(calcFps);

    return () => cancelAnimationFrame(rafId.current);
  }, []);

  return { fps, isLagging };
}
