# Arquitectura de la Aplicación

## 🏗️ Visión general
La aplicación sigue un enfoque **App Router** con soporte multi-idioma y separación estricta entre componentes de servidor y cliente. El flujo principal es:

```
Next.js App Router → Layouts específicos por segmento → Shell del dashboard → Páginas funcionales
                                        ↓
                                Hooks + Zustand para estado
```

La autenticación se resuelve en el servidor y los datos se consultan vía Supabase usando un cliente con rol de servicio.

## 🌐 Rutas e internacionalización
- El layout raíz vive en `src/app/layout.tsx` y aplica tipografías Geist y estilos globales.
- Rutas localizadas se agrupan bajo `src/app/[locale]/`, permitiendo URL como `/es/dashboard/overview`.
- La configuración de idiomas usa `next-intl` (`src/i18n/routing.ts`), con locales `en`, `es`, `zh`, `ar` y detección manual. Se exportan helpers (`Link`, `redirect`, `usePathname`) tipados.
- Cada subsección importante (login, signup, dashboard) tiene su propio layout y páginas bajo el prefijo del locale.

## 🧱 Layouts y shell del dashboard
- `src/app/[locale]/(dashboard)/layout.tsx` envuelve todas las vistas del panel con `DashboardShell`.
- `DashboardShell` (`src/app/components/dashboard/DashboardShell.tsx`) es un componente cliente que:
  - Inicializa el store global con `useDashboardInit`.
  - Construye la navegación contextual (Overview, Team, Board, Backlog, Import, AI Preview).
  - Renderiza filtros persistentes y maneja estados de carga/errores.
- Las subsecciones (`overview`, `team`, `board`, `backlog`, `import`) son componentes cliente que leen del store y presentan distintas vistas de los mismos datos.

## 🎨 Sistema de diseño y UI
- Tailwind es la base visual; el tema se define en `tailwind.config.ts` con paletas para `primary`, `secondary`, estados (`error`, `success`, `warning`) y soporte dark mode por clase.
- Componentes reutilizables (`src/app/components/ui/`) encapsulan patrones como `Card`, `Spinner` y badges de estado.
- Los estilos globales y variables CSS viven en `src/app/globals.css`.

## 🔐 Autenticación server-first
- El módulo de auth reside en `src/app/lib/auth/` con entry-point en `server.ts`. Todas las acciones de login/logout se ejecutan en el servidor usando `next-auth`.
- Las páginas de login/signup en `src/app/[locale]/login` y `src/app/[locale]/signup` re-exportan componentes server y metadata listos para el App Router.
- Para detalles completos consulta `docs/auth/README.md` y derivados.

## 🧩 Estado y lógica cliente
- `src/modules/dashboard/state/dashboard-store.ts` define el store de Zustand con el snapshot del dashboard, filtros activos y mutadores de negocio (mover issues, asignar, registrar actividad).
- `src/hooks/useDashboardInit.ts` dispara la carga inicial (`GET /api/dashboard/state`) al montar el shell.
- Funciones utilitarias para KPI, filtros y formato viven en `src/app/components/utils/`, manteniendo la lógica presentacional agrupada.

## 🗂️ Tipos compartidos
- Todos los tipos de dominio del dashboard se centralizan en `src/types/domain/dashboard/`. El índice re-exporta entidades, filtros y workflows, además de alias convenientes (`IssueStatus`, `Priority`, etc.).
- Los tipos generados desde Supabase están en `src/types/database/` y sirven para mapear filas SQL en la API del dashboard.

Esta arquitectura favorece componentes de servidor para obtener datos seguros, componentes cliente livianos para interacción, y un único store global para sincronizar las distintas vistas del panel.
