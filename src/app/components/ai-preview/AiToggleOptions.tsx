'use client';

import { motion } from 'motion/react';
import { ToggleOptions } from './types';

interface AiToggleOptionsProps {
  options: ToggleOptions;
  onToggle: (key: keyof ToggleOptions) => void;
}

const toggleConfig = {
  estimate: {
    title: 'Estimar Story Points',
    description: 'IA analizará la complejidad y sugerirá puntos de historia apropiados',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  dod: {
    title: 'Generar Definition of Done',
    description: 'IA creará criterios de definición de terminado basados en mejores prácticas',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-emerald-500 to-emerald-600',
    accentColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  dependencies: {
    title: 'Sugerir Dependencias',
    description: 'IA identificará posibles dependencias entre historias y componentes',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    color: 'from-purple-500 to-purple-600',
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
};

export function AiToggleOptions({ options, onToggle }: AiToggleOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Opciones de IA
        </h3>
      </div>

      <div className="space-y-3">
        {(Object.keys(toggleConfig) as (keyof ToggleOptions)[]).map((key) => {
          const config = toggleConfig[key];
          const isEnabled = options[key];

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
                isEnabled
                  ? 'border-amber-300 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => onToggle(key)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Icon container */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} shadow-sm`}>
                    <div className="text-white">
                      {config.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <h4 className={`font-semibold text-sm ${
                      isEnabled 
                        ? 'text-amber-800 dark:text-amber-200' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {config.title}
                    </h4>
                    <p className={`text-xs leading-relaxed ${
                      isEnabled 
                        ? 'text-amber-700 dark:text-amber-300' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <div className="ml-3">
                  <motion.button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      isEnabled 
                        ? 'bg-amber-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(key);
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </motion.button>
                </div>
              </div>

              {/* Enabled indicator */}
              {isEnabled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="absolute top-3 right-3"
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full shadow-sm" />
                </motion.div>
              )}

              {/* Hover effect */}
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {Object.values(options).filter(Boolean).length} de {Object.keys(options).length} opciones habilitadas
          </span>
        </div>
      </motion.div>
    </div>
  );
}
