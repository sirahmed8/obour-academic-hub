import { Suspense } from "react";
import { SubjectClient } from "../SubjectClient";

interface PageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateStaticParams() {
  return [];
}

export default async function SubjectPage({ params }: PageProps) {
  const { name } = await params;
  return (
    <Suspense>
      <SubjectClient subjectName={name} />
    </Suspense>
  );
}
