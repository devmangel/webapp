'use client';

import { useMemo, useState } from 'react';
import { 
  ImportHeader, 
  MarkdownEditor, 
  ResultsPanel, 
  ProcessingOverlay,
  type FullImportResult 
} from 'components/import';

interface ImportState {
  isLoading: boolean;
  result: FullImportResult | null;
}

interface ImportClientProps {
  userId: string;
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

export function ImportClient({ userId }: ImportClientProps) {
  const [markdown, setMarkdown] = useState(exampleMarkdown);
  const [importState, setImportState] = useState<ImportState>({
    isLoading: false,
    result: null,
  });

  const stats = useMemo(() => {
    if (importState.result?.summary) {
      const { sprints, epics, stories, tasks } = importState.result.summary;
      return `${sprints} sprints, ${epics} épicas, ${stories} historias, ${tasks} tareas`;
    }
    return 'Listo para crear proyecto automáticamente';
  }, [importState.result]);

  const canImport = markdown.trim().length > 0 && !importState.isLoading;

  const handleLoadExample = () => {
    setMarkdown(exampleMarkdown);
  };

  const handleProcessingComplete = () => {
    // El overlay se completó, ya no se muestra
    // Los resultados reales ya están en importState.result
  };

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
          uploaderId: userId,
          assigneeId: userId,
        }),
      });

      const result: FullImportResult = await response.json();
      
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
          phases: {
            projectAnalysis: { success: false },
            projectCreation: { success: false },
            sprintCreation: { success: false },
            detailedProcessing: { success: false },
            epicProcessing: { success: false },
            storyProcessing: { success: false },
            taskProcessing: { success: false },
          },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header moderno */}
          <ImportHeader 
            stats={stats}
            isProcessing={importState.isLoading}
            hasResult={!!importState.result}
          />

          {/* Layout principal */}
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Editor de markdown - 7 columnas en desktop */}
            <div className="lg:col-span-7 space-y-6">
              <MarkdownEditor
                value={markdown}
                onChange={setMarkdown}
                onLoadExample={handleLoadExample}
                disabled={importState.isLoading}
              />
              
              {/* Botón de acción principal */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!canImport}
                  className={`group relative overflow-hidden rounded-xl px-8 py-4 text-base font-semibold transition-all duration-300 ${
                    canImport
                      ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg hover:shadow-2xl hover:scale-105 transform'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  {canImport && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  <span className="relative flex items-center gap-3">
                    {importState.isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando con IA...
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🚀</span>
                        Crear Proyecto con IA
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Panel de resultados - 5 columnas en desktop */}
            <div className="lg:col-span-5 space-y-6">
              {/* Panel de resultados */}
              <ResultsPanel
                result={importState.result}
                isLoading={importState.isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay de procesamiento sofisticado */}
      <ProcessingOverlay
        isVisible={importState.isLoading}
        onComplete={handleProcessingComplete}
        backendCompleted={!!importState.result}
      />
    </div>
  );
}
