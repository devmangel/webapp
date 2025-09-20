'use client';

import { memo } from 'react';

interface ImportHeaderProps {
  stats: string;
  isProcessing: boolean;
  hasResult: boolean;
}

const ImportHeader = memo(function ImportHeader({ 
  stats, 
  isProcessing, 
  hasResult 
}: ImportHeaderProps) {
  const statusColor = hasResult 
    ? 'text-green-600 dark:text-green-400' 
    : isProcessing 
    ? 'text-amber-600 dark:text-amber-400' 
    : 'text-gray-500 dark:text-gray-400';

  const statusIcon = hasResult 
    ? '✅' 
    : isProcessing 
    ? '⚡' 
    : '🤖';

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
            <svg 
              className="h-6 w-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              Crear proyecto desde markdown
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Importa tu especificación y la IA creará automáticamente un proyecto completo
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <span className="text-sm">🧠</span>
            <span className="font-medium">Procesamiento con IA</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <span className="text-sm">🚀</span>
            <span className="font-medium">Sprints automáticos</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <span className="text-sm">👥</span>
            <span className="font-medium">Asignación inteligente</span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <div className="flex items-center gap-3 rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <span className={`text-lg ${statusColor}`}>
            {statusIcon}
          </span>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Estado
            </p>
            <p className={`text-sm font-semibold ${statusColor}`}>
              {stats}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
});

export default ImportHeader;
