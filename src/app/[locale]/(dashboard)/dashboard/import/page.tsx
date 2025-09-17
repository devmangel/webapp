'use client';

import { useMemo, useState } from 'react';
import { Card, CardBody } from 'components/ui/Card';
import { parseBacklogMarkdown } from 'app/components/utils/markdown-parser';
import { MarkdownImportResult } from 'types/domain/dashboard';

interface ImportState {
  isLoading: boolean;
  success: boolean | null;
  error: string | null;
  summary?: {
    epics: number;
    stories: number;
    tasks: number;
  };
}

const exampleMarkdown = `# EP-1 Panel de Visibilidad
Objetivo: Mostrar KPIs críticos para stakeholders

## ST-101 Como stakeholder quiero ver porcentajes de avance
- AC: Mostrar tarjetas KPI con % completado
- AC: Incluir lista de bloqueos
- FE-201 (FE) Layout responsive del dashboard #frontend
- BE-301 (BE) Views agregadas en Postgres #backend

## ST-102 Como PM quiero filtrar por sprint
- AC: Filtrar por sprint y responsable
- AC: Guardar filtros en URL
- FE-202 Virtualizar backlog largo

# EP-2 Importador Markdown
Objetivo: Evitar carga manual de backlog

## ST-201 Como PM quiero pegar backlog
- AC: Validar IDs únicos
- AC: Mostrar preview JSON
- OPS-101 Script de limpieza
`;

function ResultSummary({ result }: { result: MarkdownImportResult | null }) {
  if (!result) {
    return (
      <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
        Pega tu Markdown y presiona Analizar para ver la estructura detectada.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border-light/60 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
              Épicas
            </p>
            <p className="mt-2 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {result.epics.length}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-border-light/60 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
              Historias
            </p>
            <p className="mt-2 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {result.stories.length}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-border-light/60 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
              Tareas
            </p>
            <p className="mt-2 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {result.tasks.length}
            </p>
          </CardBody>
        </Card>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
          Detalle
        </h3>
        <div className="mt-2 rounded-lg border border-border-light bg-neutral-50 p-3 text-xs text-textSecondary-light dark:border-border-dark dark:bg-neutral-900/60 dark:text-textSecondary-dark">
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      </div>
      <div className="space-y-2">
        {result.errors.length > 0 ? (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            <h4 className="font-semibold">Errores</h4>
            <ul className="list-disc pl-5">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {result.warnings.length > 0 ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-200">
            <h4 className="font-semibold">Warnings</h4>
            <ul className="list-disc pl-5">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ImportPage() {
  const [markdown, setMarkdown] = useState(exampleMarkdown);
  const [result, setResult] = useState<MarkdownImportResult | null>(null);
  const [importState, setImportState] = useState<ImportState>({
    isLoading: false,
    success: null,
    error: null,
  });

  const stats = useMemo(() => (result ? `${result.epics.length} épicas, ${result.stories.length} historias, ${result.tasks.length} tareas` : 'Sin análisis'), [result]);

  const canImport = result && result.errors.length === 0 && result.epics.length > 0;

  const handleImport = async () => {
    if (!canImport) return;

    setImportState({ isLoading: true, success: null, error: null });

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la importación');
      }

      setImportState({
        isLoading: false,
        success: true,
        error: null,
        summary: data.summary,
      });
    } catch (error) {
      setImportState({
        isLoading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
            Importar backlog en Markdown
          </h1>
          <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
            Pega el contenido para validar estructura, IDs y obtener un preview JSON antes de pasarlo a IA
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
              Markdown source
            </label>
            <textarea
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              rows={24}
              className="mt-2 w-full rounded-md border border-border-light bg-white px-4 py-3 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-950 dark:text-textPrimary-dark"
              placeholder="Pega aquí el backlog en formato markdown"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setResult(parseBacklogMarkdown(markdown))}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary"
              >
                Analizar
              </button>
              <button
                type="button"
                onClick={() => setMarkdown(exampleMarkdown)}
                className="rounded-md border border-border-light px-4 py-2 text-sm font-semibold text-textSecondary-light transition-colors hover:border-primary hover:text-primary dark:border-border-dark dark:text-textSecondary-dark"
              >
                Cargar ejemplo
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!canImport || importState.isLoading}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  canImport && !importState.isLoading
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600'
                }`}
              >
                {importState.isLoading ? 'Procesando...' : 'Cargar archivo'}
              </button>
            </div>

            {/* Estado de importación */}
            {importState.success === true && (
              <div className="mt-3 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-200">
                <h4 className="font-semibold">✅ Importación exitosa</h4>
                <p>
                  Se crearon {importState.summary?.epics} épicas, {importState.summary?.stories} historias y {importState.summary?.tasks} tareas.
                  Las tareas fueron asignadas al desarrollador especificado.
                </p>
              </div>
            )}

            {importState.error && (
              <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                <h4 className="font-semibold">❌ Error en la importación</h4>
                <p>{importState.error}</p>
              </div>
            )}

            {!canImport && result && (
              <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-200">
                <h4 className="font-semibold">⚠️ No se puede importar</h4>
                <p>
                  {result.errors.length > 0 
                    ? 'Corrija los errores antes de importar.'
                    : 'Analice el markdown para habilitar la importación.'
                  }
                </p>
              </div>
            )}
          </CardBody>
        </Card>
        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <h2 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              Preview normalizado
            </h2>
            <ResultSummary result={result} />
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
