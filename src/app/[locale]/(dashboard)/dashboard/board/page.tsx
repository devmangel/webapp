import { KanbanBoard } from 'components/board';

interface BoardPageProps {
  params: Promise<{ locale: string }> | { locale: string };
}

export default async function BoardPage({ }: BoardPageProps) {
  return (
    <div className="h-full">
      <KanbanBoard />
    </div>
  );
}
