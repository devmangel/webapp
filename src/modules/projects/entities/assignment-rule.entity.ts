/**
 * Regla de asignación de issues basada en etiquetas y roles.
 */
export interface AssignmentRule {
  id: string;
  labelPattern: string;
  preferredRoles: ('PM' | 'CONTRIBUTOR')[];
  preferredSkills: string[];
  fallbackAssigneeId?: string;
}
