'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Issue } from '../../../types/domain/dashboard';

interface BoardMetricsProps {
  issues: Issue[];
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const Icons = {
  progress: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  blocked: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
    </svg>
  ),
  completed: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  velocity: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  total: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
};

function MetricCard({ label, value, icon, color, bgColor, trend }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <span className={color}>
              {icon}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              {label}
            </p>
            <p className="text-lg font-bold text-[var(--color-text-primary)] mt-1">
              {value}
            </p>
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend.isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
          }`}>
            <svg className={`h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function BoardMetrics({ issues }: BoardMetricsProps) {
  const metrics = useMemo(() => {
    const total = issues.length;
    const completed = issues.filter(issue => issue.status === 'DONE').length;
    const inProgress = issues.filter(issue => issue.status === 'IN_PROGRESS').length;
    const blocked = issues.filter(issue => issue.blocked).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calcular velocity (ejemplo básico)
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const recentlyCompleted = issues.filter(issue => 
      issue.status === 'DONE' && 
      new Date(issue.updatedAt) > thisWeek
    ).length;

    return {
      total,
      completed,
      inProgress,
      blocked,
      completionRate,
      velocity: recentlyCompleted
    };
  }, [issues]);

  if (issues.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="px-6 py-4 my-10 bg-[var(--color-surface-secondary)] border-b border-[var(--color-border)]"
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 ">
        <MetricCard
          label="Total Issues"
          value={metrics.total}
          icon={Icons.total}
          color="text-[var(--color-text-primary)]"
          bgColor="bg-[var(--color-surface-tertiary)]"
        />
        
        <MetricCard
          label="En Progreso"
          value={metrics.inProgress}
          icon={Icons.progress}
          color="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/20"
          trend={metrics.inProgress > 0 ? { value: 12, isPositive: true } : undefined}
        />
        
        <MetricCard
          label="Completadas"
          value={metrics.completed}
          icon={Icons.completed}
          color="text-[var(--color-success)]"
          bgColor="bg-green-100 dark:bg-green-900/20"
        />
        
        <MetricCard
          label="Bloqueadas"
          value={metrics.blocked}
          icon={Icons.blocked}
          color="text-[var(--color-error)]"
          bgColor="bg-red-100 dark:bg-red-900/20"
        />
        
        <MetricCard
          label="Progreso"
          value={`${metrics.completionRate}%`}
          icon={Icons.velocity}
          color="text-[var(--color-primary)]"
          bgColor="bg-[var(--color-primary)]/10"
          trend={{ value: metrics.completionRate, isPositive: metrics.completionRate > 50 }}
        />
      </div>
      
      {/* Progress Bar */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            Progreso General
          </span>
          <span className="text-xs font-bold text-[var(--color-text-primary)]">
            {metrics.completed}/{metrics.total}
          </span>
        </div>
        <div className="w-full bg-[var(--color-surface-tertiary)] rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metrics.completionRate}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
