/**
 * Re-exports de todos los tipos del dominio dashboard
 */

// Entidades principales
export * from './entities';

// Filtros y búsquedas
export * from './filters';

// Workflows, IA e importación
export * from './workflows';

// Re-exportar también los tipos compartidos para conveniencia
export type {
  EntityStatus as IssueStatus, // Alias para compatibilidad
  IssueType,
  IssueSubType,
  Priority,
  HealthStatus,
  SprintStatus,
  UserRole,
  ProjectStatus,
  ActivityAction,
  AuditScope,
  ConfidenceLevel,
  AiMode
} from '../../shared/common';
