/**
 * Re-exports de todos los tipos del dominio dashboard
 */

// Entidades principales de los módulos
export * from '../../modules/projects/entities/project.entity';
export * from '../../modules/projects/entities/assignment-rule.entity';
export * from '../../modules/epics/entities/epic.entity';
export * from '../../modules/sprints/entities/sprint.entity';
export * from '../../modules/issues/entities/issue.entity';
export * from '../../modules/issues/entities/issue-types';
export * from '../../modules/users/entities/user.entity';

// Filtros y búsquedas
export * from './filters';

// Workflows, IA e importación
export * from './workflows';

// Re-exportar también los tipos compartidos para conveniencia
export type {
  EntityStatus as IssueStatus, // Alias para compatibilidad
  ActivityAction,
  AuditScope,
  ConfidenceLevel,
  AiMode
} from '../shared/common';
