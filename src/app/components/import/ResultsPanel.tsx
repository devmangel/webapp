'use client';

import { memo } from 'react';
import { Card, CardBody } from 'components/ui/Card';
import FeedbackCards from './FeedbackCards';
import type { FullImportResult } from 'types/domain/dashboard/import';

interface ResultsPanelProps {
  result: FullImportResult | null;
  isLoading: boolean;
}

const ResultsPanel = memo(function ResultsPanel({
  result,
  isLoading
}: ResultsPanelProps) {
  if (isLoading) {
    return (
      <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <CardBody className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin dark:border-gray-700 dark:border-t-blue-400"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30"></div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Procesando con IA...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                La IA está analizando tu especificación y creando el proyecto automáticamente
              </p>
            </div>
            <div className="flex justify-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce dark:bg-blue-400"></div>
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce delay-75 dark:bg-blue-400"></div>
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce delay-150 dark:bg-blue-400"></div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <CardBody className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Listo para procesar
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pega tu especificación en markdown y presiona el botón para que la IA cree automáticamente tu proyecto
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                🤖 Procesamiento inteligente
              </span>
              <span className="rounded-full bg-green-50 px-3 py-1 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                🚀 Sprints automáticos
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado del resultado */}
      {result.success ? (
        <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
                ✅ ¡Proyecto creado exitosamente!
              </h3>
              {result.summary && result.projectId && (
                <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <p>
                    <span className="font-medium">Proyecto:</span> {result.summary.project}
                  </p>
                  <p>
                    <span className="font-medium">ID:</span> {result.projectId}
                  </p>
                  <p>
                    <span className="font-medium">Elementos generados:</span> {result.summary.sprints} sprints, {result.summary.epics} épicas, {result.summary.stories} historias, {result.summary.tasks} tareas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-50/50 p-6 dark:border-red-800/50 dark:from-red-900/20 dark:to-red-900/10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                ❌ Error en la importación
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                La importación falló. Revisa los errores a continuación y corrige el markdown antes de intentar de nuevo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de elementos */}
      {result.summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-blue-900/30">
            <CardBody className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {result.summary.sprints}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Sprints
              </p>
            </CardBody>
          </Card>

          <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:border-purple-800/50 dark:from-purple-900/20 dark:to-purple-900/30">
            <CardBody className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {result.summary.epics}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                Épicas
              </p>
            </CardBody>
          </Card>

          <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:border-emerald-800/50 dark:from-emerald-900/20 dark:to-emerald-900/30">
            <CardBody className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {result.summary.stories}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Historias
              </p>
            </CardBody>
          </Card>

          <Card className="border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:border-orange-800/50 dark:from-orange-900/20 dark:to-orange-900/30">
            <CardBody className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {result.summary.tasks}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                Tareas
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Feedback cards */}
      {result.feedback && (
        <FeedbackCards
          errors={result.feedback.errors || []}
          warnings={result.feedback.warnings || []}
          completions={result.feedback.completions || []}
        />
      )}
    </div>
  );
});

export default ResultsPanel;
