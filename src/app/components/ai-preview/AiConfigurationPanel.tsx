'use client';

import { motion } from 'motion/react';
import { AiModeSelector } from './AiModeSelector';
import { AiToggleOptions } from './AiToggleOptions';
import { Mode, ToggleOptions } from './types';

interface AiConfigurationPanelProps {
  mode: Mode;
  options: ToggleOptions;
  onModeChange: (mode: Mode) => void;
  onToggleOption: (key: keyof ToggleOptions) => void;
  onApplyAll: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  suggestionCount: number;
}

export function AiConfigurationPanel({
  mode,
  options,
  onModeChange,
  onToggleOption,
  onApplyAll,
  isCollapsed = false,
  onToggleCollapse,
  suggestionCount,
}: AiConfigurationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Configuración de IA
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Personaliza cómo la IA analiza y mejora tu backlog
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Apply All Button */}
            {suggestionCount > 0 && (
              <motion.button
                type="button"
                onClick={onApplyAll}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold text-sm hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Aplicar todo ({suggestionCount})
                </div>
              </motion.button>
            )}

            {/* Collapse Toggle */}
            {onToggleCollapse && (
              <motion.button
                type="button"
                onClick={onToggleCollapse}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: isCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={false}
        animate={{ 
          height: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1 
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut",
          opacity: { duration: 0.2, delay: isCollapsed ? 0 : 0.1 }
        }}
        className="overflow-hidden"
      >
        <div className="p-6 space-y-8">
          {/* Mode Selector */}
          <AiModeSelector
            mode={mode}
            onModeChange={onModeChange}
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 font-medium">
                Opciones adicionales
              </span>
            </div>
          </div>

          {/* Toggle Options */}
          <AiToggleOptions
            options={options}
            onToggle={onToggleOption}
          />
        </div>
      </motion.div>

      {/* Collapsed preview */}
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          className="p-4 bg-gray-50 dark:bg-gray-800/50"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Modo: <span className="font-medium text-gray-900 dark:text-gray-100">{mode}</span>
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">
                {Object.values(options).filter(Boolean).length}/3 opciones activas
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Click para expandir
            </div>
          </div>
        </motion.div>
      )}

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-amber-200/20 to-amber-300/20 dark:from-amber-600/10 dark:to-amber-700/10 rounded-full blur-2xl" />
    </motion.div>
  );
}
