import { BacklogContent } from './BacklogContent';

interface BacklogPageProps {
  params: Promise<{ locale: string; projectId: string }> | { locale: string; projectId: string };
}

export default async function BacklogPage({ params }: BacklogPageProps) {
  const resolvedParams = await params;
  return <BacklogContent projectId={resolvedParams.projectId} />;
}
