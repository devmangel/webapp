'use client';

import { motion } from 'motion/react';
import { AiMetrics } from './types';

interface AiPreviewHeaderProps {
  metrics: AiMetrics;
  isLoading?: boolean;
}

export function AiPreviewHeader({ metrics, isLoading = false }: AiPreviewHeaderProps) {
  const metricsData = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      label: 'Sugerencias',
      value: metrics.totalSuggestions.toString(),
      subValue: `${metrics.pendingSuggestions} pendientes`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Aplicadas',
      value: metrics.acceptedSuggestions.toString(),
      subValue: 'en esta sesión',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Tiempo ahorrado',
      value: metrics.estimatedTimesSaved,
      subValue: 'estimado',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      label: 'Eficiencia',
      value: metrics.totalSuggestions > 0 
        ? `${Math.round((metrics.acceptedSuggestions / metrics.totalSuggestions) * 100)}%`
        : '0%',
      subValue: 'aceptación',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <header className="space-y-6">
      {/* Título principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Preview de IA
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            Revisa y aplica las mejoras sugeridas por inteligencia artificial para optimizar tu backlog
          </p>
        </div>

        {/* Indicador de estado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                Analizando...
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                Listo
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Métricas cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.1 + index * 0.1,
              ease: "easeOut" 
            }}
            className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 dark:to-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-4 space-y-2">
              {/* Icon y valor principal */}
              <div className="flex items-start justify-between">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${metric.bgColor}`}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {isLoading ? (
                      <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                      metric.value
                    )}
                  </div>
                </div>
              </div>

              {/* Label y sub-valor */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {isLoading ? (
                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    metric.subValue
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </header>
  );
}
