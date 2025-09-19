'use client';

import { motion } from 'motion/react';
import { Typography } from 'components/ui/Typography';
import { formatDate } from 'app/components/utils/format';
import { ActivityTimelineProps } from './types';

export function ActivityTimeline({ activities, team, issues }: ActivityTimelineProps) {
  const recentActivities = activities
    .slice(-10)
    .reverse()
    .filter(activity => activity.scope === 'ISSUE');

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'status_changed':
        return '🔄';
      case 'assignee_changed':
        return '👤';
      case 'comment_added':
        return '💬';
      case 'label_added':
      case 'label_removed':
        return '🏷️';
      default:
        return '📝';
    }
  };

  const getActivityDescription = (activity: typeof activities[0]) => {
    const issue = issues[activity.targetId];
    const actor = team[activity.actorId];
    
    switch (activity.action) {
      case 'status_changed':
        return `${actor?.name || 'Usuario'} cambió ${issue?.key || 'issue'} a ${activity.payload?.to || 'nuevo estado'}`;
      case 'assignee_changed':
        const newAssignee = activity.payload?.to && typeof activity.payload.to === 'string' 
          ? team[activity.payload.to] 
          : null;
        return `${issue?.key || 'Issue'} asignado a ${newAssignee?.name || 'sin asignar'}`;
      case 'comment_added':
        return `${actor?.name || 'Usuario'} comentó en ${issue?.key || 'issue'}`;
      case 'label_added':
        return `${issue?.key || 'Issue'} marcado como ${activity.payload?.label || 'etiquetado'}`;
      case 'label_removed':
        return `Se removió ${activity.payload?.label || 'etiqueta'} de ${issue?.key || 'issue'}`;
      default:
        return `Actividad en ${issue?.key || 'issue'}`;
    }
  };

  return (
    <div className="space-y-3">
      {recentActivities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex-shrink-0 text-lg">
            {getActivityIcon(activity.action)}
          </div>
          <div className="flex-1 min-w-0">
            <Typography variant="caption" className="text-gray-900 dark:text-gray-100">
              {getActivityDescription(activity)}
            </Typography>
            <Typography variant="caption" color="secondary" className="block mt-1">
              {formatDate(activity.createdAt)}
            </Typography>
          </div>
        </motion.div>
      ))}
      {recentActivities.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <Typography variant="caption">
            No hay actividad reciente en el proyecto
          </Typography>
        </div>
      )}
    </div>
  );
}
