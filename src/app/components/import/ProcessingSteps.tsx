'use client';

import { memo } from 'react';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description?: string;
}

interface ProcessingStepsProps {
  steps: ProcessingStep[];
  currentStep?: string;
}

const ProcessingSteps = memo(function ProcessingSteps({
  steps,
  currentStep
}: ProcessingStepsProps) {
  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'processing':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500">
            <span className="text-xs font-semibold">{steps.indexOf(step) + 1}</span>
          </div>
        );
    }
  };

  const getStepLineColor = (index: number) => {
    if (index >= steps.length - 1) return '';
    
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const step = steps[index];
    
    if (step.status === 'completed' || (currentStepIndex > index)) {
      return 'border-green-300 dark:border-green-600';
    } else if (step.status === 'processing') {
      return 'border-blue-300 dark:border-blue-600';
    } else if (step.status === 'error') {
      return 'border-red-300 dark:border-red-600';
    }
    
    return 'border-gray-200 dark:border-gray-700';
  };

  if (steps.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Procesamiento con IA
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Siguiendo el progreso de creación automática
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="relative flex flex-col items-center">
              {getStepIcon(step)}
              {index < steps.length - 1 && (
                <div
                  className={`mt-2 h-8 w-px border-l-2 border-dashed ${getStepLineColor(index)}`}
                />
              )}
            </div>
            
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-medium ${
                  step.status === 'completed' 
                    ? 'text-green-700 dark:text-green-300'
                    : step.status === 'processing'
                    ? 'text-blue-700 dark:text-blue-300'
                    : step.status === 'error'
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {step.label}
                </h4>
                {step.status === 'processing' && (
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                    <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                  </div>
                )}
              </div>
              
              {step.description && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              )}
              
              {step.status === 'processing' && step.id === currentStep && (
                <div className="mt-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-1 w-1/3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProcessingSteps;
