"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import type { LottieRefCurrentProps } from "lottie-react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { cn } from "@/lib/utils";
import { ICON_ANIMATION_VARIANTS, getIconVariant } from "@/lib/iconAnimations";
import { useSolidMode } from "@/contexts";

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
  fallback?: LucideIcon; // Added fallback icon for Solid Mode / Lottie failure
  isHovered?: boolean;
  loop?: boolean;
}

export function AnimatedIcon({
  icon: Icon,
  iconName,
  size = 24,
  className,
  style, // Destructure style
  active,
  useAnimation = false,
  fallback: Fallback,
  isHovered: isHoveredProp = false,
}: AnimatedIconProps) {
  const { isSolid } = useSolidMode();
  const [isHovered, setIsHovered] = React.useState(isHoveredProp);

  const variantName = iconName ? getIconVariant(iconName) : "scale";
  const variants = ICON_ANIMATION_VARIANTS[variantName];

  // Declarative animation state
  // FIX: If active is provided (controlled), ignore internal hover to prevent race conditions/glitches
  const shouldAnimate = active !== undefined ? active : isHovered;

  // AUTO-DETECT: If Icon is an object, it's a Lottie animation JSON.
  // We MUST use LottieIconWrapper in this case, regardless of useAnimation.
  const isLottie = typeof Icon === "object" && Icon !== null;

  // In Solid Mode, we avoid Lottie/Animations for performance.
  // If it's a Lottie JSON, we MUST use the Fallback or it will crash.
  if (isSolid && isLottie) {
    return (
      <motion.div
        className={cn("relative flex items-center justify-center", className)}
        style={style}
        initial="rest"
        animate={shouldAnimate ? "hover" : "rest"}
        variants={variants}
      >
        {Fallback ? <Fallback size={size} /> : <div style={{ width: size, height: size }} />}
      </motion.div>
    );
  }

  if ((useAnimation || isLottie) && !isSolid) {
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

  const FinalIcon = Icon || Fallback;

  return (
    <motion.div
      className={cn("relative flex items-center justify-center cursor-pointer", className)}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial="rest"
      animate={shouldAnimate ? "hover" : "rest"}
      variants={variants}
    >
      {FinalIcon ? <FinalIcon size={size} /> : <div style={{ width: size, height: size }} />}
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

  const shouldBeActive = active !== undefined ? active : isHovered;

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

  // Defensive check
  const isValidAnimation =
    animationData && typeof animationData === "object" && "layers" in animationData;

  if (!isValidAnimation) {
    if (animationData && process.env.NODE_ENV === "development")
      console.warn("LottieIconWrapper: Invalid animationData", animationData);
    // Return a placeholder or just an empty div of correct size
    return (
      <div
        className={cn("inline-block", className)}
        style={{ width: size, height: size, ...style }}
      />
    );
  }

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
