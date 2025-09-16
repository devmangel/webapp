# Manual de Pruebas

Este proyecto utiliza Jest y React Testing Library para obtener retroalimentación rápida y determinista sobre la UI y la lógica. A continuación encontrarás cómo está organizada la estrategia de pruebas, qué herramientas usamos y cuándo conviene escribir nuevos tests.

## Stack principal
- **Jest 30** – ejecuta todos los suites con soporte para ESM moderno, reportes de cobertura y un modo watch cómodo.
- **React Testing Library** – prueba componentes a través de interacciones de usuario (`render`, `screen`, `userEvent`).
- **Matchers de `@testing-library/jest-dom`** – permiten aserciones expresivas como `toBeInTheDocument`, `toHaveTextContent` o `toHaveClass`.
- **Helper de renderizado** – `test-utils` envuelve los componentes con proveedores compartidos; extiéndelo cuando agregues providers o decoradores globales.
- **Mocks compartidos** – viven bajo `tests/__mocks__`. Los assets estáticos se resuelven con `fileMock.ts`; las particularidades de Next.js se mockean en `jest.setup.ts`.

### Material complementario
- [Guía rápida de Jest](./jest.md)
- [Guía de mocks y stubs](./mocks.md)
- [Hooks de Husky y lint-staged](./husky.md)
- [Pipeline de CI en GitHub Actions](./ci.md)

## Comandos clave
Ejecuta la suite localmente con los scripts definidos en `package.json`:

```bash
npm run test           # ejecuta toda la suite una vez (falla en rojo)
npm run test:watch     # reejecuta los suites afectados al cambiar archivos
npm run test:coverage  # genera resumen en consola + HTML en coverage/
npm run lint           # eslint con --max-warnings=0 (pre-commit y CI)
```

> Husky + lint-staged ejecutan `npm run lint` y las pruebas relacionadas con los archivos stageados antes de cada commit. Asegúrate de tener instalado el hook (`npm install` dispara `npm run prepare`).

## Dónde viven los tests
- Coloca los tests junto al código (`__tests__` o sufijo `*.test.tsx`). Ejemplo: `src/app/components/ui/__tests__/Button.test.tsx`.
- Las utilidades reutilizables pueden residir en `tests/` (p. ej. `tests/utils/test-utils.tsx`).
- Evita mezclar historias de Storybook y tests en el mismo archivo salvo que uses snapshots intencionalmente.

## Buenas prácticas al escribir tests
1. **Comienza desde el comportamiento.** Renderiza el componente, simula la intención del usuario y aserta sobre resultados visibles (copys, roles ARIA, cambios en el DOM).
2. **Usa queries accesibles.** Prioriza `getByRole`, `getByLabelText` o `findByRole` en lugar de selectores frágiles.
3. **Mockea los límites externos.** Llamadas de red, router de Next.js, traducciones y autenticación se mockean globalmente en `jest.setup.ts`. Agrega mocks puntuales en `tests/__mocks__` cuando sea necesario.
4. **Evita detalles de implementación.** No asserts sobre estado interno o llamadas a funciones privadas salvo que pruebes lógica pura.
5. **Snapshots con moderación.** Prefiere aserciones explícitas; reserva snapshots para marcado estable (ej. plantillas de correo).

## ¿Cuándo escribir o actualizar tests?
Añade o ajusta tests cuando:
- Lanzas un nuevo flujo de UI, hook o utilidad con ramificaciones de lógica.
- Corriges un bug que no debe regresar (primero escribe el test de regresión).
- Refactorizas comportamiento que ya tenía cobertura (actualiza las expectativas existentes).
- Publicas APIs consumidas por otros módulos; los contract tests previenen cambios rompientes.

Puedes posponer tests únicamente cuando:
- El trabajo es exploratorio y aún no saldrá a producción (abrir ticket de seguimiento).
- La funcionalidad se eliminará en breve y sin impacto para usuarios finales.

## Cobertura esperada
- La suite genera cobertura automáticamente (`coverage/` cuando ejecutas `npm run test:coverage`). Para módulos críticos (auth, onboarding, pagos) aspiramos a **≥ 80 % de coverage de statements** y elevamos el umbral según criticidad.
- Usa `npm run test:coverage -- --collectCoverageOnlyFrom=<glob>` para auditar áreas específicas al integrar features grandes.

## Integración continua
GitHub Actions (`.github/workflows/ci.yml`) ejecuta lint + Jest en Node.js 20. Un job en rojo bloquea el merge. Alinea tu versión local de Node (≥ 20.17 recomendado) para evitar sorpresas.

## Resolución de problemas comunes
- **Modulo no encontrado:** verifica que el alias exista tanto en `tsconfig.json` como en `jest.config.ts`.
- **DOM inesperado:** inspecciona con `screen.debug()` y compáralo con el diseño esperado.
- **Pruebas asíncronas inestables:** espera actualizaciones del DOM con `await screen.findBy...` y usa `userEvent` para simular interacciones reales.

Para más detalles revisa `jest.config.ts` y `jest.setup.ts` en la raíz del proyecto.
