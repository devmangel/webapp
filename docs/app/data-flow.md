# Flujo de Datos y Supabase

## 🔄 Resumen
El dashboard consume todos los datos desde Supabase mediante un endpoint server-side. El recorrido principal es:

```
Cliente (Zustand) ── fetch ──▶ /api/dashboard/state ──▶ Supabase (Service Role)
        ▲                                                        │
        └─────────────── mutaciones optimistas (store) ◀─────────┘
```

La sincronización inicial sucede al montar `DashboardShell`; después, las acciones del store actualizan el estado en memoria (aún no hay mutaciones persistentes).

## 🧵 Cliente Supabase
- `src/app/lib/supabase/server-client.ts` crea un cliente autenticado con `SUPABASE_SERVICE_ROLE_KEY`. Este archivo valida las variables `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` al arrancar el servidor.
- El client se usa exclusivamente desde Server Components o rutas API para evitar exponer la service key.

## 📡 Endpoint `/api/dashboard/state`
Ubicado en `src/app/api/dashboard/state/route.ts`:

1. Instancia el cliente server (`createSupabaseServerClient`).
2. Ejecuta un `Promise.all` con las tablas necesarias (`projects`, `epics`, `issues`, `sprints`, `users`, `assignment_rules`, `issue_dependencies`, `audit_log`).
3. Normaliza cada respuesta a tipos de dominio (`Project`, `Epic`, `Issue`, `Sprint`, `TeamMember`, `AssignmentRule`, `AuditLogEntry`).
4. Construye un `DashboardStateSnapshot` agregando relaciones (issueIds por proyecto/sprint, storyIds por épica, dependencias, etc.).
5. Define filtros por defecto (primer proyecto y sprint disponibles) y devuelve `{ snapshot, filters, activeProjectId }` como JSON.

El endpoint atrapa errores de Supabase y responde `500` en caso de fallo, dejando registro en consola (`console.error('Failed to load dashboard snapshot', error)`).

## 🗃️ Normalización y tipos
- Los mapeos `normalize*` transforman filas SQL (`types/dashboard-rows.ts`) a objetos ricos del dominio. Ejemplo: `normalizeIssue` agrega `comments: []`, asegura arrays para etiquetas, watchers y criterios.
- `DashboardStateSnapshot` vive en `src/types/domain/dashboard/` y define la forma esperada por el store de Zustand.

## 🔐 Seguridad y RLS
- El esquema de tablas se define en `supabase/migrations/20250916045656_create_tables.sql` (24 tablas).
- Las políticas RLS originales (`supabase/migrations/20250916050759_enable_rls_policies.sql`) restringen SELECT a miembros/autenticados.
- Para entornos sin login se añadió `supabase/migrations/20250917093000_relax_rls_preview.sql`, que permite lecturas anónimas (`auth.uid() IS NULL`) manteniendo los permisos de escritura intactos. Revertir esta migración antes de producción.

## ⚙️ Variables de entorno obligatorias
Archivo `.env` de ejemplo:

- `NEXT_PUBLIC_SUPABASE_URL` · URL del proyecto.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` · usada por el cliente público (aún no se consume en esta app).
- `SUPABASE_SERVICE_ROLE_KEY` · clave con privilegios para probar el backend desde el servidor.
- Credenciales de NextAuth (`GOOGLE_ID`, `GITHUB_SECRET`, etc.) y `NEXTAUTH_SECRET`.

Recuerda reiniciar `npm run dev` tras cambiar variables.

## 🧪 Datos iniciales y pruebas
- Usa el SQL de `docs/app/dashboard.md#seed-rapido` (ver sección) para poblar usuarios, proyectos y issues cuando trabajes localmente.
- La suite de pruebas (Jest) no mockea Supabase aún, por lo que cualquier test que toque el endpoint debe stubear `fetch` o usar fixtures.

Con este flujo garantizamos que todas las vistas del dashboard compartan un estado coherente y derivado de la base de datos, manteniendo el código cliente mínimo.
