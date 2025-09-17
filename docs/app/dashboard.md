# Dashboard Interactivo

## 🧊 Snapshot inicial
- El estado global se administra con `useDashboardStore` (`src/modules/dashboard/state/dashboard-store.ts`).
- Al montar `DashboardShell`, el hook `useDashboardInit` hace `fetch('/api/dashboard/state')` y guarda:
  - `snapshot`: proyectos, épicas, sprints, issues, equipo, reglas de asignación y actividad.
  - `filters` y `baseFilters`: filtros por proyecto/sprint.
  - `activeProjectId`: el primer proyecto disponible.
- `isLoading`, `isHydrated` y `loadError` controlan la UI mientras llegan los datos.

## 🗺️ Páginas del panel
Ruta base: `src/app/[locale]/(dashboard)/dashboard/`

- **Overview** (`overview/page.tsx`): métricas del sprint, progreso por épica, issues bloqueados.
- **Team** (`team/page.tsx`): roster completo, capacidades por sprint y habilidades.
- **Board** (`board/page.tsx` y componentes en `app/components/dashboard/`): columnas por estado, drag & drop aún pendiente, utiliza `IssueCard`.
- **Backlog** (`backlog/page.tsx`): lista filtrable de issues incluyendo labels y story points.
- **Import** (`import/page.tsx`): interfaz para cargar markdown y disparar ingestión (conexión al endpoint a implementar).
- **AI Preview** (`ai/preview/page.tsx`): vista para sugerencias generadas por IA (placeholder con datos del store).

Cada página es un Client Component que consume directamente desde el store, garantizando consistencia en toda la navegación.

## 🧠 Store de Zustand
`DashboardStore` expone:

- **Estado**: `projects`, `epics`, `issues`, `sprints`, `team`, `assignmentRules`, `activity`, `filters`, `baseFilters`, `activeProjectId`, `selectedIssueId`.
- **Acciones principales**:
  - `loadInitialState()` · carga asíncrona del snapshot.
  - `setProject(projectId)` · aplica nuevo proyecto y reinicia filtros.
  - `setFilters(partial)` / `resetFilters()` · actualiza criterio de búsqueda.
  - `moveIssue(issueId, nextStatus, options)` · mutación optimista para columnas del board (actualiza sprints y registra actividad).
  - `assignIssue`, `updateIssue`, `toggleBlocked` · ajustan campos específicos manteniendo `updatedAt` sincronizado.
  - `addComment` · agrega comentarios inline.
  - `upsertAssignmentRule`, `removeAssignmentRule` · gestión de reglas en memoria.
  - `recordActivity` · apéndice manual al log.

> Actualmente las acciones no persisten cambios en Supabase; sirven como base para futuras Server Actions o llamadas a endpoints.

## 🛠️ Hooks y utilidades
- `useDashboardInit` (`src/hooks/useDashboardInit.ts`) evita llamadas duplicadas verificando `isHydrated`/`isLoading`.
- Utilidades de filtros y métricas (`src/app/components/utils/filters.ts`, `.../format.ts`) encapsulan cálculos como `computeKpis`, `computeEpicStats`, `issueMatchesFilters`.
- `PRIORITY_LABELS` y otras constantes visuales viven en `src/app/components/dashboard/constants.ts`.

## 🎨 Componentes destacados
- `DashboardShell` maneja la navegación lateral, layout responsivo y filtros sticky.
- `FiltersBar` expone selectores de proyecto, sprint, assignee, etiquetas y texto libre.
- `BoardColumn` + `IssueCard` renderizan cada estado en el board.
- `IssueDrawer` (si se instala) puede usarse para detallar un issue seleccionado vía `selectedIssueId`.

## 🚀 Extender el dashboard
1. **Persistir acciones**: reemplaza mutaciones locales por Server Actions (p.ej. `app/(dashboard)/actions/updateIssue.ts`) que llamen a Supabase y luego sincronicen el store.
2. **Nuevos filtros**: agrega campos en `DashboardFilters` (`src/types/domain/dashboard/filters.ts`) y actualiza `FiltersBar` + `issueMatchesFilters`.
3. **Integraciones externas**: usa `assignment_rules` y `audit_log` como ejemplo de tablas auxiliares para automatizaciones.

## Seed rapido
Para poblar datos mínimos durante el desarrollo, ejecuta en el SQL editor de Supabase (con clave de servicio):

```sql
-- Usuarios de ejemplo
INSERT INTO public.users (id, name, email, role, active, created_at, updated_at)
VALUES
  ('46327c75-7839-402e-b45b-85c19c46e3bd', 'agent', 'soporte@productos-ai.com', 'ADMIN', true, now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, role, capacity_per_sprint, active, created_at, updated_at)
VALUES
  ('06aec8c6-b939-491b-b711-f04d7670e045', 'test', 'test@productos-ai.com', 'dev', 10, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Proyecto y sprint
INSERT INTO public.projects (id, name, code, owner_id, status, created_at, updated_at)
VALUES ('e29422ac-a625-49b7-af2e-3977a45dffe1', 'pai', 'pai', '46327c75-7839-402e-b45b-85c19c46e3bd', 'active', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sprints (id, project_id, name, status, start_date, end_date, created_at, updated_at)
VALUES ('11111111-2222-3333-4444-555555555555', 'e29422ac-a625-49b7-af2e-3977a45dffe1', 'Sprint 1', 'ACTIVE', current_date, current_date + INTERVAL '14 day', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Issue de referencia
INSERT INTO public.issues (
  id, project_id, key, type, status, priority, summary, description,
  assignee_id, reporter_id, sprint_id, story_points, blocked,
  labels, definition_of_done, acceptance_criteria, watchers,
  created_at, updated_at
)
VALUES (
  '99999999-aaaa-bbbb-cccc-111111111111',
  'e29422ac-a625-49b7-af2e-3977a45dffe1',
  'PAI-1', 'story', 'todo', 'medium',
  'Onboarding API para clientes',
  'Documentar y crear endpoints para onboarding.',
  '06aec8c6-b939-491b-b711-f04d7670e045',
  '46327c75-7839-402e-b45b-85c19c46e3bd',
  '11111111-2222-3333-4444-555555555555',
  5, false,
  ARRAY['onboarding','api'],
  ARRAY['Code merged','Tests passing'],
  ARRAY['Cliente puede crear cuenta','Recibe email de bienvenida'],
  ARRAY['46327c75-7839-402e-b45b-85c19c46e3bd'],
  now(), now()
)
ON CONFLICT (id) DO NOTHING;
```

Después de correr el seed, recarga el dashboard para ver datos reales en todas las vistas.
