'use client';

import { useMemo, useState } from 'react';
import { Card, CardBody } from 'components/ui/Card';
import type { FeedbackItem, Completion, ImportResult } from 'types/domain/dashboard/import';

interface ImportState {
  isLoading: boolean;
  result: ImportResult | null;
}

const exampleMarkdown = `# ÉPICA EP-01 — Registro & Autenticación

**Objetivo:** permitir crear cuenta, autenticarse y recuperar acceso.

## Historias

* **ST-01.1** Como publicador quiero crear una cuenta con email para gestionar mis listados.
* **ST-01.2** Como usuario quiero iniciar sesión con email/contraseña o magic link.
* **ST-01.3** Como usuario olvidé mi contraseña y quiero restablecerla.

### Criterios de aceptación (comunes)

* Validaciones de formulario y mensajes de error claros.
* Email de verificación/restablecimiento se envía y procesa correctamente.
* Rate limiting en intentos de login.

## Tareas Frontend

* **FE-01** Pantallas: /signup, /login, /forgot-password, /verify (UI + estados de carga/éxito/error).
* **FE-02** Formularios con validación (client + server) y accesibilidad (labels, focus).
* **FE-03** Integrar llamadas a API de auth (registro, login, magic link, reset).

## Tareas Backend

* **BE-01** Endpoints Auth: POST /auth/signup, /auth/login, /auth/magic, /auth/reset, /auth/verify.
* **BE-02** Modelo User y almacenamiento seguro de contraseñas.
* **BE-03** Emisor de emails transaccionales (plantillas verificación/reset).
`;

function FeedbackSection({ 
  title, 
  items, 
  type 
}: { 
  title: string; 
  items: FeedbackItem[]; 
  type: 'error' | 'warning' | 'completion' 
}) {
  if (items.length === 0) return null;

  const colorClasses = {
    error: 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200',
    warning: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-200',
    completion: 'border-green-300 bg-green-50 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-200'
  };

  const icons = {
    error: '❌',
    warning: '⚠️',
    completion: '✨'
  };

  return (
    <div className={`rounded-md border p-3 text-sm ${colorClasses[type]}`}>
      <h4 className="font-semibold flex items-center gap-2">
        <span>{icons[type]}</span>
        {title}
      </h4>
      <ul className="mt-2 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-xs">
            <div className="flex flex-col gap-1">
              <span>{item.message}</span>
              {item.location && (
                <span className="opacity-75">📍 {item.location}</span>
              )}
              {item.suggestion && (
                <span className="opacity-75">💡 {item.suggestion}</span>
              )}
              {item.autoValue && (
                <span className="opacity-75">🤖 Auto-completado: {item.autoValue}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompletionSection({ completions }: { completions: Completion[] }) {
  if (completions.length === 0) return null;

  return (
    <div className="rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200">
      <h4 className="font-semibold flex items-center gap-2">
        <span>🔧</span>
        Mejoras aplicadas por IA
      </h4>
      <ul className="mt-2 space-y-1">
        {completions.map((completion, index) => {
          const displayValue = typeof completion.generated === 'number' 
            ? `${completion.generated} puntos` 
            : completion.generated;
          
          return (
            <li key={index} className="text-xs">
              <div className="flex flex-col gap-1">
                <span className="font-medium">{completion.target}</span>
                <span className="opacity-75">{completion.type}: {displayValue}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ImportResultDisplay({ result }: { result: ImportResult | null }) {
  if (!result) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
          Pega tu markdown y presiona el botón para procesar con IA
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      {result.summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-border-light/60 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
            <CardBody>
              <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
                Épicas
              </p>
              <p className="mt-2 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
                {result.summary.epics}
              </p>
            </CardBody>
          </Card>
          <Card className="border border-border-light/60 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
            <CardBody>
              <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
                Historias
              </p>
              <p className="mt-2 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
                {result.summary.stories}
              </p>
            </CardBody>
          </Card>
          <Card className="border border-border-light/60 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
            <CardBody>
              <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
                Tareas
              </p>
              <p className="mt-2 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
                {result.summary.tasks}
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Feedback */}
      {result.feedback && (
        <div className="space-y-3">
          <FeedbackSection
            title="Errores críticos"
            items={result.feedback.errors || []}
            type="error"
          />
          <FeedbackSection
            title="Advertencias"
            items={result.feedback.warnings || []}
            type="warning"
          />
          <CompletionSection completions={result.feedback.completions || []} />
        </div>
      )}

      {/* Estado general */}
      {result.success ? (
        <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-200">
          <h4 className="font-semibold">✅ Importación exitosa</h4>
          <p>
            Se crearon {result.summary?.epics} épicas, {result.summary?.stories} historias y {result.summary?.tasks} tareas.
            Todas las tareas fueron asignadas automáticamente al desarrollador especificado.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          <h4 className="font-semibold">❌ Error en la importación</h4>
          <p>
            Revisa los errores arriba y corrige el markdown antes de intentar de nuevo.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ImportPage() {
  const [markdown, setMarkdown] = useState(exampleMarkdown);
  const [importState, setImportState] = useState<ImportState>({
    isLoading: false,
    result: null,
  });

  const stats = useMemo(() => {
    if (importState.result?.summary) {
      const { epics, stories, tasks } = importState.result.summary;
      return `${epics} épicas, ${stories} historias, ${tasks} tareas`;
    }
    return 'Listo para procesar';
  }, [importState.result]);

  const canImport = markdown.trim().length > 0 && !importState.isLoading;

  const handleImport = async () => {
    if (!canImport) return;

    setImportState({ isLoading: true, result: null });

    try {
      const response = await fetch('/api/dashboard/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown,
          projectId: 'e29422ac-a625-49b7-af2e-3977a45dffe1',
          assigneeId: '06aec8c6-b939-491b-b711-f04d7670e045',
        }),
      });

      const result: ImportResult = await response.json();
      
      setImportState({
        isLoading: false,
        result,
      });
    } catch (error) {
      console.error('Error en importación:', error);
      setImportState({
        isLoading: false,
        result: {
          success: false,
          feedback: {
            errors: [{
              type: 'CRITICAL',
              message: 'Error de conexión. Verifique su conexión a internet e intente de nuevo.',
              suggestion: error instanceof Error ? error.message : 'Error desconocido'
            }],
            warnings: [],
            completions: []
          }
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
            Importar backlog con IA
          </h1>
          <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
            Pega tu especificación en markdown y la IA la procesará automáticamente para crear épicas, historias y tareas
          </p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {stats}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <label className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
              Especificación en Markdown
            </label>
            <textarea
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              rows={24}
              className="mt-2 w-full rounded-md border border-border-light bg-white px-4 py-3 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-950 dark:text-textPrimary-dark"
              placeholder="Pega aquí tu especificación en formato markdown"
            />
            
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!canImport}
                  className={`rounded-md px-6 py-2.5 text-sm font-semibold transition-all ${
                    canImport
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600'
                  }`}
                >
                  {importState.isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando con IA...
                    </span>
                  ) : (
                    '🤖 Procesar e Importar con IA'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setMarkdown(exampleMarkdown)}
                  className="rounded-md border border-border-light px-4 py-2 text-sm font-semibold text-textSecondary-light transition-colors hover:border-primary hover:text-primary dark:border-border-dark dark:text-textSecondary-dark"
                >
                  Cargar ejemplo
                </button>
              </div>
              
              <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                💡 La IA acepta múltiples formatos de markdown y completará automáticamente información faltante
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <h2 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              Resultado del procesamiento
            </h2>
            <div className="mt-4">
              <ImportResultDisplay result={importState.result} />
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
