import { SubjectClient } from "./SubjectClient";

// For static export, provide a placeholder param to satisfy build requirements
// The client handling will take over for any actual ID
// Firebase hosting rewrites ensure correct routing
export async function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function SubjectPage() {
  return <SubjectClient />;
}
