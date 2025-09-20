'use client';

import { memo, useState, useMemo } from 'react';
import type { FullImportResult } from 'types/domain/import';

interface DetailedResultsListProps {
  result: FullImportResult;
}

type FilterType = 'all' | 'sprints' | 'epics' | 'stories' | 'tasks';

const DetailedResultsList = memo(function DetailedResultsList({
  result
}: DetailedResultsListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reconstruct items from completions and summary
  const allItems = useMemo(() => {
    const items: Array<{
      type: FilterType;
      title: string;
      description: string;
      id: string;
      metadata?: string;
    }> = [];

    // Add project info
    if (result.summary) {
      items.push({
        type: 'all',
        title: result.summary.project,
        description: `Proyecto con ${result.summary.sprints} sprints, ${result.summary.epics} épicas, ${result.summary.stories} historias y ${result.summary.tasks} tareas`,
        id: 'project-info',
        metadata: `ID: ${result.projectId || 'N/A'}`
      });

      // Add summary items by type
      if (result.summary.sprints > 0) {
        items.push({
          type: 'sprints',
          title: `${result.summary.sprints} Sprints generados`,
          description: 'Sprints creados automáticamente con planificación temporal',
          id: 'sprints-summary'
        });
      }

      if (result.summary.epics > 0) {
        items.push({
          type: 'epics',
          title: `${result.summary.epics} Épicas creadas`,
          description: 'Épicas organizadas por objetivos de negocio',
          id: 'epics-summary'
        });
      }

      if (result.summary.stories > 0) {
        items.push({
          type: 'stories',
          title: `${result.summary.stories} Historias de usuario`,
          description: 'Historias con criterios de aceptación y puntos de historia',
          id: 'stories-summary'
        });
      }

      if (result.summary.tasks > 0) {
        items.push({
          type: 'tasks',
          title: `${result.summary.tasks} Tareas técnicas`,
          description: 'Tareas de desarrollo organizadas por tipo (FE, BE, OPS, etc.)',
          id: 'tasks-summary'
        });
      }
    }

    // Add detailed completions
    if (result.feedback?.completions) {
      result.feedback.completions.forEach((completion, index) => {
        let itemType: FilterType = 'all';
        
        // Determine type based on completion type
        if (completion.type === 'STORY_POINTS') itemType = 'stories';
        else if (completion.type === 'DESCRIPTION') {
          if (completion.target.toLowerCase().includes('epic')) itemType = 'epics';
          else if (completion.target.toLowerCase().includes('story')) itemType = 'stories';
          else if (completion.target.toLowerCase().includes('task')) itemType = 'tasks';
        }

        const displayValue = typeof completion.generated === 'number' 
          ? `${completion.generated} puntos` 
          : completion.generated;

        items.push({
          type: itemType,
          title: completion.target,
          description: `Generado automáticamente por IA: ${displayValue}`,
          id: `completion-${index}`,
          metadata: completion.type
        });
      });
    }

    return items;
  }, [result]);

  const filteredItems = useMemo(() => {
    let filtered = allItems;

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.type === filter || item.type === 'all');
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allItems, filter, searchQuery]);

  const filterOptions = [
    { value: 'all' as const, label: 'Todo', count: allItems.length },
    { value: 'sprints' as const, label: 'Sprints', count: allItems.filter(i => i.type === 'sprints').length },
    { value: 'epics' as const, label: 'Épicas', count: allItems.filter(i => i.type === 'epics').length },
    { value: 'stories' as const, label: 'Historias', count: allItems.filter(i => i.type === 'stories').length },
    { value: 'tasks' as const, label: 'Tareas', count: allItems.filter(i => i.type === 'tasks').length },
  ];

  const getItemIcon = (type: FilterType) => {
    switch (type) {
      case 'sprints':
        return (
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'epics':
        return (
          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'stories':
        return (
          <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'tasks':
        return (
          <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar elementos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                filter === option.value
                  ? 'bg-blue-200 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              No se encontraron elementos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Intenta cambiar los filtros o términos de búsqueda
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                {getItemIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
                  {item.title}
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 break-words">
                  {item.description}
                </p>
                {item.metadata && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {item.metadata}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default DetailedResultsList;
