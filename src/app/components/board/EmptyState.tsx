'use client';

import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Typography } from '../ui/Typography';
import { useDashboardStore } from '../../../modules/dashboard/state/dashboard-store';

const Icons = {
  project: (
    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  arrow: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
};

export function EmptyState() {
  const { projects, setProject } = useDashboardStore();
  const projectList = Object.values(projects);
  const hasProjects = projectList.length > 0;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-[var(--color-primary)]/10 rounded-full"
        >
          <span className="text-[var(--color-primary)]">
            {Icons.project}
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography variant="h4" className="text-[var(--color-text-primary)] font-bold mb-3">
            {hasProjects ? 'Selecciona un Proyecto' : 'No hay Proyectos'}
          </Typography>
          <Typography variant="body" className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            {hasProjects 
              ? 'Elige un proyecto para ver y gestionar sus issues en el tablero Kanban.'
              : 'Crea tu primer proyecto para comenzar a organizar el trabajo de tu equipo.'
            }
          </Typography>
        </motion.div>

        {/* Project List or Create Action */}
        {hasProjects ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            <div className="text-left">
              <Typography variant="h6" className="text-[var(--color-text-primary)] font-semibold mb-3">
                Proyectos Disponibles:
              </Typography>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {projectList.slice(0, 5).map((project) => (
                  <motion.button
                    key={project.id}
                    onClick={() => setProject(project.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-secondary)] hover:border-[var(--color-primary)] transition-all duration-200 text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-tertiary)] px-2 py-1 rounded">
                          {project.code}
                        </span>
                      </div>
                      <Typography variant="body" className="font-medium text-[var(--color-text-primary)] truncate">
                        {project.name}
                      </Typography>
                      {project.description && (
                        <Typography variant="caption" className="text-[var(--color-text-secondary)] line-clamp-1 mt-1">
                          {project.description}
                        </Typography>
                      )}
                    </div>
                    <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors ml-2">
                      {Icons.arrow}
                    </span>
                  </motion.button>
                ))}
              </div>
              
              {projectList.length > 5 && (
                <div className="mt-3 text-center">
                  <Typography variant="caption" className="text-[var(--color-text-secondary)]">
                    y {projectList.length - 5} proyectos más...
                  </Typography>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white border-none shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-200"
            >
              Crear Primer Proyecto
            </Button>
          </motion.div>
        )}

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 pt-6 border-t border-[var(--color-border)]"
        >
          <Typography variant="caption" className="text-[var(--color-text-secondary)]">
            💡 Tip: Usa el selector de proyectos en el header para cambiar entre proyectos
          </Typography>
        </motion.div>
      </motion.div>

      {/* Decorative Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--color-secondary)]/5 rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}
