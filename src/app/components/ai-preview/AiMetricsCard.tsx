'use client';

import { motion } from 'motion/react';
import { AiMetrics } from './types';

interface AiMetricsCardProps {
  metrics: AiMetrics;
  isLoading?: boolean;
}

export function AiMetricsCard({ metrics, isLoading = false }: AiMetricsCardProps) {
  const efficiencyRate = metrics.totalSuggestions > 0 
    ? Math.round((metrics.acceptedSuggestions / metrics.totalSuggestions) * 100)
    : 0;

  const metricsData = [
    {
      label: 'Total de sugerencias',
      value: metrics.totalSuggestions,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Pendientes',
      value: metrics.pendingSuggestions,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'Aplicadas',
      value: metrics.acceptedSuggestions,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Tasa de adopción',
      value: `${efficiencyRate}%`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: efficiencyRate >= 70 ? 'text-emerald-600' : efficiencyRate >= 40 ? 'text-amber-600' : 'text-red-600',
      bgColor: efficiencyRate >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30' : efficiencyRate >= 40 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Estadísticas de IA
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Resumen de actividad y rendimiento
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {metricsData.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
              className="relative p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${metric.bgColor}`}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {isLoading ? (
                      <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                      metric.value
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                    {metric.label}
                  </div>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100/50 dark:to-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Time Saved Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tiempo estimado ahorrado
            </span>
          </div>
          <div className="text-right">
            {isLoading ? (
              <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {metrics.estimatedTimesSaved}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Performance Indicator */}
      {!isLoading && metrics.totalSuggestions > 0 && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="px-4 pb-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Rendimiento de IA</span>
              <span className={`font-medium ${
                efficiencyRate >= 70 ? 'text-emerald-600' : 
                efficiencyRate >= 40 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {efficiencyRate >= 70 ? 'Excelente' : efficiencyRate >= 40 ? 'Bueno' : 'Necesita mejora'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  efficiencyRate >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                  efficiencyRate >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${efficiencyRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-gradient-to-br from-gray-200/20 to-gray-300/20 dark:from-gray-600/10 dark:to-gray-700/10 rounded-full blur-xl" />
    </motion.div>
  );
}
