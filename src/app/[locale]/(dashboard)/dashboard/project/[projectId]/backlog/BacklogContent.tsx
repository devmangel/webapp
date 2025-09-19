'use client';

import { BacklogPlanningView } from 'app/components/backlog/BacklogPlanningView';

export function BacklogContent({ projectId }: { projectId: string }) {
  return <BacklogPlanningView projectId={projectId} />;
}
