'use client';

import { motion } from 'motion/react';
import { Card, CardBody } from 'components/ui/Card';
import { Typography } from 'components/ui/Typography';
import { EpicProgressCardProps } from './types';

export function EpicProgressCard({ epic, stats, index }: EpicProgressCardProps) {
  const completion = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
  const isAtRisk = completion < 30 && stats.total > 0;  
  const isComplete = completion >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-l-4" 
            style={{
              borderLeftColor: isComplete ? 'var(--color-success)' : 
                              isAtRisk ? 'var(--color-error)' : 'var(--color-warning)'
            }}>
        <CardBody className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Typography variant="h3" className="font-semibold mb-1">
                {epic?.name}
              </Typography>
              <Typography variant="caption" color="secondary" className="line-clamp-2">
                {epic?.objective}
              </Typography>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isComplete ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                isAtRisk ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {completion}%
              </div>
            </div>
          </div>
          
          {/* Barra de progreso visual */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Progreso</span>
              <span>{stats.done}/{stats.total} completados</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  isComplete ? 'bg-green-500' :
                  isAtRisk ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </div>
          </div>

          {/* Métricas detalladas */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.todo}</div>
              <div className="text-xs text-gray-500">To Do</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.inProgress}</div>
              <div className="text-xs text-gray-500">En Curso</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.inReview}</div>
              <div className="text-xs text-gray-500">Revisión</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.done}</div>
              <div className="text-xs text-gray-500">Completado</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
