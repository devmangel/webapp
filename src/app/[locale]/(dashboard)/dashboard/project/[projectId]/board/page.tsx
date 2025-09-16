import { BoardContent } from './BoardContent';

interface BoardPageProps {
  params: Promise<{ locale: string; projectId: string }> | { locale: string; projectId: string };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const resolvedParams = await params;
  return <BoardContent projectId={resolvedParams.projectId} />;
}
