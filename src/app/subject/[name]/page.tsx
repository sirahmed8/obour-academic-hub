import { Suspense } from "react";
import { SubjectClient } from "../SubjectClient";

interface PageProps {
  params: {
    name: string;
  };
}

export default function SubjectPage({ params }: PageProps) {
  return (
    <Suspense>
      <SubjectClient subjectName={params.name} />
    </Suspense>
  );
}
