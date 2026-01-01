"use client";

import { SubjectClient } from "./SubjectClient";

// Generate a placeholder for static export
// Firebase hosting rewrites handle actual dynamic paths
export const dynamicParams = true;

export function generateStaticParams() {
  // Return placeholder - Firebase SPA rewrites handle the rest
  return [{ id: "placeholder" }];
}

export default function SubjectPage() {
  return <SubjectClient />;
}
