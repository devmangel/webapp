# Audit Log - Sistema de Auditoría

## Tabla de Contenidos
- [¿Qué es el Audit Log?](#qué-es-el-audit-log)
- [¿Por qué es importante?](#por-qué-es-importante)
- [Estructura de la Tabla](#estructura-de-la-tabla)
- [¿Cómo funciona?](#cómo-funciona)
- [Implementación en la App](#implementación-en-la-app)
- [Tipos de Eventos](#tipos-de-eventos)
- [Mejores Prácticas](#mejores-prácticas)
- [Ejemplos de Uso](#ejemplos-de-uso)

## ¿Qué es el Audit Log?

El **Audit Log** es un sistema centralizado de registro que captura y almacena de forma inmutable todas las actividades críticas realizadas por los usuarios en la aplicación. Es un historial cronológico de eventos que permite rastrear quién hizo qué, cuándo y en qué contexto.

### Características Principales
- ✅ **Inmutable:** Los registros no pueden ser modificados una vez creados
- ✅ **Cronológico:** Ordenado por timestamp para reconstruir secuencias de eventos
- ✅ **Contextual:** Incluye información relevante del estado y metadatos
- ✅ **Filtrable:** Permite consultas por usuario, acción, scope, etc.

## ¿Por qué es importante?

### 1. **Compliance y Auditoría**
- Cumplimiento de regulaciones (GDPR, SOX, HIPAA, etc.)
- Auditorías internas y externas
- Evidencia legal en caso de disputas

### 2. **Seguridad y Detección de Amenazas**
- Identificar patrones sospechosos de actividad
- Detectar accesos no autorizados
- Análisis forense en caso de incidentes de seguridad

### 3. **Debug y Troubleshooting**
- Rastrear el origen de problemas o bugs
- Entender secuencias de eventos que llevaron a errores
- Reproducir escenarios problemáticos

### 4. **Analytics y Métricas de Negocio**
- Entender patrones de uso de la aplicación
- Medir adopción de funcionalidades
- Identificar cuellos de botella en procesos

### 5. **Responsabilidad y Transparencia**
- Accountability de acciones de usuarios
- Transparencia en procesos críticos
- Historial de cambios para rollbacks

## Estructura de la Tabla

```sql
Table "public.audit_log"
   Column   |           Type           | Collation | Nullable |      Default      
------------+--------------------------+-----------+----------+-------------------
 id         | uuid                     |           | not null | gen_random_uuid()
 actor_id   | uuid                     |           |          | 
 action     | text                     |           | not null | 
 scope      | text                     |           | not null | 
 target_id  | uuid                     |           |          | 
 metadata   | jsonb                    |           |          | 
 created_at | timestamp with time zone |           | not null | 
 ip_address | text                     |           |          | 

Indexes:
    "pk_audit_log" PRIMARY KEY, btree (id)
    "idx_audit_log_actor_id" btree (actor_id)

Foreign-key constraints:
    "fk_audit_log_actor_id" FOREIGN KEY (actor_id) REFERENCES users(id)
```

### Descripción de Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del evento de auditoría |
| `actor_id` | UUID | ID del usuario que realizó la acción (NULL para acciones del sistema) |
| `action` | Text | Tipo de acción realizada (ej: `created`, `updated`, `deleted`) |
| `scope` | Text | Contexto o entidad afectada (ej: `ISSUE`, `PROJECT`, `USER`) |
| `target_id` | UUID | ID de la entidad específica afectada |
| `metadata` | JSONB | Información adicional flexible sobre la acción |
| `created_at` | Timestamp | Momento exacto cuando ocurrió la acción |
| `ip_address` | Text | Dirección IP desde donde se realizó la acción |

## ¿Cómo funciona?

### 1. **Captura Automática**
Los eventos se capturan automáticamente mediante:
- **Server Actions** en Next.js
- **API Route Handlers** 
- **Servicios de dominio** específicos
- **Triggers de base de datos** (para casos críticos)

### 2. **Filtrado Contextual**
En el dashboard, el audit log se filtra por contexto de usuario:
- Solo muestra actividades de usuarios en proyectos donde el usuario actual tiene acceso
- Implementado en `ProjectDashboardService.getFilteredAuditLog()`

### 3. **Almacenamiento Eficiente**
- Uso de **JSONB** para metadata flexible
- **Índices optimizados** por actor_id para queries frecuentes
- **Retención automática** (configurar según necesidades)

## Implementación en la App

### 1. **Servicio Central de Audit Log**

Crear `src/modules/audit/services/audit-log.service.ts`:

```typescript
export class AuditLogService {
  async logEvent(params: {
    actorId?: string;
    action: string;
    scope: string;
    targetId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }) {
    const { data, error } = await this.supabase
      .from('audit_log')
      .insert({
        actor_id: params.actorId,
        action: params.action,
        scope: params.scope,
        target_id: params.targetId,
        metadata: params.metadata,
        ip_address: params.ipAddress,
      });

    if (error) {
      console.error('[AuditLog] Failed to log event:', error);
      // No debe fallar la operación principal si falla el audit
    }
  }
}
```

### 2. **Interceptores en Server Actions**

```typescript
// src/app/lib/audit/server-action-wrapper.ts
export function withAudit<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  auditConfig: {
    scope: string;
    action: string;
    getTargetId?: (...args: T) => string;
    getMetadata?: (...args: T) => Record<string, any>;
  }
) {
  return async (...args: T): Promise<R> => {
    const user = await getCurrentUser();
    const result = await action(...args);
    
    // Log después de operación exitosa
    await auditService.logEvent({
      actorId: user?.id,
      action: auditConfig.action,
      scope: auditConfig.scope,
      targetId: auditConfig.getTargetId?.(...args),
      metadata: auditConfig.getMetadata?.(...args),
    });
    
    return result;
  };
}
```

### 3. **Uso en Server Actions**

```typescript
// src/modules/issues/actions/issue-actions.ts
export const createIssue = withAudit(
  async (formData: FormData) => {
    const issueData = parseFormData(formData);
    const newIssue = await issueService.create(issueData);
    revalidateTag('issues');
    return newIssue;
  },
  {
    scope: 'ISSUE',
    action: 'created',
    getTargetId: () => newIssue?.id,
    getMetadata: (formData) => ({
      projectId: formData.get('projectId'),
      type: formData.get('type'),
      priority: formData.get('priority'),
    }),
  }
);
```

### 4. **Audit en Servicios de Dominio**

```typescript
// src/modules/projects/services/project-members.service.ts
export class ProjectMembersService {
  async inviteUserToProject(params: InviteUserParams) {
    const newMember = await this.createMembership(params);
    
    // Audit log
    await this.auditService.logEvent({
      actorId: params.invitedBy,
      action: 'invited',
      scope: 'PROJECT_MEMBER',
      targetId: newMember.id,
      metadata: {
        projectId: params.projectId,
        userEmail: params.email,
        role: params.role,
      },
    });
    
    return newMember;
  }
}
```

## Tipos de Eventos

### **Actions Comunes**
- `created` - Creación de entidades
- `updated` - Modificación de entidades
- `deleted` - Eliminación de entidades
- `invited` - Invitaciones de usuario
- `accepted` - Aceptación de invitaciones
- `rejected` - Rechazo de invitaciones
- `assigned` - Asignaciones
- `unassigned` - Remoción de asignaciones
- `status_changed` - Cambios de estado
- `role_changed` - Cambios de roles
- `login` - Inicio de sesión
- `logout` - Cierre de sesión

### **Scopes por Entidad**
- `USER` - Operaciones de usuario
- `PROJECT` - Operaciones de proyecto  
- `PROJECT_MEMBER` - Membresías de proyecto
- `ISSUE` - Issues/tickets
- `EPIC` - Epics
- `SPRINT` - Sprints
- `COMMENT` - Comentarios
- `ATTACHMENT` - Archivos adjuntos

### **Ejemplos de Metadata**

```typescript
// Creación de issue
{
  projectId: "proj-123",
  type: "BUG",
  priority: "HIGH",
  assigneeId: "user-456"
}

// Cambio de estado
{
  from: "IN_PROGRESS",
  to: "DONE",
  sprintId: "sprint-789"
}

// Invitación de usuario
{
  projectId: "proj-123",
  userEmail: "user@example.com", 
  role: "CONTRIBUTOR"
}
```

## Mejores Prácticas

### ✅ **Qué Auditar**
- Creación, modificación, eliminación de entidades críticas
- Cambios de permisos y roles
- Acciones administrativas
- Acceso a datos sensibles
- Operaciones financieras o de billing
- Cambios de configuración del sistema

### ❌ **Qué NO Auditar**
- Lectura de datos públicos o no sensibles
- Operaciones muy frecuentes (ej: cada view de página)
- Datos temporales o de cache
- Operaciones internas del sistema sin impacto de negocio

### **Estructura de Metadata**

```typescript
// ✅ Buena estructura
{
  before: { status: "TODO" },
  after: { status: "IN_PROGRESS" },
  reason: "Starting work on this task",
  sprintId: "sprint-123"
}

// ❌ Evitar
{
  raw_request_body: "...", // Muy verboso
  password_hash: "...",    // Datos sensibles
  temp_data: "..."         // Datos temporales
}
```

### **Performance**
- Usar **batch inserts** para múltiples eventos
- **Índices** apropiados para queries frecuentes
- **Archivado automático** de eventos antiguos
- **Limitar metadata** para evitar registros muy grandes

### **Retención de Datos**

```sql
-- Ejemplo de política de retención (ejecutar mensualmente)
DELETE FROM audit_log 
WHERE created_at < NOW() - INTERVAL '2 years'
  AND scope NOT IN ('USER', 'PROJECT_MEMBER'); -- Mantener eventos críticos más tiempo
```

## Ejemplos de Uso

### **1. Rastrear Cambios en un Issue**

```typescript
// Obtener historial de cambios de un issue
const issueHistory = await supabase
  .from('audit_log')
  .select('*')
  .eq('scope', 'ISSUE')
  .eq('target_id', issueId)
  .order('created_at', { ascending: true });
```

### **2. Actividad de Usuario Específico**

```typescript
// Ver todas las acciones de un usuario en el último mes
const userActivity = await supabase
  .from('audit_log')
  .select('*, users(name)')
  .eq('actor_id', userId)
  .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString())
  .order('created_at', { ascending: false });
```

### **3. Eventos de Seguridad**

```typescript
// Detectar múltiples intentos de login fallidos
const suspiciousActivity = await supabase
  .from('audit_log')
  .select('*')
  .eq('scope', 'USER')
  .eq('action', 'login_failed')
  .gte('created_at', new Date(Date.now() - 60*60*1000).toISOString()) // Última hora
  .order('created_at', { ascending: false });
```

### **4. Analytics de Producto**

```typescript
// Issues creadas por proyecto en el último trimestre
const issueCreationStats = await supabase
  .from('audit_log')
  .select('metadata')
  .eq('scope', 'ISSUE')
  .eq('action', 'created')
  .gte('created_at', new Date(Date.now() - 90*24*60*60*1000).toISOString());

// Procesar metadata para extraer estadísticas por proyecto
const statsByProject = issueCreationStats.reduce((acc, log) => {
  const projectId = log.metadata?.projectId;
  if (projectId) {
    acc[projectId] = (acc[projectId] || 0) + 1;
  }
  return acc;
}, {});
```

---

## Conclusión

El Audit Log es una pieza fundamental para la **confiabilidad, seguridad y compliance** de la aplicación. Su implementación correcta proporciona:

- **Transparencia** total de operaciones
- **Trazabilidad** completa de cambios  
- **Seguridad** mejorada mediante detección de anomalías
- **Compliance** con regulaciones y auditorías
- **Insights** valiosos sobre el uso del sistema

Al seguir las prácticas recomendadas en esta documentación, el audit log se convierte en una herramienta poderosa para mantener la integridad y confianza en el sistema.
