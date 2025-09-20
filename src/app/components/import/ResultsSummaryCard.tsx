'use client';

import { memo } from 'react';
import type { FullImportResult } from 'types/domain/dashboard/import';

interface ResultsSummaryCardProps {
  result: FullImportResult;
  onViewDetails: () => void;
}

const ResultsSummaryCard = memo(function ResultsSummaryCard({
  result,
  onViewDetails
}: ResultsSummaryCardProps) {
  const errorCount = result.feedback?.errors?.length || 0;
  const warningCount = result.feedback?.warnings?.length || 0;
  const completionCount = result.feedback?.completions?.length || 0;

  const hasIssues = errorCount > 0 || warningCount > 0;

  return (
    <div 
      className="rounded-xl p-6 transition-all"
      style={{
        backgroundColor: result.success ? 'var(--color-success)' : 'var(--color-error)',
        background: result.success 
          ? 'linear-gradient(135deg, var(--color-success), #059669)'
          : 'linear-gradient(135deg, var(--color-error), #dc2626)',
        color: 'white',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div 
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          {result.success ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-bold">
              {result.success ? '✅ ¡Proyecto creado exitosamente!' : '❌ Error en la importación'}
            </h3>
            {result.summary && result.projectId && (
              <div className="mt-2 space-y-1 text-sm opacity-90">
                <p>
                  <span className="font-medium">Proyecto:</span> {result.summary.project}
                </p>
                <p>
                  <span className="font-medium">ID:</span> {result.projectId}
                </p>
              </div>
            )}
          </div>

          {/* Summary metrics */}
          {result.summary && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div 
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                <div className="text-xl font-bold">{result.summary.sprints}</div>
                <div className="text-xs uppercase tracking-wide opacity-80">Sprints</div>
              </div>
              <div 
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                <div className="text-xl font-bold">{result.summary.epics}</div>
                <div className="text-xs uppercase tracking-wide opacity-80">Épicas</div>
              </div>
              <div 
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                <div className="text-xl font-bold">{result.summary.stories}</div>
                <div className="text-xs uppercase tracking-wide opacity-80">Historias</div>
              </div>
              <div 
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                <div className="text-xl font-bold">{result.summary.tasks}</div>
                <div className="text-xs uppercase tracking-wide opacity-80">Tareas</div>
              </div>
            </div>
          )}

          {/* Quick feedback summary */}
          {(hasIssues || completionCount > 0) && (
            <div className="flex flex-wrap gap-2">
              {errorCount > 0 && (
                <div 
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {errorCount} error{errorCount !== 1 ? 'es' : ''}
                </div>
              )}
              {warningCount > 0 && (
                <div 
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {warningCount} advertencia{warningCount !== 1 ? 's' : ''}
                </div>
              )}
              {completionCount > 0 && (
                <div 
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {completionCount} mejora{completionCount !== 1 ? 's' : ''} IA
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onViewDetails}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus-ring"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver detalles completos
            </button>
            
            {result.success && result.projectId && (
              <button
                type="button"
                onClick={() => window.location.href = `/dashboard?project=${result.projectId}`}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus-ring"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: result.success ? 'var(--color-success)' : 'var(--color-error)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Ir al Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ResultsSummaryCard;
