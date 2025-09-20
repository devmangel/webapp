'use client';

import { memo } from 'react';
import type { FeedbackItem, Completion } from 'types/domain/import';

interface FeedbackCardsProps {
  errors: FeedbackItem[];
  warnings: FeedbackItem[];
  completions: Completion[];
  isCompact?: boolean;
  onViewMore?: (type: 'errors' | 'warnings' | 'completions') => void;
}

const FeedbackCards = memo(function FeedbackCards({
  errors,
  warnings,
  completions,
  isCompact = false,
  onViewMore
}: FeedbackCardsProps) {
  if (errors.length === 0 && warnings.length === 0 && completions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Errores críticos */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-50/50 p-4 dark:border-red-800/50 dark:from-red-900/20 dark:to-red-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                Errores críticos ({errors.length})
              </h3>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                Estos errores impiden completar la importación
              </p>
              <ul className="mt-3 space-y-3">
                {(isCompact ? errors.slice(0, 2) : errors).map((error, index) => (
                  <li key={index} className="rounded-lg bg-white/60 border border-red-100 p-3 dark:bg-red-900/20 dark:border-red-800/30">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {error.message}
                      </p>
                      {!isCompact && error.location && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          📍 Ubicación: {error.location}
                        </p>
                      )}
                      {!isCompact && error.suggestion && (
                        <div className="mt-2 rounded-md bg-red-100/50 px-3 py-2 dark:bg-red-800/20">
                          <p className="text-xs text-red-700 dark:text-red-300">
                            💡 Sugerencia: {error.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {isCompact && errors.length > 2 && onViewMore && (
                <button
                  type="button"
                  onClick={() => onViewMore('errors')}
                  className="mt-3 inline-flex items-center text-xs font-medium text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200 transition-colors"
                >
                  Ver todos los {errors.length} errores
                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Advertencias */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/50 p-4 dark:border-amber-800/50 dark:from-amber-900/20 dark:to-amber-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Advertencias ({warnings.length})
              </h3>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Recomendaciones para mejorar la especificación
              </p>
              <ul className="mt-3 space-y-3">
                {(isCompact ? warnings.slice(0, 2) : warnings).map((warning, index) => (
                  <li key={index} className="rounded-lg bg-white/60 border border-amber-100 p-3 dark:bg-amber-900/20 dark:border-amber-800/30">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {warning.message}
                      </p>
                      {!isCompact && warning.location && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          📍 Ubicación: {warning.location}
                        </p>
                      )}
                      {!isCompact && warning.suggestion && (
                        <div className="mt-2 rounded-md bg-amber-100/50 px-3 py-2 dark:bg-amber-800/20">
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            💡 Sugerencia: {warning.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {isCompact && warnings.length > 2 && onViewMore && (
                <button
                  type="button"
                  onClick={() => onViewMore('warnings')}
                  className="mt-3 inline-flex items-center text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 transition-colors"
                >
                  Ver todas las {warnings.length} advertencias
                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completions/Mejoras aplicadas */}
      {completions.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-green-50/50 p-4 dark:border-green-800/50 dark:from-green-900/20 dark:to-green-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                Mejoras aplicadas por IA ({completions.length})
              </h3>
              <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                La IA completó automáticamente estos elementos
              </p>
              <ul className="mt-3 space-y-3">
                {(isCompact ? completions.slice(0, 2) : completions).map((completion, index) => {
                  const displayValue = typeof completion.generated === 'number' 
                    ? `${completion.generated} puntos` 
                    : completion.generated;
                  
                  return (
                    <li key={index} className="rounded-lg bg-white/60 border border-green-100 p-3 dark:bg-green-900/20 dark:border-green-800/30">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            {completion.target}
                          </p>
                          {!isCompact && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {completion.type}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <div className="rounded-full bg-green-100 px-2 py-1 dark:bg-green-800/30">
                            <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                              {displayValue}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {isCompact && completions.length > 2 && onViewMore && (
                <button
                  type="button"
                  onClick={() => onViewMore('completions')}
                  className="mt-3 inline-flex items-center text-xs font-medium text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200 transition-colors"
                >
                  Ver todas las {completions.length} mejoras IA
                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default FeedbackCards;
