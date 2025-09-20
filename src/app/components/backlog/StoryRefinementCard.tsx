'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardBody } from 'components/ui/Card';
import { Typography } from 'components/ui/Typography';
import { Issue, TeamMember } from 'types/domain';
import { EntityStatus } from 'types/shared/common';
import { PriorityIndicator } from './PriorityIndicator';
import { StoryPointsBadge } from './StoryPointsBadge';
import { SprintReadinessIndicator } from './SprintReadinessIndicator';

interface StoryRefinementCardProps {
  story: Issue;
  tasks: Issue[];
  team: Record<string, TeamMember>;
  onIssueUpdate: (issueId: string, updates: Partial<Issue>) => void;
  onReorder: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const Icons = {
  story: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  expand: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  collapse: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  moveUp: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  ),
  moveDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  task: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
};

export function StoryRefinementCard({ 
  story, 
  tasks, 
  team, 
  onIssueUpdate, 
  onReorder,
  canMoveUp,
  canMoveDown 
}: StoryRefinementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedTasks = tasks.filter(task => task.status === 'DONE').length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const assignedMember = story.assigneeId ? team[story.assigneeId] : null;

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardBody className="p-0">
        {/* Header de la historia */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            {/* Icono y prioridad */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                {Icons.story}
              </div>
              <PriorityIndicator priority={story.priority} size="sm" />
            </div>

            {/* Contenido principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Typography variant="h5" className="font-semibold">
                      {story.title}
                    </Typography>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {story.key}
                    </span>
                  </div>
                  
                  <Typography variant="caption" color="secondary" className="mb-2 line-clamp-2">
                    {story.summary}
                  </Typography>

                  {/* Métricas de la historia */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <SprintReadinessIndicator issue={story} size="sm" />
                    
                    {totalTasks > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {completedTasks}/{totalTasks} tareas
                        </span>
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${taskProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {assignedMember && (
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {assignedMember.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {assignedMember.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controles del lado derecho */}
                <div className="flex items-center gap-2">
                  <StoryPointsBadge 
                    points={story.storyPoints} 
                    size="md"
                    interactive
                    onPointsChange={(points) => onIssueUpdate(story.id, { storyPoints: points })}
                  />
                  
                  {/* Controles de reorder */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => onReorder('up')}
                      disabled={!canMoveUp}
                      className={`p-1 rounded ${
                        canMoveUp 
                          ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800' 
                          : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      }`}
                      title="Mover arriba"
                    >
                      {Icons.moveUp}
                    </button>
                    <button
                      onClick={() => onReorder('down')}
                      disabled={!canMoveDown}
                      className={`p-1 rounded ${
                        canMoveDown 
                          ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800' 
                          : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      }`}
                      title="Mover abajo"
                    >
                      {Icons.moveDown}
                    </button>
                  </div>

                  {/* Toggle expand */}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isExpanded ? Icons.expand : Icons.collapse}
                    </motion.div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de tareas (expandible) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 dark:border-gray-700"
            >
              <div className="p-4 pt-3 bg-gray-50/50 dark:bg-gray-800/25">
                {tasks.length > 0 ? (
                  <div className="space-y-2">
                    <Typography variant="caption" className="font-medium text-gray-700 dark:text-gray-300">
                      Tareas ({tasks.length})
                    </Typography>
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="text-gray-400">
                            {Icons.task}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Typography variant="caption" className="font-medium line-clamp-1">
                                {task.title}
                              </Typography>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {task.key}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          <StoryPointsBadge 
                            points={task.storyPoints} 
                            size="sm"
                            interactive
                            onPointsChange={(points) => onIssueUpdate(task.id, { storyPoints: points })}
                          />
                          
                          <select
                            value={task.status}
                            onChange={(e) => onIssueUpdate(task.id, { status: e.target.value as EntityStatus })}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="TODO">Por hacer</option>
                            <option value="IN_PROGRESS">En progreso</option>
                            <option value="IN_REVIEW">En revisión</option>
                            <option value="DONE">Completado</option>
                          </select>

                          <select
                            value={task.assigneeId || ''}
                            onChange={(e) => onIssueUpdate(task.id, { assigneeId: e.target.value || undefined })}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Sin asignar</option>
                            {Object.values(team).filter(member => member.active).map(member => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 text-center">
                    <Typography variant="caption" color="secondary">
                      No hay tareas asignadas
                    </Typography>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}
