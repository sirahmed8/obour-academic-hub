import { SubjectClient } from "./SubjectClient";

// For static export, we generate NO params at build time
// This effectively makes it a "catch-all" that requires client-side data fetching
// Firebase hosting rewrites will handle the routing to this page
export async function generateStaticParams() {
  return [];
}

export default function SubjectPage() {
  return <SubjectClient />;
}
