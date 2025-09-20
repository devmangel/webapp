'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Suggestion } from './types';
import { AiComparisonView } from './AiComparisonView';

interface AiSuggestionCardProps {
  suggestion: Suggestion;
  onAccept: (suggestion: Suggestion) => void;
  onReject?: (suggestionId: string) => void;
  isAccepting?: boolean;
  index: number;
}

export function AiSuggestionCard({ 
  suggestion, 
  onAccept, 
  onReject, 
  isAccepting = false,
  index 
}: AiSuggestionCardProps) {
  const [showComparison, setShowComparison] = useState(false);

  const comparisonItems = [
    {
      label: 'Resumen',
      current: suggestion.issue.summary,
      suggested: suggestion.newSummary,
      type: 'text' as const,
    },
    {
      label: 'Descripción',
      current: suggestion.issue.description,
      suggested: suggestion.newDescription,
      type: 'text' as const,
    },
    {
      label: 'Criterios de Aceptación',
      current: suggestion.issue.acceptanceCriteria,
      suggested: suggestion.acceptanceCriteria,
      type: 'list' as const,
    },
    {
      label: 'Definition of Done',
      current: suggestion.issue.definitionOfDone,
      suggested: suggestion.definitionOfDone,
      type: 'list' as const,
    },
    {
      label: 'Story Points',
      current: suggestion.issue.storyPoints?.toString() || '',
      suggested: suggestion.storyPoints?.toString() || '',
      type: 'number' as const,
    },
    {
      label: 'Dependencias',
      current: suggestion.issue.dependencies,
      suggested: suggestion.dependencies,
      type: 'list' as const,
    },
  ];

  const hasChanges = comparisonItems.some(item => {
    const currentStr = Array.isArray(item.current) ? item.current.join('') : item.current;
    const suggestedStr = Array.isArray(item.suggested) ? item.suggested.join('') : item.suggested;
    return currentStr !== suggestedStr;
  });

  const changeCount = comparisonItems.filter(item => {
    const currentStr = Array.isArray(item.current) ? item.current.join('') : item.current;
    const suggestedStr = Array.isArray(item.suggested) ? item.suggested.join('') : item.suggested;
    return currentStr !== suggestedStr;
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-50/20 to-amber-100/30 dark:from-transparent dark:via-amber-900/10 dark:to-amber-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {suggestion.issue.key}
                </span>
              </div>
              {hasChanges && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {changeCount} cambio{changeCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {suggestion.issue.title}
            </h3>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <motion.button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.button>

            {onReject && (
              <motion.button
                type="button"
                onClick={() => onReject(suggestion.issue.id)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}

            <motion.button
              type="button"
              onClick={() => onAccept(suggestion)}
              disabled={isAccepting || !hasChanges}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                !hasChanges
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : isAccepting
                  ? 'bg-amber-400 text-white cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-sm'
              }`}
              whileHover={!isAccepting && hasChanges ? { scale: 1.02 } : {}}
              whileTap={!isAccepting && hasChanges ? { scale: 0.98 } : {}}
            >
              {isAccepting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Aplicando...
                </div>
              ) : !hasChanges ? (
                'Sin cambios'
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Aceptar
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Preview */}
      <div className="relative p-4">
        <div className="space-y-3">
          {/* Summary preview if changed */}
          {suggestion.issue.summary !== suggestion.newSummary && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Resumen mejorado
                </span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700/50">
                {suggestion.newSummary}
              </p>
            </div>
          )}

          {/* Key improvements */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestion.storyPoints && suggestion.issue.storyPoints !== suggestion.storyPoints && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  SP: {suggestion.issue.storyPoints || '?'} → {suggestion.storyPoints}
                </span>
              </div>
            )}

            {suggestion.acceptanceCriteria.length > suggestion.issue.acceptanceCriteria.length && (
              <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-xs text-purple-700 dark:text-purple-300">
                  +{suggestion.acceptanceCriteria.length - suggestion.issue.acceptanceCriteria.length} criterios
                </span>
              </div>
            )}

            {suggestion.dependencies.length > suggestion.issue.dependencies.length && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-xs text-orange-700 dark:text-orange-300">
                  +{suggestion.dependencies.length - suggestion.issue.dependencies.length} dependencias
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison View */}
      <motion.div
        initial={false}
        animate={{ height: showComparison ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="p-4">
            <AiComparisonView
              items={comparisonItems}
              issueKey={suggestion.issue.key}
              issueTitle={suggestion.issue.title}
            />
          </div>
        </div>
      </motion.div>

      {/* Success feedback */}
      {isAccepting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Aplicando cambios...
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
