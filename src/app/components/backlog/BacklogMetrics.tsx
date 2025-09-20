'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardBody } from 'components/ui/Card';
import { Typography } from 'components/ui/Typography';
import { Issue, Epic } from 'types/domain';
// Iconos SVG personalizados
const Icons = {
  storyPoints: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  ready: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  progress: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  blocked: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )
};

interface BacklogMetricsProps {
  issues: Issue[];
  epics: Record<string, Epic>;
}

interface MetricData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function BacklogMetrics({ issues }: BacklogMetricsProps) {
  const metrics = useMemo((): MetricData[] => {
    const totalStoryPoints = issues
      .filter(issue => issue.type === 'STORY' || issue.type === 'TASK')
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

    const readyItems = issues.filter(issue => 
      issue.storyPoints && 
      issue.assigneeId && 
      (issue.type === 'STORY' ? issue.summary && issue.summary.length > 10 : true)
    );

    const blockedItems = issues.filter(issue => issue.blocked);

    const completedStoryPoints = issues
      .filter(issue => issue.status === 'DONE')
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

    return [
      {
        title: 'Story Points Totales',
        value: totalStoryPoints,
        subtitle: `${issues.length} items en backlog`,
        icon: Icons.storyPoints,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      },
      {
        title: 'Listos para Sprint',
        value: readyItems.length,
        subtitle: `${Math.round((readyItems.length / issues.length) * 100)}% del backlog`,
        icon: Icons.ready,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      },
      {
        title: 'En Progreso',
        value: issues.filter(issue => 
          issue.status === 'IN_PROGRESS' || issue.status === 'IN_REVIEW'
        ).length,
        subtitle: `${completedStoryPoints} pts completados`,
        icon: Icons.progress,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20'
      },
      {
        title: 'Bloqueados',
        value: blockedItems.length,
        subtitle: blockedItems.length > 0 ? 'Requiere atención' : 'Sin bloqueos',
        icon: Icons.blocked,
        color: blockedItems.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400',
        bgColor: blockedItems.length > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900/20'
      }
    ];
  }, [issues]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <Card variant="elevated" hover className="h-full">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Typography variant="caption" color="secondary" className="uppercase tracking-wide">
                    {metric.title}
                  </Typography>
                  <Typography variant="h3" className="mt-1 font-bold">
                    {metric.value}
                  </Typography>
                  <Typography variant="caption" color="secondary" className="mt-1">
                    {metric.subtitle}
                  </Typography>
                </div>
                <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
