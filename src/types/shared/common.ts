/**
 * Tipos básicos y enums compartidos entre módulos
 */

// Estados básicos para entidades
export type EntityStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';


// Acciones de actividad/auditoria
export type ActivityAction = 
  | 'status_changed'
  | 'comment_added'
  | 'assignee_changed'
  | 'points_updated'
  | 'description_updated'
  | 'label_added'
  | 'label_removed';

// Scopes de auditoria
export type AuditScope = 'ISSUE' | 'SPRINT' | 'PROJECT' | 'RULE';

// Niveles de confianza para IA
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// Modos de IA
export type AiMode = 'CONSERVATIVE' | 'BALANCED' | 'CREATIVE';
