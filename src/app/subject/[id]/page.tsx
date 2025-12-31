import { SubjectClient } from "./SubjectClient";

// Force dynamic rendering to handle any subject ID
export const dynamic = "force-dynamic";

export default function SubjectPage() {
  return <SubjectClient />;
}
