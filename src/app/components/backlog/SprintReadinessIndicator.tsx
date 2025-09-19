'use client';

import { Issue } from 'types/domain/dashboard';

interface SprintReadinessIndicatorProps {
  issue: Issue;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

interface ReadinessCriteria {
  key: string;
  label: string;
  met: boolean;
  required: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

export function SprintReadinessIndicator({ 
  issue, 
  size = 'md', 
  showDetails = false 
}: SprintReadinessIndicatorProps) {
  
  const criteria: ReadinessCriteria[] = [
    {
      key: 'storyPoints',
      label: 'Story Points asignados',
      met: Boolean(issue.storyPoints && issue.storyPoints > 0),
      required: true
    },
    {
      key: 'assignee',
      label: 'Responsable asignado',
      met: Boolean(issue.assigneeId),
      required: true
    },
    {
      key: 'description',
      label: 'Descripción completa',
      met: Boolean(issue.description && issue.description.length > 20),
      required: true
    },
    {
      key: 'acceptanceCriteria',
      label: 'Criterios de aceptación',
      met: Boolean(issue.acceptanceCriteria && issue.acceptanceCriteria.length > 0),
      required: issue.type === 'STORY'
    }
  ];

  const requiredCriteria = criteria.filter(c => c.required);
  const metCriteria = requiredCriteria.filter(c => c.met);
  const isReady = metCriteria.length === requiredCriteria.length;
  const completionPercentage = Math.round((metCriteria.length / requiredCriteria.length) * 100);

  // Icons
  const ReadyIcon = () => (
    <svg className={`${sizeClasses[size]} text-green-600 dark:text-green-400`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  const PartialIcon = () => (
    <svg className={`${sizeClasses[size]} text-yellow-600 dark:text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );

  const NotReadyIcon = () => (
    <svg className={`${sizeClasses[size]} text-red-600 dark:text-red-400`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );

  const renderIcon = () => {
    if (isReady) return <ReadyIcon />;
    if (completionPercentage > 0) return <PartialIcon />;
    return <NotReadyIcon />;
  };

  const getStatusText = () => {
    if (isReady) return 'Listo para Sprint';
    if (completionPercentage > 50) return `${completionPercentage}% listo`;
    return 'No listo';
  };

  const getStatusColor = () => {
    if (isReady) return 'text-green-600 dark:text-green-400';
    if (completionPercentage > 0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (showDetails) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {renderIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="ml-6 space-y-1">
          {requiredCriteria.map((criterion) => (
            <div key={criterion.key} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                criterion.met 
                  ? 'bg-green-500 dark:bg-green-400' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`} />
              <span className={criterion.met 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-gray-500 dark:text-gray-400'
              }>
                {criterion.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" title={getStatusText()}>
      {renderIcon()}
      <span className={`text-xs font-medium ${getStatusColor()}`}>
        {completionPercentage}%
      </span>
    </div>
  );
}
