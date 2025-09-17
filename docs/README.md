# Documentación General de la Aplicación

## 🧭 Objetivo
Este repositorio implementa un panel de control para gestionar proyectos, backlog y equipo usando **Next.js App Router**, **Supabase** y **Zustand**. Esta guía resume cómo está organizada la app y qué módulos leer para entender el flujo completo, desde autenticación hasta la capa de datos.

## 📚 Ruta sugerida de lectura
1. [Arquitectura de la aplicación](./app/architecture.md) · Capas del App Router, internacionalización y diseño de componentes.
2. [Flujo de datos y Supabase](./app/data-flow.md) · Cómo se orquestan llamadas al backend, seguridad y variables de entorno.
3. [Dashboard interactivo](./app/dashboard.md) · Estado global, páginas del tablero y puntos de extensión.
4. [Autenticación](./auth/README.md) · Diseño server-first de NextAuth y componentes de login.
5. [Pruebas](./testing/README.md) · Estrategia de Jest, mocks y pipeline de CI.

Sigue el orden para tener primero la vista de alto nivel y luego profundizar en cada módulo.

## 🛠️ Stack principal
- **Next.js 15 App Router** (`src/app`) con segmentos por `locale` y layouts específicos de dashboard.
- **Supabase Postgres** como backend; tipos generados bajo `src/types/database/`.
- **Zustand** para el estado del dashboard (`src/modules/dashboard/state/dashboard-store.ts`).
- **Tailwind CSS** + tema personalizado (`tailwind.config.ts`).
- **next-intl** para rutas localizadas (`src/i18n/`).
- **NextAuth** para autenticación (servidor primero, `src/app/lib/auth/`).

## 📁 Carpetas clave
```
src/
├── app/                # Componentes, rutas y layouts principales
│   ├── [locale]/       # Segmento dinámico por idioma
│   ├── components/     # UI compartida (Cards, DashboardShell, etc.)
│   └── lib/            # Clientes supabase, auth y SEO helpers
├── modules/            # Estado y lógica de dominio (p.ej. dashboard)
├── types/              # Tipos de dominio, filas SQL y utilidades
├── hooks/              # Hooks reutilizables como useDashboardInit
supabase/
├── migrations/         # Esquema de tablas y políticas RLS
└── ...
docs/                  # Este árbol de documentación
```

## 🔗 Documentación complementaria
- [Autenticación](./auth/README.md) · Server Actions, proveedores y flujo de sesión.
- [Testing](./testing/README.md) · Guardias de calidad y automatización.
- [Supabase schema](../supabase/migrations/) · DDL completo y políticas activas.

Con estos documentos tienes un mapa actualizado para trabajar en nuevas funcionalidades, depurar problemas o preparar despliegues.
