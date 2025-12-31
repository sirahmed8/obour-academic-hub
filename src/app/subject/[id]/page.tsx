import { SubjectClient } from "./SubjectClient";

// For static export, provide placeholder params - actual content is fetched client-side
export async function generateStaticParams() {
  // Return placeholder - SubjectClient handles actual data fetching
  return [{ id: "placeholder" }];
}

export default function SubjectPage() {
  return <SubjectClient />;
}
