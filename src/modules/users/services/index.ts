/**
 * Exportaciones de servicios del módulo de usuarios
 */

// Servicio principal de autenticación y gestión de usuarios
export { UserAuthService, userAuthService } from './user-auth.service';
export type { 
  CreateUserParams, 
  UpdateUserProfileParams, 
  UserProfile 
} from './user-auth.service';

// Servicio de invitaciones de usuarios
export { UserInvitationService, userInvitationService } from './user-invitation.service';
export type { 
  CreateInvitationParams, 
  PendingInvitation 
} from './user-invitation.service';

// Servicio de proyectos de usuario (ya existente)
export { UserProjectsService } from './user-projects.service';
