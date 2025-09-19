import { KanbanBoard } from 'components/board';

interface BoardPageProps {
  params: Promise<{ locale: string; projectId: string }> | { locale: string; projectId: string };
}

export default async function BoardPage({ }: BoardPageProps) {

  return <KanbanBoard />;
}
