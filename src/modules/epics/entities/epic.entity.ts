import { EntityStatus } from '../../../types/shared/common';

/**
 * Estados de salud para epics
 */
export type HealthStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';

/**
 * Entidad que representa una épica en el sistema.
 */
export interface Epic {
  id: string;
  key: string;
  name: string;
  objective: string;
  projectId: string;
  ownerId?: string;
  status: EntityStatus;
  storyIds: string[];
  health: HealthStatus;
}
