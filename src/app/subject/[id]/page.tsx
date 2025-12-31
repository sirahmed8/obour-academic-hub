import { SubjectClient } from './SubjectClient';

export async function generateStaticParams() {
  return [{ id: '1' }];
}

export default function SubjectPage({ params }: { params: { id: string } }) {
  return <SubjectClient />;
}
