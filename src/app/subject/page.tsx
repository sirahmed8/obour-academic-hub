import { Suspense } from "react";
import { SubjectClient } from "./SubjectClient";

export default function SubjectPage() {
  return (
    <Suspense>
      <SubjectClient />
    </Suspense>
  );
}
