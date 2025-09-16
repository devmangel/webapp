# Hooks de Husky y lint-staged

Husky permite engancharse a los hooks de Git (pre-commit, pre-push, etc.) para automatizar tareas antes de que el código salga de tu máquina.

## Estructura en este proyecto
- Carpeta `.husky/` – contiene los scripts de cada hook.
- Archivo `pre-commit` – ejecuta `npx lint-staged`.
- Dependencia `lint-staged` – configura qué comandos se corren sobre los archivos stageados (`package.json > "lint-staged"`).

## Flujo de pre-commit
1. Ejecutas `git commit`.
2. Husky invoca `.husky/pre-commit`.
3. `lint-staged` recoge los archivos stageados y corre:
   - `npm run lint -- --max-warnings=0`
   - `npm run test -- --bail --findRelatedTests --watch=false`
4. Si cualquiera falla, el commit se detiene hasta que corrijas los errores.

## Primeros pasos para nuevos devs
- Ejecuta `npm install` para que Husky instale los hooks (corre `npm run prepare` automáticamente).
- Verifica con `ls .husky` que exista el archivo `pre-commit`.
- Si usas Windows / WSL, asegúrate de que los scripts tengan permisos de ejecución (`chmod +x .husky/pre-commit`).

## Consejo de uso
Si necesitas hacer un commit rápido que no pasa los hooks (ej. WIP), evita `--no-verify` salvo casos excepcionales. Es preferible arreglar los errores o commitear en un branch temporal.
