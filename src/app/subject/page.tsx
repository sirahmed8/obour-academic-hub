import { Suspense } from "react";
import SubjectHub from "./SubjectHub";

export default function SubjectPage() {
  return (
    <Suspense>
      <SubjectHub />
    </Suspense>
  );
}
