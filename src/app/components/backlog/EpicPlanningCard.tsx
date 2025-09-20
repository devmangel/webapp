'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardBody } from 'components/ui/Card';
import { Typography } from 'components/ui/Typography';
import { Epic, Issue, TeamMember } from 'types/domain';
import { StoryRefinementCard } from './StoryRefinementCard';
import { PriorityIndicator } from './PriorityIndicator';
import { StoryPointsBadge } from './StoryPointsBadge';

interface EpicGroup {
  epic?: Epic;
  stories: Array<{
    story: Issue;
    tasks: Issue[];
  }>;
  orphanTasks: Issue[];
}

interface EpicPlanningCardProps {
  epicGroup: EpicGroup;
  team: Record<string, TeamMember>;
  onIssueUpdate: (issueId: string, updates: Partial<Issue>) => void;
  onStoryReorder: (storyId: string, direction: 'up' | 'down') => void;
}

const Icons = {
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
  epic: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  story: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

export function EpicPlanningCard({ 
  epicGroup, 
  team, 
  onIssueUpdate,
  onStoryReorder 
}: EpicPlanningCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { epic, stories, orphanTasks } = epicGroup;

  // Cálculos para métricas
  const totalStories = stories.length;  
  const totalStoryPoints = stories.reduce((sum, story) => {
    const storyPoints = story.story.storyPoints || 0;
    const taskPoints = story.tasks.reduce((taskSum, task) => taskSum + (task.storyPoints || 0), 0);
    return sum + storyPoints + taskPoints;
  }, 0) + orphanTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  const completedStoryPoints = stories.reduce((sum, story) => {
    if (story.story.status === 'DONE') {
      const storyPoints = story.story.storyPoints || 0;
      const taskPoints = story.tasks
        .filter(task => task.status === 'DONE')
        .reduce((taskSum, task) => taskSum + (task.storyPoints || 0), 0);
      return sum + storyPoints + taskPoints;
    }
    return sum + story.tasks
      .filter(task => task.status === 'DONE')
      .reduce((taskSum, task) => taskSum + (task.storyPoints || 0), 0);
  }, 0) + orphanTasks
    .filter(task => task.status === 'DONE')
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  const progressPercentage = totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;

  const epicTitle = epic?.name || 'Elementos sin épica';
  const epicObjective = epic?.objective || 'Items que no están asociados a ninguna épica específica';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" className="mb-4">
        <CardBody className="p-0">
          {/* Header de la épica */}
          <div 
            className="p-6 pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {/* Icono de épica */}
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  {Icons.epic}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Typography variant="h4" className="font-semibold">
                      {epicTitle}
                    </Typography>
                    {epic && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {epic.key}
                      </div>
                    )}
                  </div>
                  
                  <Typography variant="body" color="secondary" className="mb-3 line-clamp-2">
                    {epicObjective}
                  </Typography>

                  {/* Métricas de la épica */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {Icons.story}
                      <span className="text-gray-600 dark:text-gray-400">
                        {totalStories} historias
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <StoryPointsBadge points={totalStoryPoints} size="sm" />
                      <span className="text-gray-600 dark:text-gray-400">
                        story points
                      </span>
                    </div>

                    {totalStoryPoints > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {progressPercentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2 ml-4">
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isExpanded ? Icons.expand : Icons.collapse}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Lista de historias */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 space-y-3">
                  {stories.length > 0 ? (
                    stories.map((storyGroup, index) => (
                      <StoryRefinementCard
                        key={storyGroup.story.id}
                        story={storyGroup.story}
                        tasks={storyGroup.tasks}
                        team={team}
                        onIssueUpdate={onIssueUpdate}
                        onReorder={(direction) => onStoryReorder(storyGroup.story.id, direction)}
                        canMoveUp={index > 0}
                        canMoveDown={index < stories.length - 1}
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <Typography variant="body" color="secondary">
                        No hay historias en esta épica
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        Crea una nueva historia o asigna historias existentes
                      </Typography>
                    </div>
                  )}

                  {/* Tareas huérfanas */}
                  {orphanTasks.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-dashed border-gray-300 dark:border-gray-600">
                      <Typography variant="subtitle" className="mb-3 text-gray-700 dark:text-gray-300">
                        Tareas independientes
                      </Typography>
                      <div className="space-y-2">
                        {orphanTasks.map((task) => (
                          <div 
                            key={task.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <PriorityIndicator priority={task.priority} size="sm" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <Typography variant="body" className="font-medium">
                                    {task.title}
                                  </Typography>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {task.key}
                                  </span>
                                </div>
                                <Typography variant="caption" color="secondary" className="line-clamp-1">
                                  {task.summary}
                                </Typography>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <StoryPointsBadge 
                                points={task.storyPoints} 
                                size="sm"
                                interactive
                                onPointsChange={(points) => onIssueUpdate(task.id, { storyPoints: points })}
                              />
                              {task.assigneeId && team[task.assigneeId] && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {team[task.assigneeId].name}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardBody>
      </Card>
    </motion.div>
  );
}
