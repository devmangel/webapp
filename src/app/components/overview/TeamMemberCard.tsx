'use client';

import { motion } from 'motion/react';
import { Card, CardBody } from 'components/ui/Card';
import { Typography } from 'components/ui/Typography';
import { formatPoints } from 'app/components/utils/format';
import { TeamMemberCardProps } from './types';

export function TeamMemberCard({ member, memberIssues, index }: TeamMemberCardProps) {
  const totalPoints = memberIssues.reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0);
  const criticalIssues = memberIssues.filter(issue => issue.priority === 'CRITICAL').length;
  const highIssues = memberIssues.filter(issue => issue.priority === 'HIGH').length;
  
  // Determinar nivel de carga (basado en puntos y número de issues)
  const workloadLevel = 
    totalPoints >= 40 || memberIssues.length >= 8 ? 'overloaded' :
    totalPoints >= 20 || memberIssues.length >= 5 ? 'busy' : 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="group hover:shadow-lg transition-all duration-300 h-full">
        <CardBody className="p-5 h-full flex flex-col">
          {/* Header con avatar y info principal */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                {member.name.charAt(0)}
              </div>
              <div>
                <Typography variant="body" className="font-semibold text-base">
                  {member.name}
                </Typography>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    workloadLevel === 'overloaded' ? 'bg-red-500' :
                    workloadLevel === 'busy' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {workloadLevel === 'overloaded' ? 'Sobrecargado' :
                     workloadLevel === 'busy' ? 'Ocupado' : 'Disponible'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatPoints(totalPoints)}
              </div>
              <div className="text-sm text-gray-500 font-medium">puntos</div>
            </div>
          </div>

          {/* Métricas mejoradas */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{memberIssues.length}</div>
              <div className="text-xs text-gray-500 font-medium">Issues</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{criticalIssues}</div>
              <div className="text-xs text-gray-500 font-medium">Críticos</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800/50">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{highIssues}</div>
              <div className="text-xs text-gray-500 font-medium">Altos</div>
            </div>
          </div>

          {/* Barra de carga de trabajo mejorada */}
          <div className="mt-auto">
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-medium">Carga de trabajo</span>
              <span className="font-bold">{Math.min(100, Math.round((totalPoints / 50) * 100))}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
              <motion.div 
                className={`h-full rounded-full transition-all duration-700 ${
                  workloadLevel === 'overloaded' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  workloadLevel === 'busy' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                  'bg-gradient-to-r from-green-500 to-green-600'
                } shadow-sm`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round((totalPoints / 50) * 100))}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
