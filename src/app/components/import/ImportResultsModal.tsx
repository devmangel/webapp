'use client';

import { memo, useState, useEffect } from 'react';
import type { FullImportResult } from 'types/domain/dashboard/import';
import FeedbackCards from './FeedbackCards';
import DetailedResultsList from './DetailedResultsList';

interface ImportResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: FullImportResult | null;
}

type TabType = 'summary' | 'errors' | 'warnings' | 'improvements';

const ImportResultsModal = memo(function ImportResultsModal({
  isOpen,
  onClose,
  result
}: ImportResultsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // Reset tab when modal opens and handle escape key
  useEffect(() => {
    if (isOpen) {
      setActiveTab('summary');
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !result) return null;

  const errorCount = result.feedback?.errors?.length || 0;
  const warningCount = result.feedback?.warnings?.length || 0;
  const completionCount = result.feedback?.completions?.length || 0;

  const tabs = [
    { id: 'summary' as const, name: 'Resumen', count: null },
    { id: 'errors' as const, name: 'Errores', count: errorCount },
    { id: 'warnings' as const, name: 'Advertencias', count: warningCount },
    { id: 'improvements' as const, name: 'Mejoras IA', count: completionCount },
  ];

  const handleCopyContent = () => {
    const content = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(content);
  };

  const handleGoToDashboard = () => {
    if (result.projectId) {
      window.location.href = `/dashboard?project=${result.projectId}`;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-6xl transform overflow-hidden shadow-xl transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--border-radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)'
          }}
        >
          <div>
            <h3 
              className="text-lg font-semibold leading-6"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Resultados de Importación
            </h3>
            {result.summary && (
              <p 
                className="mt-1 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {result.summary.project} • {result.summary.sprints} sprints • {result.summary.epics} épicas • {result.summary.stories} historias • {result.summary.tasks} tareas
              </p>
            )}
          </div>
          <button
            type="button"
            className="rounded-md p-2 transition-colors focus-ring"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              color: 'var(--color-text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
            onClick={onClose}
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="whitespace-nowrap py-4 px-1 text-sm font-medium transition-colors focus-ring"
                  style={{
                    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                      e.currentTarget.style.borderBottomColor = 'var(--color-border)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }
                  }}
                >
                  {tab.name}
                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className="ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: isActive ? 'var(--color-amber-100)' : 'var(--color-surface-secondary)',
                        color: isActive ? 'var(--color-amber-800)' : 'var(--color-text-secondary)'
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto px-6 py-4">
          {activeTab === 'summary' && (
            <DetailedResultsList result={result} />
          )}
          {activeTab === 'errors' && result.feedback?.errors && (
            <FeedbackCards
              errors={result.feedback.errors}
              warnings={[]}
              completions={[]}
            />
          )}
          {activeTab === 'warnings' && result.feedback?.warnings && (
            <FeedbackCards
              errors={[]}
              warnings={result.feedback.warnings}
              completions={[]}
            />
          )}
          {activeTab === 'improvements' && result.feedback?.completions && (
            <FeedbackCards
              errors={[]}
              warnings={[]}
              completions={result.feedback.completions}
            />
          )}
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCopyContent}
              className="inline-flex items-center px-3 py-2 text-sm font-semibold transition-colors focus-ring"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)';
              }}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar datos
            </button>
          </div>
          {result.success && result.projectId && (
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="inline-flex items-center px-3 py-2 text-sm font-semibold transition-colors focus-ring"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-amber-900)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
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
  );
});

export default ImportResultsModal;
