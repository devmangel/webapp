'use client';

import { Priority } from 'types/shared/common';

interface PriorityIndicatorProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const priorityConfig = {
  LOW: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
    label: 'Baja',
    icon: '↘️'
  },
  MEDIUM: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    label: 'Media',
    icon: '➡️'
  },
  HIGH: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-700',
    label: 'Alta',
    icon: '↗️'
  },
  CRITICAL: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-700',
    label: 'Crítica',
    icon: '⬆️'
  }
};

const sizeClasses = {
  sm: {
    container: 'px-1.5 py-0.5 text-xs',
    icon: 'text-xs',
    label: 'text-xs'
  },
  md: {
    container: 'px-2 py-1 text-sm',
    icon: 'text-sm',
    label: 'text-sm'
  },
  lg: {
    container: 'px-3 py-1.5 text-base',
    icon: 'text-base',
    label: 'text-base'
  }
};

export function PriorityIndicator({ 
  priority, 
  size = 'sm', 
  showLabel = false 
}: PriorityIndicatorProps) {
  const config = priorityConfig[priority];
  const sizeClass = sizeClasses[size];

  return (
    <div className={`
      inline-flex items-center gap-1 rounded-full font-medium border
      ${config.bgColor} ${config.color} ${config.borderColor}
      ${sizeClass.container}
    `}>
      <span className={sizeClass.icon}>
        {config.icon}
      </span>
      {showLabel && (
        <span className={sizeClass.label}>
          {config.label}
        </span>
      )}
    </div>
  );
}
