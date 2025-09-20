# Sistema de Membresías de Proyecto

## Resumen

Se ha implementado un sistema completo de gestión de membresías de proyecto que permite:

- **Multi-tenancy**: Usuarios solo ven proyectos donde son miembros
- **Roles granulares**: ADMIN, PM, CONTRIBUTOR, VIEWER con permisos específicos
- **Sistema de invitaciones**: Invitar usuarios por email con roles específicos
- **Seguridad**: Row Level Security (RLS) en Supabase para aislamiento de datos

## Arquitectura

### Base de Datos

#### Tabla `project_members`
```sql
- id: UUID (PK)
- project_id: UUID (FK → projects.id)
- user_id: UUID (FK → users.id)  
- role: TEXT (ADMIN|PM|CONTRIBUTOR|VIEWER)
- invited_by: UUID (FK → users.id)
- status: TEXT (pending|active|suspended)
- invited_at, joined_at, created_at, updated_at: TIMESTAMP
```

#### Políticas RLS
- Usuarios solo ven miembros de proyectos donde participan
- Solo ADMIN/PM pueden gestionar membresías
- Usuarios pueden aceptar sus propias invitaciones

### Tipos y Entidades

#### Módulos Organizados
```
src/modules/
├── users/types/user-role.types.ts
├── projects/types/
│   ├── project.types.ts
│   └── project-member.types.ts
├── issues/types/issue.types.ts
└── projects/entities/project-member.entity.ts
```

#### Roles y Permisos
- **ADMIN**: Todos los permisos, puede eliminar proyecto
- **PM**: Gestionar sprints/epics, invitar/remover contributors
- **CONTRIBUTOR**: Crear/editar issues, comentar
- **VIEWER**: Solo lectura

### Servicios

#### ProjectMembersService
```typescript
- inviteUserToProject()     // Invitar por email
- acceptProjectInvitation() // Aceptar invitación  
- updateUserRole()          // Cambiar rol
- removeUserFromProject()   // Remover usuario
- getProjectMembers()       // Listar miembros
- suspendUser()            // Suspender temporalmente
```

#### UserProjectsService  
```typescript
- getUserProjects()         // Proyectos del usuario
- getOwnedProjects()       // Proyectos como owner
- acceptProjectInvitation() // Aceptar invitación
- getPendingInvitations()  // Invitaciones pendientes
- leaveProject()           // Abandonar proyecto
- getUserProjectStats()    // Estadísticas
```

### API Routes

#### `/api/projects/[projectId]/members`
- **GET**: Lista miembros del proyecto
- **POST**: Invita usuario al proyecto

#### `/api/invitations/[invitationId]/accept`  
- **POST**: Acepta invitación de proyecto

### Validación y Seguridad

#### Validación de Entrada
- Esquemas Zod para validar payloads
- Verificación de permisos en cada operación
- Validación de email existente antes de invitar

#### Seguridad
- Headers de autenticación (placeholder para implementar)
- Manejo de errores específicos con códigos HTTP apropiados
- Prevención de operaciones no autorizadas

## Uso

### 1. Invitar Usuario a Proyecto
```typescript
POST /api/projects/{projectId}/members
{
  "email": "usuario@email.com", 
  "role": "CONTRIBUTOR"
}
```

### 2. Aceptar Invitación
```typescript  
POST /api/invitations/{invitationId}/accept
```

### 3. Listar Miembros
```typescript
GET /api/projects/{projectId}/members
```

## Flujos Principales

### Crear Proyecto
1. Usuario crea proyecto → Se convierte automáticamente en ADMIN
2. Puede invitar otros usuarios con diferentes roles

### Invitar Usuario
1. ADMIN/PM invita por email → Status "pending"
2. Usuario recibe invitación → Puede aceptar/rechazar  
3. Al aceptar → Status cambia a "active"

### Gestión de Acceso
1. Todas las queries filtran por membresía activa
2. Issues/Sprints/Epics solo muestran asignables del proyecto
3. RLS previene acceso a datos de otros proyectos

## Patrones de Keys de Issues

- **TASK**: `{SUBTYPE}-{NUMBER}` (FE-20, BE-36, OPS-5, DOCS-1)
- **STORY**: `ST-{NUMBER}.{SUBNUMBER}` (ST-06.3, ST-09.1)  
- **EPIC**: `EP-{NUMBER}` (EP-1, EP-2)

## Próximos Pasos

1. **Autenticación**: Implementar obtención real de userId desde session/JWT
2. **Notificaciones**: Sistema de emails para invitaciones
3. **Transferencia**: Permitir transferir ownership de proyecto
4. **Auditoría**: Logs de cambios de membresía
5. **Testing**: Unit tests para servicios y API routes

## Migraciones Pendientes

Para aplicar los cambios:

```bash
# Aplicar migración Supabase
supabase db push

# Verificar políticas RLS
supabase db diff
```

## Consideraciones

- **Performance**: Índices en project_members para queries frecuentes
- **Escalabilidad**: Vistas materializadas para stats complejas
- **UX**: Interfaz para gestión visual de miembros
- **Mobile**: APIs compatibles con aplicaciones móviles
