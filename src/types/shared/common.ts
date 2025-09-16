/**
 * Tipos básicos y enums compartidos entre módulos
 */

// Estados básicos para entidades
export type EntityStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

// Tipos de issues
export type IssueType = 'EPIC' | 'STORY' | 'TASK';
export type IssueSubType = 'FE' | 'BE' | 'OPS' | 'DOCS';

// Prioridades
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Estados de salud para epics
export type HealthStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';

// Estados de sprint
export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// Roles de usuario
export type UserRole = 'ADMIN' | 'PM' | 'CONTRIBUTOR' | 'VIEWER';

// Estados de proyecto
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

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
