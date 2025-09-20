'use client';

import { motion } from 'motion/react';
import { Mode } from './types';

interface AiModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modeDescriptions: Record<Mode, { title: string; description: string; icon: React.ReactElement; color: string }> = {
  CONSERVADOR: {
    title: 'Conservador',
    description: 'Cambios mínimos, prioriza consistencia con el backlog actual',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600'
  },
  BALANCEADO: {
    title: 'Balanceado',
    description: 'Mejoras moderadas con sugerencias de historias y criterios',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 12v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'from-amber-500 to-amber-600'
  },
  CREATIVO: {
    title: 'Creativo',
    description: 'Explora variantes con más contexto y propuestas de dependencias',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: 'from-purple-500 to-purple-600'
  },
};

export function AiModeSelector({ mode, onModeChange }: AiModeSelectorProps) {
  const modes = Object.keys(modeDescriptions) as Mode[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Modo de IA
        </h3>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {modes.map((modeOption) => {
          const modeConfig = modeDescriptions[modeOption];
          const isSelected = mode === modeOption;

          return (
            <motion.button
              key={modeOption}
              type="button"
              onClick={() => onModeChange(modeOption)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 text-left group ${
                isSelected
                  ? 'border-amber-300 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-200 dark:hover:border-amber-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3"
                >
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </motion.div>
              )}

              {/* Mode content */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${modeConfig.color} shadow-sm`}>
                    <div className="text-white">
                      {modeConfig.icon}
                    </div>
                  </div>
                  <h4 className={`font-semibold text-sm ${
                    isSelected 
                      ? 'text-amber-800 dark:text-amber-200' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {modeConfig.title}
                  </h4>
                </div>

                <p className={`text-xs leading-relaxed ${
                  isSelected 
                    ? 'text-amber-700 dark:text-amber-300' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {modeConfig.description}
                </p>
              </div>

              {/* Hover effect */}
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${modeConfig.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </motion.button>
          );
        })}
      </div>

      {/* Current mode description */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 mt-0.5">
            <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Modo {modeDescriptions[mode].title} seleccionado
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {modeDescriptions[mode].description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
