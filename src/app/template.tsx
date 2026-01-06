"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 100,
        mass: 0.5,
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
