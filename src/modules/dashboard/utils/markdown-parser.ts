import { MarkdownImportResult, EpicDraft, StoryDraft, TaskDraft, IssueSubType } from '../types';

const TASK_PREFIX_TO_TYPE: Record<string, IssueSubType> = {
  FE: 'FE',
  BE: 'BE',
  OPS: 'OPS',
  DOCS: 'DOCS',
};

const extractLabels = (text: string) => {
  const matches = text.match(/#([\w-]+)/g);
  return matches ? matches.map((item) => item.slice(1)) : [];
};

export function parseBacklogMarkdown(markdown: string): MarkdownImportResult {
  const epics: EpicDraft[] = [];
  const stories: StoryDraft[] = [];
  const tasks: TaskDraft[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  const epicIds = new Set<string>();
  const storyIds = new Set<string>();
  const taskIds = new Set<string>();

  const lines = markdown.split(/\r?\n/);
  let currentEpic: EpicDraft | undefined;
  let currentStory: StoryDraft | undefined;

  const ensureUnique = (collection: Set<string>, id: string, type: string) => {
    if (collection.has(id)) {
      warnings.push(`${type} ${id} repetido, se ignorará la instancia duplicada`);
      return false;
    }
    collection.add(id);
    return true;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    const epicMatch = /^#\s*(EP-[\w-]+)\s*[:\-]?\s*(.*)$/i.exec(line);
    if (epicMatch) {
      const [, id, title] = epicMatch;
      if (ensureUnique(epicIds, id, 'Epic')) {
        currentEpic = { id, title: title || id };
        epics.push(currentEpic);
      } else {
        currentEpic = epics.find((epic) => epic.id === id);
      }
      currentStory = undefined;
      return;
    }

    const storyMatch = /^##\s*(ST-[\w-]+)\s*[:\-]?\s*(.*)$/i.exec(line);
    if (storyMatch) {
      const [, id, title] = storyMatch;
      if (!currentEpic) {
        warnings.push(`Historia ${id} sin épica anterior, se ignorará`);
        return;
      }
      if (ensureUnique(storyIds, id, 'Story')) {
        currentStory = {
          id,
          epicId: currentEpic.id,
          acceptanceCriteria: [],
        };
        if (title) {
          currentStory.persona = title;
        }
        stories.push(currentStory);
      } else {
        currentStory = stories.find((story) => story.id === id);
      }
      return;
    }

    if (/^objetivo[:\-]/i.test(line)) {
      const objective = line.replace(/^objetivo[:\-]\s*/i, '').trim();
      if (currentEpic) {
        currentEpic.objective = objective;
      } else {
        warnings.push(`Objetivo sin épica asociada: ${objective}`);
      }
      return;
    }

    if (/^persona[:\-]/i.test(line)) {
      const value = line.replace(/^persona[:\-]\s*/i, '').trim();
      if (currentStory) currentStory.persona = value;
      return;
    }

    if (/^(necesidad|need)[:\-]/i.test(line)) {
      const value = line.replace(/^(necesidad|need)[:\-]\s*/i, '').trim();
      if (currentStory) currentStory.need = value;
      return;
    }

    if (/^(resultado|outcome)[:\-]/i.test(line)) {
      const value = line.replace(/^(resultado|outcome)[:\-]\s*/i, '').trim();
      if (currentStory) currentStory.outcome = value;
      return;
    }

    const acMatch = /^-\s*(?:AC|Criterio)[:\-]?\s*(.*)$/i.exec(line);
    if (acMatch) {
      const [, criteria] = acMatch;
      if (currentStory) {
        currentStory.acceptanceCriteria.push(criteria);
      } else {
        warnings.push(`Criterio sin historia activa: ${criteria}`);
      }
      return;
    }

    const taskMatch = /^-\s*((?:FE|BE|OPS|DOCS)-[\w-]+)\s*(?:\(([^)]+)\))?\s*[:\-]?\s*(.*)$/i.exec(line);
    if (taskMatch) {
      const [, id, typeHint, description] = taskMatch;
      if (!ensureUnique(taskIds, id, 'Task')) return;
      const prefix = id.split('-')[0].toUpperCase();
      const type = (typeHint?.toUpperCase() as IssueSubType) || TASK_PREFIX_TO_TYPE[prefix] || 'FE';
      const labels = extractLabels(description);
      const cleanDescription = description.replace(/#([\w-]+)/g, '').trim();
      const task: TaskDraft = {
        id,
        storyId: currentStory?.id,
        type,
        labels,
        dependencies: [],
      };
      const dependencyMatch = cleanDescription.match(/dependencias?:\s*([\w-,\s]+)/i);
      if (dependencyMatch) {
        task.dependencies = dependencyMatch[1]
          .split(/[,\s]+/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
      tasks.push(task);
      return;
    }

    if (currentStory && /^-\s*dep[:=]/i.test(line)) {
      const deps = line
        .replace(/^-\s*dep[:=]\s*/i, '')
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean);
      if (deps.length) {
        warnings.push(`Historia ${currentStory.id} menciona dependencias: ${deps.join(', ')}`);
      }
      return;
    }
  });

  stories.forEach((story) => {
    if (!story.acceptanceCriteria.length) {
      warnings.push(`Historia ${story.id} sin criterios de aceptación`);
    }
  });

  if (!epics.length) {
    errors.push('No se encontraron épicas (formato # EP-*) en el markdown.');
  }

  return {
    epics,
    stories,
    tasks,
    warnings,
    errors,
  };
}
