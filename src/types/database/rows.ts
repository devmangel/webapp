/**
 * Tipos de filas de base de datos derivados del schema de Supabase
 */

import { Database } from './schema';

// Tipos de filas para cada tabla - estos corresponden a las filas leídas de la DB
export type UsersRow = Database['public']['Tables']['users']['Row'];
export type ProjectsRow = Database['public']['Tables']['projects']['Row'];
export type EpicsRow = Database['public']['Tables']['epics']['Row'];
export type SprintsRow = Database['public']['Tables']['sprints']['Row'];
export type IssuesRow = Database['public']['Tables']['issues']['Row'];
export type AssignmentRulesRow = Database['public']['Tables']['assignment_rules']['Row'];
export type IssueDependenciesRow = Database['public']['Tables']['issue_dependencies']['Row'];
export type AuditLogRow = Database['public']['Tables']['audit_log']['Row'];
