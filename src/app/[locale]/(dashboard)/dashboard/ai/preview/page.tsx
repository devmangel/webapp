'use client';

import { useMemo, useState, useCallback } from 'react';
import { useDashboardStore } from 'app/lib/store/dashboard-store';
import { Issue } from 'types/domain';
import { 
  AiPreviewHeader,
  AiConfigurationPanel,
  AiSuggestionCard,
  AiEmptyState,
  AiLoadingState,
  AiMetricsCard,
  Mode,
  ToggleOptions,
  Suggestion
} from 'app/components/ai-preview';
import type { AiMetrics } from 'app/components/ai-preview/types';

const modeDescriptions: Record<Mode, string> = {
  CONSERVADOR: 'Cambios mínimos, prioriza consistencia con el backlog actual.',
  BALANCEADO: 'Mejoras moderadas con sugerencias de historias y criterios.',
  CREATIVO: 'Explora variantes con más contexto y propuestas de dependencias.',
};

console.log('Mode Descriptions:', modeDescriptions); // Debugging line

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
  const [toggles, setToggles] = useState<ToggleOptions>({ 
    estimate: true, 
    dod: true, 
    dependencies: false 
  });
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);
  const [acceptingItems, setAcceptingItems] = useState<Set<string>>(new Set());
  const [isLoading] = useState(false); // In real app, this would be managed by state

  // Store selectors
  const issues = useDashboardStore((state) => state.issues);
  const projects = useDashboardStore((state) => state.projects);
  const filters = useDashboardStore((state) => state.filters);
  const updateIssue = useDashboardStore((state) => state.updateIssue);

  const project = projects[filters.projectId];

  // Get stories from current project
  const stories = useMemo(() => {
    if (!project) return [] as Issue[];
    return project.issueIds
      .map((id) => issues[id])
      .filter((issue): issue is Issue => Boolean(issue) && issue.type === 'STORY');
  }, [project, issues]);

  // Generate AI suggestions
  const suggestions = useMemo(
    () => stories.map((issue) => buildSuggestion(issue, mode, toggles)), 
    [stories, mode, toggles]
  );

  // Calculate metrics
  const metrics: AiMetrics = useMemo(() => {
    const totalSuggestions = suggestions.length;
    const pendingSuggestions = suggestions.filter(s => {
      const hasChanges = s.newSummary !== s.issue.summary || 
                        s.newDescription !== s.issue.description ||
                        s.storyPoints !== s.issue.storyPoints;
      return hasChanges;
    }).length;
    
    // In a real app, this would come from historical data
    const acceptedSuggestions = Math.floor(totalSuggestions * 0.7); // Mock data
    const hoursPerSuggestion = 0.5; // Mock: 30 minutes saved per suggestion
    const totalHoursSaved = acceptedSuggestions * hoursPerSuggestion;
    
    return {
      totalSuggestions,
      pendingSuggestions,
      acceptedSuggestions,
      estimatedTimesSaved: `${totalHoursSaved.toFixed(1)}h`,
    };
  }, [suggestions]);

  // Event handlers
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
  }, []);

  const handleToggleOption = useCallback((key: keyof ToggleOptions) => {
    setToggles((prev: ToggleOptions) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleAcceptSuggestion = useCallback(async (suggestion: Suggestion) => {
    setAcceptingItems((prev: Set<string>) => new Set([...prev, suggestion.issue.id]));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateIssue(suggestion.issue.id, {
      summary: suggestion.newSummary,
      description: suggestion.newDescription,
      acceptanceCriteria: suggestion.acceptanceCriteria,
      definitionOfDone: suggestion.definitionOfDone,
      storyPoints: suggestion.storyPoints,
      dependencies: suggestion.dependencies,
    });
    
    setAcceptingItems((prev: Set<string>) => {
      const newSet = new Set(prev);
      newSet.delete(suggestion.issue.id);
      return newSet;
    });
  }, [updateIssue]);

  const handleApplyAll = useCallback(async () => {
    const suggestionsWithChanges = suggestions.filter(s => {
      const hasChanges = s.newSummary !== s.issue.summary || 
                        s.newDescription !== s.issue.description ||
                        s.storyPoints !== s.issue.storyPoints;
      return hasChanges;
    });

    for (const suggestion of suggestionsWithChanges) {
      await handleAcceptSuggestion(suggestion);
    }
  }, [suggestions, handleAcceptSuggestion]);

  const handleToggleCollapse = useCallback(() => {
    setIsConfigCollapsed((prev: boolean) => !prev);
  }, []);

  // Render states
  if (isLoading) {
    return (
      <div className="space-y-6">
        <AiPreviewHeader metrics={metrics} isLoading />
        <AiLoadingState message="Analizando historias con inteligencia artificial..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <AiPreviewHeader metrics={metrics} />
        <AiEmptyState 
          type="no-project" 
          actionLabel="Ir al Dashboard"
          onAction={() => window.location.href = '/dashboard'}
        />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="space-y-6">
        <AiPreviewHeader metrics={metrics} />
        <AiEmptyState 
          type="no-stories"
          actionLabel="Ver Backlog"
          onAction={() => window.location.href = '/dashboard/backlog'}
        />
      </div>
    );
  }

  const suggestionsWithChanges = suggestions.filter(s => {
    const hasChanges = s.newSummary !== s.issue.summary || 
                      s.newDescription !== s.issue.description ||
                      s.storyPoints !== s.issue.storyPoints;
    return hasChanges;
  });

  if (suggestionsWithChanges.length === 0) {
    return (
      <div className="space-y-6">
        <AiPreviewHeader metrics={metrics} />
        
        <AiConfigurationPanel
          mode={mode}
          options={toggles}
          onModeChange={handleModeChange}
          onToggleOption={handleToggleOption}
          onApplyAll={handleApplyAll}
          isCollapsed={isConfigCollapsed}
          onToggleCollapse={handleToggleCollapse}
          suggestionCount={0}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AiEmptyState type="no-suggestions" />
          </div>
          <div className="space-y-6">
            <AiMetricsCard metrics={metrics} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with metrics */}
      <AiPreviewHeader metrics={metrics} />

      {/* Configuration Panel */}
      <AiConfigurationPanel
        mode={mode}
        options={toggles}
        onModeChange={handleModeChange}
        onToggleOption={handleToggleOption}
        onApplyAll={handleApplyAll}
        isCollapsed={isConfigCollapsed}
        onToggleCollapse={handleToggleCollapse}
        suggestionCount={suggestionsWithChanges.length}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Suggestions List */}
        <div className="lg:col-span-2 space-y-4">
          {suggestionsWithChanges.map((suggestion, index) => (
            <AiSuggestionCard
              key={suggestion.issue.id}
              suggestion={suggestion}
              onAccept={handleAcceptSuggestion}
              isAccepting={acceptingItems.has(suggestion.issue.id)}
              index={index}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AiMetricsCard metrics={metrics} />
        </div>
      </div>
    </div>
  );
}
