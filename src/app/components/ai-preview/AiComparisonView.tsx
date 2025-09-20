'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

interface ComparisonItem {
  label: string;
  current: string | string[];
  suggested: string | string[];
  type: 'text' | 'list' | 'number';
}

interface AiComparisonViewProps {
  items: ComparisonItem[];
  issueKey: string;
  issueTitle: string;
}

function formatContent(content: string | string[], type: 'text' | 'list' | 'number'): React.ReactNode {
  if (type === 'list' && Array.isArray(content)) {
    if (content.length === 0) {
      return <span className="italic text-gray-400">Sin contenido</span>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {content.map((item, index) => (
          <li key={index} className="text-xs">{item}</li>
        ))}
      </ul>
    );
  }

  if (type === 'text' || type === 'number') {
    const textContent = Array.isArray(content) ? content.join(', ') : content;
    if (!textContent || textContent.trim() === '') {
      return <span className="italic text-gray-400">Sin contenido</span>;
    }
    return <p className="text-xs whitespace-pre-wrap leading-relaxed">{textContent}</p>;
  }

  return null;
}

function getDiffType(current: string | string[], suggested: string | string[]): 'addition' | 'modification' | 'unchanged' {
  const currentStr = Array.isArray(current) ? current.join('') : current;
  const suggestedStr = Array.isArray(suggested) ? suggested.join('') : suggested;
  
  if (!currentStr && suggestedStr) return 'addition';
  if (currentStr !== suggestedStr) return 'modification';
  return 'unchanged';
}

export function AiComparisonView({ items, issueKey, issueTitle }: AiComparisonViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const changedItems = items.filter(item => getDiffType(item.current, item.suggested) !== 'unchanged');
  const unchangedItems = items.filter(item => getDiffType(item.current, item.suggested) === 'unchanged');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {issueKey} - Comparación de cambios
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
            {issueTitle}
          </p>
        </div>
      </div>

      {/* Changed Items */}
      {changedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Cambios propuestos ({changedItems.length})
            </h5>
          </div>

          {changedItems.map((item, index) => {
            const isExpanded = expandedItems.has(item.label);
            const diffType = getDiffType(item.current, item.suggested);

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.label)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        diffType === 'addition' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        diffType === 'addition' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {diffType === 'addition' ? 'Nuevo' : 'Modificado'}
                      </span>
                    </div>
                    <motion.svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>
                </button>

                <motion.div
                  initial={false}
                  animate={{ height: isExpanded ? 'auto' : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Current */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full" />
                          <h6 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Actual
                          </h6>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="text-gray-700 dark:text-gray-300">
                            {formatContent(item.current, item.type)}
                          </div>
                        </div>
                      </div>

                      {/* Suggested */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                          <h6 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                            Sugerencia IA
                          </h6>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700/50">
                          <div className="text-emerald-700 dark:text-emerald-300">
                            {formatContent(item.suggested, item.type)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Unchanged Items Summary */}
      {unchangedItems.length > 0 && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              {unchangedItems.length} campo{unchangedItems.length !== 1 ? 's' : ''} sin cambios: {' '}
              {unchangedItems.map(item => item.label).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* No changes */}
      {changedItems.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Sin cambios propuestos
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            La IA no sugiere modificaciones para esta historia
          </p>
        </div>
      )}
    </div>
  );
}
