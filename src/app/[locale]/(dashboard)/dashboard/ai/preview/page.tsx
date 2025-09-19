'use client';

import { useMemo, useState } from 'react';
import { Card, CardBody } from 'components/ui/Card';
import { useDashboardStore } from 'app/lib/store/dashboard-store';
import { Issue } from 'types/domain/dashboard';

type Mode = 'CONSERVADOR' | 'BALANCEADO' | 'CREATIVO';

interface ToggleOptions {
  estimate: boolean;
  dod: boolean;
  dependencies: boolean;
}

interface Suggestion {
  issue: Issue;
  newSummary: string;
  newDescription: string;
  acceptanceCriteria: string[];
  definitionOfDone: string[];
  storyPoints?: number;
  dependencies: string[];
}

const modeDescriptions: Record<Mode, string> = {
  CONSERVADOR: 'Cambios mínimos, prioriza consistencia con el backlog actual.',
  BALANCEADO: 'Mejoras moderadas con sugerencias de historias y criterios.',
  CREATIVO: 'Explora variantes con más contexto y propuestas de dependencias.',
};

function buildSuggestion(issue: Issue, mode: Mode, toggles: ToggleOptions): Suggestion {
  const baseSummary = issue.summary;
  const summaryAdditions: Record<Mode, string> = {
    CONSERVADOR: ' (validado por IA con consistencia).',
    BALANCEADO: ' (enriquecido con contexto de usuarios y métricas).',
    CREATIVO: ' (IA propone experimentos y métricas aspiracionales).',
  };
  const newSummary = `${baseSummary}${summaryAdditions[mode]}`;
  const descriptionAdditions: Record<Mode, string> = {
    CONSERVADOR: ' Mantener alcance actual garantizando claridad de aceptación.',
    BALANCEADO: ' Incluir métricas de éxito y actores clave en la narrativa.',
    CREATIVO: ' Añadir hipótesis opcionales y escenarios edge para debate.',
  };
  const newDescription = `${issue.description}\n\nIA (${mode.toLowerCase()}):${descriptionAdditions[mode]}`;
  const acceptanceCriteria = toggles.estimate
    ? [...issue.acceptanceCriteria, 'Given IA When revisa backlog Then propone story points consistentes.']
    : issue.acceptanceCriteria;
  const definitionOfDone = toggles.dod
    ? [...issue.definitionOfDone, 'Documentar ajustes aprobados por stakeholders.']
    : issue.definitionOfDone;
  const storyPoints = toggles.estimate ? Math.min(13, Math.max(3, (issue.storyPoints ?? 5) + 2)) : issue.storyPoints;
  const dependencies = toggles.dependencies
    ? Array.from(new Set([...issue.dependencies, 'FE-999', 'BE-888'].filter(Boolean)))
    : issue.dependencies;
  return {
    issue,
    newSummary,
    newDescription,
    acceptanceCriteria,
    definitionOfDone,
    storyPoints,
    dependencies,
  };
}

export default function AiPreviewPage() {
  const [mode, setMode] = useState<Mode>('BALANCEADO');
  const [toggles, setToggles] = useState<ToggleOptions>({ estimate: true, dod: true, dependencies: false });
  const issues = useDashboardStore((state) => state.issues);
  const projects = useDashboardStore((state) => state.projects);
  const filters = useDashboardStore((state) => state.filters);
  const updateIssue = useDashboardStore((state) => state.updateIssue);

  const project = projects[filters.projectId];

  const stories = useMemo(() => {
    if (!project) return [] as Issue[];
    return project.issueIds
      .map((id) => issues[id])
      .filter((issue): issue is Issue => Boolean(issue) && issue.type === 'STORY');
  }, [project, issues]);

  const suggestions = useMemo(() => stories.map((issue) => buildSuggestion(issue, mode, toggles)), [stories, mode, toggles]);

  const applySuggestion = (suggestion: Suggestion) => {
    updateIssue(suggestion.issue.id, {
      summary: suggestion.newSummary,
      description: suggestion.newDescription,
      acceptanceCriteria: suggestion.acceptanceCriteria,
      definitionOfDone: suggestion.definitionOfDone,
      storyPoints: suggestion.storyPoints,
      dependencies: suggestion.dependencies,
    });
  };

  const applyAll = () => {
    suggestions.forEach(applySuggestion);
  };

  const toggleOption = (key: keyof ToggleOptions) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
            Preview de IA
          </h1>
          <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
            Revisa los cambios sugeridos por IA antes de aceptarlos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {(['CONSERVADOR', 'BALANCEADO', 'CREATIVO'] as Mode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-4 py-2 font-semibold transition-colors ${
                mode === item ? 'bg-primary text-white shadow-sm' : 'bg-neutral-200 text-textSecondary-light hover:bg-neutral-300 dark:bg-neutral-800 dark:text-textSecondary-dark'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
        <CardBody>
          <h2 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark">
            Configuración
          </h2>
          <p className="mt-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
            {modeDescriptions[mode]}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={() => toggleOption('estimate')}
              className={`rounded-md px-3 py-2 font-semibold transition-colors ${
                toggles.estimate ? 'bg-primary text-white' : 'border border-border-light text-textSecondary-light hover:border-primary hover:text-primary dark:border-border-dark dark:text-textSecondary-dark'
              }`}
            >
              Estimar Story Points
            </button>
            <button
              type="button"
              onClick={() => toggleOption('dod')}
              className={`rounded-md px-3 py-2 font-semibold transition-colors ${
                toggles.dod ? 'bg-primary text-white' : 'border border-border-light text-textSecondary-light hover:border-primary hover:text-primary dark:border-border-dark dark:text-textSecondary-dark'
              }`}
            >
              Generar Definition of Done
            </button>
            <button
              type="button"
              onClick={() => toggleOption('dependencies')}
              className={`rounded-md px-3 py-2 font-semibold transition-colors ${
                toggles.dependencies ? 'bg-primary text-white' : 'border border-border-light text-textSecondary-light hover:border-primary hover:text-primary dark:border-border-dark dark:text-textSecondary-dark'
              }`}
            >
              Sugerir dependencias
            </button>
            <button
              type="button"
              onClick={applyAll}
              className="ml-auto rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-secondary"
            >
              Aceptar todo
            </button>
          </div>
        </CardBody>
      </Card>

      <section className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.issue.id} className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
            <CardBody>
              <header className="flex flex-col gap-2 border-b border-border-light pb-3 dark:border-border-dark md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
                    {suggestion.issue.key}
                  </p>
                  <h3 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                    {suggestion.issue.title}
                  </h3>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => applySuggestion(suggestion)}
                    className="rounded-md bg-primary px-3 py-2 font-semibold text-white hover:bg-secondary"
                  >
                    Aceptar
                  </button>
                </div>
              </header>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                    Actual
                  </h4>
                  <div className="mt-2 space-y-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
                    <div>
                      <p className="font-semibold">Resumen</p>
                      <p className="text-xs">{suggestion.issue.summary}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Descripción</p>
                      <p className="whitespace-pre-wrap text-xs">{suggestion.issue.description}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Criterios</p>
                      <ul className="list-disc pl-4 text-xs">
                        {suggestion.issue.acceptanceCriteria.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                    Propuesta IA
                  </h4>
                  <div className="mt-2 space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <div>
                      <p className="font-semibold">Resumen</p>
                      <p className="text-xs">{suggestion.newSummary}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Descripción</p>
                      <p className="whitespace-pre-wrap text-xs">{suggestion.newDescription}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Criterios</p>
                      <ul className="list-disc pl-4 text-xs">
                        {suggestion.acceptanceCriteria.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Definition of Done</p>
                      <ul className="list-disc pl-4 text-xs">
                        {suggestion.definitionOfDone.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="rounded-full bg-neutral-200 px-3 py-1 text-textSecondary-light dark:bg-neutral-800 dark:text-textSecondary-dark">
                        SP sugeridos: {suggestion.storyPoints ?? 'sin cambios'}
                      </span>
                      <span className="rounded-full bg-neutral-200 px-3 py-1 text-textSecondary-light dark:bg-neutral-800 dark:text-textSecondary-dark">
                        Dependencias: {suggestion.dependencies.join(', ') || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        {suggestions.length === 0 ? (
          <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
            <CardBody>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                No encontramos historias para procesar en el proyecto seleccionado.
              </p>
            </CardBody>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
