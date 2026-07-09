/**
 * Subject Icon Animations Mapping
 * Maps subject icon names to their animation type and data
 */

// For icons that have Lottie equivalents, we'll use those
// For others, we'll use enhanced Framer Motion animations

export const ANIMATED_ICON_MAP: Record<
  string,
  {
    type: "lottie" | "useanimation" | "framer";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any; // Lottie JSON or react-useanimations import
    fallbackIcon?: string; // Lucide icon name for framer type
  }
> = {
  // Books and Education
  BookOpen: { type: "framer", fallbackIcon: "BookOpen" },
  Book: { type: "framer", fallbackIcon: "Book" },
  GraduationCap: { type: "framer", fallbackIcon: "GraduationCap" },
  Library: { type: "framer", fallbackIcon: "Library" },

  // Science
  FlaskConical: { type: "framer", fallbackIcon: "FlaskConical" },
  Microscope: { type: "framer", fallbackIcon: "Microscope" },
  Atom: { type: "framer", fallbackIcon: "Atom" },
  TestTube: { type: "framer", fallbackIcon: "TestTube" },

  // Math & Computing
  Calculator: { type: "framer", fallbackIcon: "Calculator" },
  Cpu: { type: "framer", fallbackIcon: "Cpu" },
  Code: { type: "framer", fallbackIcon: "Code" },
  Binary: { type: "framer", fallbackIcon: "Binary" },

  // Arts
  Palette: { type: "framer", fallbackIcon: "Palette" },
  PenTool: { type: "framer", fallbackIcon: "PenTool" },
  Music: { type: "framer", fallbackIcon: "Music" },
  Film: { type: "framer", fallbackIcon: "Film" },
  Camera: { type: "framer", fallbackIcon: "Camera" },

  // Business & Social
  Briefcase: { type: "framer", fallbackIcon: "Briefcase" },
  Globe: { type: "framer", fallbackIcon: "Globe" },
  Users: { type: "framer", fallbackIcon: "Users" },

  // Health
  Stethoscope: { type: "framer", fallbackIcon: "Stethoscope" },
  Heart: { type: "framer", fallbackIcon: "Heart" },

  // Other
  Lightbulb: { type: "framer", fallbackIcon: "Lightbulb" },
  Gamepad2: { type: "framer", fallbackIcon: "Gamepad2" },
};

// Animation variants - Premium, deterministic, and reversible (Figma-style)
export const ICON_ANIMATION_VARIANTS = {
  // Smooth rotation (for globes, atoms, settings)
  rotate: {
    rest: { rotate: 0, scale: 1, opacity: 0.8 },
    hover: {
      rotate: 0, // Removed movement
      scale: 1, // Stay centered
      opacity: 1,
      filter: "brightness(1.2) drop-shadow(0px 0px 8px rgba(255,255,255,0.2))",
      transition: { duration: 0.3 },
    },
  },

  // Heartbeat/Pulse (Simplified to just brightness)
  pulse: {
    rest: { scale: 1, opacity: 0.8 },
    hover: {
      scale: 1,
      opacity: 1,
      filter: "brightness(1.2)",
      transition: { duration: 0.3 },
    },
  },

  // Elegant lift (Simplified)
  lift: {
    rest: { y: 0, scale: 1, opacity: 0.8 },
    hover: {
      y: 0,
      scale: 1,
      opacity: 1,
      filter: "brightness(1.2)",
      transition: { duration: 0.3 },
    },
  },

  // Tilt/Wiggle (Simplified)
  tilt: {
    rest: { rotate: 0, scale: 1, opacity: 0.8 },
    hover: {
      rotate: 0,
      scale: 1,
      opacity: 1,
      filter: "brightness(1.2)",
      transition: { duration: 0.3 },
    },
  },

  // Float (Simplified)
  float: {
    rest: { y: 0, rotate: 0, scale: 1, opacity: 0.8 },
    hover: {
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      filter: "brightness(1.2)",
      transition: { duration: 0.3 },
    },
  },

  // Glow (Ideas)
  glow: {
    rest: { scale: 1, filter: "brightness(1)", opacity: 0.8 },
    hover: {
      scale: 1,
      opacity: 1,
      filter: "brightness(1.3) drop-shadow(0px 0px 10px rgba(255,251,0,0.3))",
      transition: { duration: 0.3 },
    },
  },

  // Standard Scale (Default)
  scale: {
    rest: { scale: 1, opacity: 0.8 },
    hover: {
      scale: 1,
      opacity: 1,
      filter: "brightness(1.2)",
      transition: { duration: 0.3 },
    },
  },
};

// Map specific icons to their best animation variant
export const ICON_TO_VARIANT: Record<string, keyof typeof ICON_ANIMATION_VARIANTS> = {
  // Rotation
  Globe: "rotate",
  Atom: "rotate",
  Cpu: "rotate",
  Settings: "rotate",
  RefreshCw: "rotate",

  // Pulse
  Heart: "pulse",
  Activity: "pulse",

  // Lift/Bounce
  BookOpen: "lift",
  Book: "lift",
  Briefcase: "lift",
  Calculator: "lift",
  GraduationCap: "lift",
  Library: "lift",

  // Tilt/Wiggle
  FlaskConical: "tilt",
  Microscope: "tilt",
  TestTube: "tilt",
  Stethoscope: "tilt",
  Beaker: "tilt",

  // Float
  Music: "float",
  Camera: "float",
  Film: "float",
  Palette: "float",
  PenTool: "float",
  Image: "float",

  // Glow
  Lightbulb: "glow",
  Moon: "glow",
  Sun: "glow",

  // Default
  Code: "scale",
  Binary: "scale",
  Gamepad2: "scale",
  Users: "scale",
  Headphones: "pulse",
  Bot: "float",
};

export function getIconVariant(iconName: string) {
  return ICON_TO_VARIANT[iconName] || "scale";
}
