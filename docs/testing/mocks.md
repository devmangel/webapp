# Mocks y Stubs en el proyecto

Los mocks nos permiten aislar la lógica que probamos al reemplazar dependencias externas (APIs, router, SDKs). En Jest se declaran mediante `jest.mock(...)` o archivos dentro de `tests/__mocks__`.

## Tipos de mocks que usamos
- **Mocks automáticos**: `jest.mock('next/navigation', () => ...)` en `jest.setup.ts`. Útil para hooks o módulos globales.
- **Mocks manuales**: archivos en `tests/__mocks__/` exportan un valor por defecto cuando importamos assets (ej. `fileMock.ts`).
- **Spies**: `jest.spyOn(obj, 'método')` permite inspeccionar llamadas sin reemplazar toda la implementación.

## Dónde declarar mocks
| Uso | Localización |
| --- | --- |
| Router/App Router | `jest.setup.ts` |
| Internacionalización | `jest.setup.ts` con `next-intl` |
| Autenticación (`next-auth`) | `jest.setup.ts` |
| Assets (PNG, SVG, etc.) | `tests/__mocks__/fileMock.ts` |
| Dependencia específica por test | Dentro del propio archivo de test |

## Buenas prácticas
1. **Mockea sólo lo necesario**: evita mocks muy agresivos que oculten errores reales.
2. **Resetea estado**: `jest.clearAllMocks()` en `beforeEach` previene que llamadas previas contaminen nuevas pruebas (ya lo hacemos en `jest.setup.ts`).
3. **Customiza por test**: sobreescribe el mock dentro del test (`jest.mocked(modulo).fn.mockResolvedValue(...)`) para simular distintos escenarios.
4. **Evita snapshots de mocks**: confía en aserciones explícitas (`expect(mock).toHaveBeenCalledWith(...)`).

## Ejemplos
```ts
// Mock global ya existente (jest.setup.ts)
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({ push: jest.fn() }),
  };
});

// Mock local dentro de un test
import * as api from 'modules/users/api';

jest.mock('modules/users/api');

const apiMock = jest.mocked(api);
apiMock.createUser.mockResolvedValue({ id: '123' });
```

Si necesitas mocks persistentes para servicios específicos, crea un archivo en `tests/__mocks__/nombreModulo.ts` y documenta su uso en este mismo directorio.
