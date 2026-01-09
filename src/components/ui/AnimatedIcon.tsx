"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { cn } from "@/lib/utils";
import { ICON_ANIMATION_VARIANTS, getIconVariant } from "@/lib/iconAnimations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IconType = LucideIcon | any;

interface AnimatedIconProps {
  icon: IconType;
  iconName?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties; // Added style prop
  active?: boolean;
  useAnimation?: boolean;
}

export function AnimatedIcon({
  icon: Icon,
  iconName,
  size = 24,
  className,
  style, // Destructure style
  active,
  useAnimation = false,
}: AnimatedIconProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const variantName = iconName ? getIconVariant(iconName) : "scale";
  const variants = ICON_ANIMATION_VARIANTS[variantName];

  // Declarative animation state
  const shouldAnimate = isHovered || active;

  // AUTO-DETECT: If Icon is an object, it's a Lottie animation JSON.
  // We MUST use LottieIconWrapper in this case, regardless of useAnimation.
  const isLottie = typeof Icon === "object" && Icon !== null;

  if (useAnimation || isLottie) {
    return (
      <LottieIconWrapper
        animationData={Icon}
        size={size}
        className={className}
        style={style}
        active={shouldAnimate}
      />
    );
  }

  return (
    <motion.div
      className={cn("relative flex items-center justify-center cursor-pointer", className)}
      style={style} // Pass style
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial="rest"
      animate={shouldAnimate ? "hover" : "rest"}
      variants={variants}
    >
      <Icon size={size} />
    </motion.div>
  );
}

// Lottie-based wrapper with proper forward/reverse control
interface LottieIconWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationData: any;
  size: number;
  className?: string;
  style?: React.CSSProperties;
  active?: boolean;
}

function LottieIconWrapper({
  animationData,
  size,
  className,
  style,
  active,
}: LottieIconWrapperProps) {
  const lottieRef = React.useRef<LottieRefCurrentProps>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  // Track previous state to only animate on CHANGES
  const prevActiveRef = React.useRef<boolean | undefined>(undefined);

  const shouldBeActive = isHovered || active;

  React.useEffect(() => {
    if (!lottieRef.current) return;

    const wasActive = prevActiveRef.current;
    const isNowActive = shouldBeActive;

    // Only trigger animation if the state CHANGED (not on initial render or same state)
    if (wasActive === isNowActive) return;

    if (isNowActive && !wasActive) {
      // Transition from inactive -> active: Play forward once
      lottieRef.current.setDirection(1);
      lottieRef.current.goToAndPlay(0);
    } else if (!isNowActive && wasActive) {
      // Transition from active -> inactive: Play reverse from current frame
      lottieRef.current.setDirection(-1);
      lottieRef.current.play();
    }

    // Update ref
    prevActiveRef.current = isNowActive;
  }, [shouldBeActive]);

  // Initialize ref on mount (no animation)
  React.useEffect(() => {
    prevActiveRef.current = shouldBeActive;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={{ width: size, height: size, ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        style={{ width: size, height: size }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
    </div>
  );
}
