'use client';

import { motion } from 'motion/react';

interface AiEmptyStateProps {
  type: 'no-stories' | 'no-suggestions' | 'no-project';
  onAction?: () => void;
  actionLabel?: string;
}

const emptyStateConfig = {
  'no-stories': {
    icon: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Sin historias disponibles',
    description: 'No hay historias en el proyecto seleccionado que puedan ser analizadas por la IA.',
    suggestion: 'Crea algunas historias en tu backlog para que la IA pueda hacer sugerencias.',
  },
  'no-suggestions': {
    icon: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Sin sugerencias disponibles',
    description: 'La IA no ha encontrado mejoras que sugerir para las historias del proyecto actual.',
    suggestion: 'Prueba cambiando el modo de IA o ajustando las opciones de configuración.',
  },
  'no-project': {
    icon: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z" />
      </svg>
    ),
    title: 'Ningún proyecto seleccionado',
    description: 'Selecciona un proyecto para que la IA pueda analizar su backlog y hacer sugerencias.',
    suggestion: 'Ve al dashboard principal y selecciona un proyecto activo.',
  },
};

export function AiEmptyState({ type, onAction, actionLabel }: AiEmptyStateProps) {
  const config = emptyStateConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-amber-100/40 to-amber-200/40 dark:from-amber-800/20 dark:to-amber-900/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-blue-200/40 dark:from-blue-800/20 dark:to-blue-900/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-md mx-auto space-y-6">
        {/* Icon container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          className="relative"
        >
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg mx-auto">
            {config.icon}
          </div>
          
          {/* Floating particles */}
          <motion.div
            animate={{ 
              y: [-2, 2, -2],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full opacity-60"
          />
          <motion.div
            animate={{ 
              y: [2, -2, 2],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full opacity-50"
          />
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-3"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {config.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {config.description}
          </p>
          
          <div className="pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-500 italic">
              💡 {config.suggestion}
            </p>
          </div>
        </motion.div>

        {/* Action button */}
        {onAction && actionLabel && (
          <motion.button
            type="button"
            onClick={onAction}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold text-sm hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {actionLabel}
          </motion.button>
        )}

        {/* Additional help text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <span>Inteligencia Artificial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>Análisis automático</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span>Mejoras sugeridas</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
