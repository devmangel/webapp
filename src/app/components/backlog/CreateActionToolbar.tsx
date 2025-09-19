'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

interface CreateActionToolbarProps {
  onCreateEpic?: () => void;
  onCreateStory?: () => void;
  onCreateTask?: () => void;
  onCreateSprint?: () => void;
  onCreateProject?: () => void;
}

const Icons = {
  epic: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  story: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  task: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  sprint: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  project: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  ),
  plus: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
};

const createActions = [
  {
    key: 'epic',
    label: 'Épica',
    icon: Icons.epic,
    color: 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
    lightColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    description: 'Nueva iniciativa o objetivo'
  },
  {
    key: 'story',
    label: 'Historia',
    icon: Icons.story,
    color: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
    lightColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    description: 'Funcionalidad de usuario'
  },
  {
    key: 'task',
    label: 'Tarea',
    icon: Icons.task,
    color: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
    lightColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
    description: 'Trabajo técnico específico'
  },
  {
    key: 'sprint',
    label: 'Sprint',
    icon: Icons.sprint,
    color: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700',
    lightColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    description: 'Período de desarrollo'
  },
  {
    key: 'project',
    label: 'Proyecto',
    icon: Icons.project,
    color: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700',
    lightColor: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    description: 'Nuevo proyecto'
  }
];

export function CreateActionToolbar({ 
  onCreateEpic, 
  onCreateStory, 
  onCreateTask, 
  onCreateSprint, 
  onCreateProject 
}: CreateActionToolbarProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (actionKey: string, handler?: () => void) => {
    if (!handler) {
      // Placeholder para desarrollo
      console.log(`Create ${actionKey} clicked`);
      return;
    }

    setLoadingAction(actionKey);
    try {
      await handler();
    } finally {
      setLoadingAction(null);
    }
  };

  const getHandler = (key: string) => {
    const handlers = {
      epic: onCreateEpic,
      story: onCreateStory,
      task: onCreateTask,
      sprint: onCreateSprint,
      project: onCreateProject
    };
    return handlers[key as keyof typeof handlers];
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          {Icons.plus}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Crear Nuevo
        </h3>
      </div>

      {/* Desktop: Botones horizontales */}
      <div className="hidden md:flex flex-wrap gap-3">
        {createActions.map((action, index) => (
          <motion.div
            key={action.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <button
              onClick={() => handleAction(action.key, getHandler(action.key))}
              disabled={loadingAction !== null}
              className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${action.lightColor}
                ${action.textColor}
                hover:shadow-md hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed
                border border-transparent hover:border-gray-200 dark:hover:border-gray-600
              `}
            >
              <div className={`
                p-2 rounded-md text-white transition-colors duration-200
                ${action.color}
              `}>
                {loadingAction === action.key ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  action.icon
                )}
              </div>
              
              <div className="text-left">
                <div className="font-medium text-sm">
                  {action.label}
                </div>
                <div className="text-xs opacity-75">
                  {action.description}
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Mobile: Botones compactos */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {createActions.map((action, index) => (
          <motion.div
            key={action.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <button
              onClick={() => handleAction(action.key, getHandler(action.key))}
              disabled={loadingAction !== null}
              className={`
                w-full flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200
                ${action.lightColor}
                ${action.textColor}
                hover:shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
                border border-transparent hover:border-gray-200 dark:hover:border-gray-600
              `}
            >
              <div className={`
                p-2 rounded-md text-white transition-colors duration-200
                ${action.color}
              `}>
                {loadingAction === action.key ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  action.icon
                )}
              </div>
              
              <div className="text-center">
                <div className="font-medium text-sm">
                  {action.label}
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
