/**
 * Estados de proyecto
 */
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

/**
 * Entidad que representa un proyecto en el sistema.
 */
export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  ownerId: string;
  epicIds: string[];
  issueIds: string[];
  sprintIds: string[];
}
