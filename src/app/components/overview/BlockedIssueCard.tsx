'use client';

import { motion } from 'motion/react';
import { Card, CardBody } from 'components/ui/Card';
import { Typography } from 'components/ui/Typography';
import { PRIORITY_LABELS } from 'app/components/dashboard/constants';
import { BlockedIssueCardProps } from './types';

export function BlockedIssueCard({ issue, assignee, index }: BlockedIssueCardProps) {
  const daysSinceUpdate = issue.updatedAt ? 
    Math.floor((Date.now() - new Date(issue.updatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  const urgencyLevel = daysSinceUpdate >= 3 ? 'critical' : daysSinceUpdate >= 1 ? 'high' : 'medium';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${
        urgencyLevel === 'critical' ? 'border-l-red-600 bg-red-50 dark:bg-red-900/10' :
        urgencyLevel === 'high' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10' :
        'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      }`}>
        <CardBody className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  {issue.key}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  urgencyLevel === 'critical' ? 'bg-red-500 animate-pulse' :
                  urgencyLevel === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                }`} />
              </div>
              <Typography variant="body" className="font-medium mb-1 line-clamp-2">
                {issue.title}
              </Typography>
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <span>👤 {assignee ? assignee.name : 'Sin asignar'}</span>
                <span>⏰ {daysSinceUpdate}d bloqueado</span>
                <span className={`px-2 py-1 rounded ${
                  issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                  issue.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {PRIORITY_LABELS[issue.priority]}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
