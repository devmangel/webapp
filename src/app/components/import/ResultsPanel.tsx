'use client';

import { memo, useState } from 'react';
import { Card, CardBody } from 'components/ui/Card';
import ResultsSummaryCard from './ResultsSummaryCard';
import ImportResultsModal from './ImportResultsModal';
import type { FullImportResult } from 'types/domain/dashboard/import';

interface ResultsPanelProps {
  result: FullImportResult | null;
  isLoading: boolean;
}

const ResultsPanel = memo(function ResultsPanel({
  result,
  isLoading
}: ResultsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
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
                Estamos analizando tu documento y creando el proyecto automáticamente
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
    <>
      {/* Compact Results Summary */}
      <ResultsSummaryCard result={result} onViewDetails={handleViewDetails} />
      
      {/* Detailed Results Modal */}
      <ImportResultsModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        result={result}
      />
    </>
  );
});

export default ResultsPanel;
