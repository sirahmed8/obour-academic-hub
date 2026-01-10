"use client";

import * as React from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { cn } from "@/lib/utils";

interface LottieIconProps {
  animationData: object; // The Lottie JSON animation data
  size?: number;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  hoverPlay?: boolean; // Play on hover, reverse on leave
}

export function LottieIcon({
  animationData,
  size = 24,
  className,
  loop = false,
  autoplay = false,
  hoverPlay = true,
}: LottieIconProps) {
  const lottieRef = React.useRef<LottieRefCurrentProps>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  // Defensive check: Ensure animationData is valid
  const isValidAnimation =
    animationData && typeof animationData === "object" && "layers" in animationData;

  React.useEffect(() => {
    if (!lottieRef.current) return;

    if (hoverPlay) {
      if (isHovered) {
        lottieRef.current.setDirection(1); // Forward
        lottieRef.current.play();
      } else {
        lottieRef.current.setDirection(-1); // Reverse
        lottieRef.current.play();
      }
    }
  }, [isHovered, hoverPlay]);

  if (!isValidAnimation) {
    if (process.env.NODE_ENV === "development")
      console.warn("LottieIcon: Invalid or missing animationData", animationData);
    return (
      <div
        className={cn("flex items-center justify-center bg-gray-200/20 rounded-md", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
