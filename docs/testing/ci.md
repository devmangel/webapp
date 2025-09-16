# Pipeline de CI en GitHub Actions

La integración continua valida automáticamente cada push y pull request contra las ramas `main` y `develop`.

## Workflow principal
Archivo: `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

## Jobs
divide el flujo en dos etapas:

### 1. `lint`
- **Runner**: `ubuntu-latest`.
- **Pasos**:
  1. `actions/checkout@v4` – descarga el repositorio.
  2. `actions/setup-node@v4` – instala Node 23.9.0 y configura cache para npm.
  3. `npm ci` – instala dependencias desde `package-lock.json`.
  4. `npm run lint -- --max-warnings=0` – asegura estilo y reglas del proyecto.

### 2. `test`
- Depende del job `lint` (`needs: lint`).
- Repite checkout + setup + `npm ci` (cada job corre en un contenedor limpio).
- Ejecuta `npm run test -- --ci --runInBand` para correr Jest en modo CI.

Si cualquiera de los jobs falla, GitHub marca el PR/push en rojo y se bloquea el merge hasta que se resuelva.

## Recomendaciones para el equipo
- Mantén tu versión local de Node alineada (≥ 23.9.0) para evitar diferencias entre local y CI.
- Antes de abrir PR, corre `npm run lint` y `npm run test -- --ci --runInBand` para detectar problemas temprano.
- Si necesitas añadir pasos (por ejemplo coverage en Codecov), crea un nuevo job o step y documenta el cambio en este directorio.
