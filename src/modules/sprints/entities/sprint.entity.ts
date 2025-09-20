/**
 * Estados de sprint
 */
export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

/**
 * Entidad que representa un sprint en el sistema.
 */
export interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: SprintStatus;
  capacity: number;
  startDate: string;
  endDate: string;
  projectId: string;
  issueIds: string[];
}
