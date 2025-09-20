/**
 * Roles de usuario
 */
export type UserRole = 'ADMIN' | 'PM' | 'CONTRIBUTOR' | 'VIEWER';

/**
 * Miembro del equipo
 */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarUrl?: string;
  timezone: string;
  capacityPerSprint: number;
  skills: string[];
  active: boolean;
  focusAreas: string[];
}
