# Jest para principiantes

Jest es el test runner que orquesta toda nuestra suite. Se encarga de ejecutar los archivos `*.test.ts(x)`/`*.spec.ts(x)`, interpretar TypeScript, mockear dependencias y generar reportes de cobertura.

## Conceptos clave
- **Runner + Asserciones**: Jest trae su propio motor de ejecución y un conjunto de matchers (`expect`, `toEqual`, `toHaveBeenCalled`, etc.).
- **Módulos transformados**: con `next/jest` aprovechamos la configuración de Next.js para transpilar ES Modules y TypeScript sin pasos extra.
- **Entorno DOM**: usamos `jest-environment-jsdom`, ideal para componentes cliente.

## Archivos relevantes
- `jest.config.ts` – punto central de configuración. Ajustamos alias de módulos, directorios ignorados y reporters.
- `jest.setup.ts` – se ejecuta antes de cada suite; aquí registramos `@testing-library/jest-dom` y mocks globales.
- `tests/utils/test-utils.tsx` – helper de renderizado con providers compartidos.

## Comandos más usados
```bash
npm run test           # ejecuta toda la suite
npm run test -- Button # filtra suites que contienen "Button"
npm run test:watch     # modo interactivo para desarrollo
npm run test:coverage  # genera reporte de cobertura
```

## Flujos recomendados
1. Corre `npm run test:watch` al implementar un feature UI. Usa el prompt interactivo (`p` para filtrar por nombre de archivo, `t` por nombre de test).
2. Realiza cambios en tu componente y en el test en paralelo; Jest vuelve a ejecutar sólo las suites impactadas.
3. Antes de abrir un PR, ejecuta `npm run test` para asegurarte que todo pasa en modo CI (sin watch).

## Recursos útiles
- [Documentación oficial de Jest](https://jestjs.io/docs/getting-started)
- [Guía de Testing Library](https://testing-library.com/docs/react-testing-library/intro)

Si necesitas habilitar nuevas capacidades (snapshots, reporters personalizados, etc.) abre un issue para discutirlo con el equipo.
