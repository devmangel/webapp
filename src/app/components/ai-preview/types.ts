import { Issue } from 'types/domain/dashboard';

export type Mode = 'CONSERVADOR' | 'BALANCEADO' | 'CREATIVO';

export interface ToggleOptions {
  estimate: boolean;
  dod: boolean;
  dependencies: boolean;
}

export interface Suggestion {
  issue: Issue;
  newSummary: string;
  newDescription: string;
  acceptanceCriteria: string[];
  definitionOfDone: string[];
  storyPoints?: number;
  dependencies: string[];
}

export interface AiMetrics {
  totalSuggestions: number;
  pendingSuggestions: number;
  acceptedSuggestions: number;
  estimatedTimesSaved: string;
}

export interface DiffHighlight {
  type: 'addition' | 'deletion' | 'modification';
  content: string;
  line?: number;
}
