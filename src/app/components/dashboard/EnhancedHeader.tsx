'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { useDashboardStore } from '../../lib/store/dashboard-store';

interface Project {
  id: string;
  name: string;
  sprintIds: string[];
}

interface EnhancedHeaderProps {
  children?: ReactNode;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  activeProjectId: string;
  projects: Record<string, Project>;
}

// Iconos optimizados
const Icons = {
  menu: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  close: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  search: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  chevronDown: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  filter: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
    </svg>
  ),
  x: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

function ProjectSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const projects = useDashboardStore((state) => state.projects);
  const activeProjectId = useDashboardStore((state) => state.activeProjectId);
  const setProject = useDashboardStore((state) => state.setProject);
  const currentProject = projects[activeProjectId];
  const projectList = Object.values(projects);

  if (!currentProject) return null;

  // Crear display text más corto para ser consistente con otros filtros
  const maxLength = 18;
  const displayText = currentProject.name.length > maxLength 
    ? `${currentProject.code}: ${currentProject.name.slice(0, maxLength)}...`
    : `${currentProject.code}: ${currentProject.name}`;
  
  const isTextTruncated = currentProject.name.length > maxLength;

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setShowTooltip(isTextTruncated)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 h-9 text-left bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-secondary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent min-w-32 max-w-48"
        >
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate block">
              {displayText}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-[var(--color-text-secondary)] flex-shrink-0"
          >
            {Icons.chevronDown}
          </motion.div>
        </button>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-[9999] px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl border border-[var(--color-border)] max-w-sm whitespace-nowrap"
          >
            {currentProject.code}: {currentProject.name}
            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 border-t border-l border-[var(--color-border)]"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-full min-w-[320px] max-w-[480px] bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
            >
              <div className="py-2">
                {projectList.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setProject(project.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-xs text-left hover:bg-[var(--color-surface-secondary)] transition-colors flex items-center justify-between
                      ${project.id === activeProjectId 
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-r-2 border-[var(--color-primary)]' 
                        : 'text-[var(--color-text-primary)]'
                      }
                    `}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{project.code}: {project.name}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {project.sprintIds.length} sprints activos
                      </div>
                    </div>
                    {project.id === activeProjectId && (
                      <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full ml-3 flex-shrink-0"></div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchTerm = useDashboardStore((state) => state.filters.searchTerm);
  const setFilters = useDashboardStore((state) => state.setFilters);

  const handleSearchChange = (value: string) => {
    setFilters({ searchTerm: value });
  };

  return (
    <div className="relative">
      <motion.div
        className="flex items-center"
        initial={{ width: 36 }}
        animate={{ width: isExpanded ? 240 : 36 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="relative w-full">
          <motion.input
            type="text"
            placeholder="Buscar issues, epics..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => {
              if (!searchTerm) setIsExpanded(false);
            }}
            className={`
              w-full h-9 pl-9 pr-3 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md 
              focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent
              placeholder-[var(--color-text-secondary)]
              ${!isExpanded ? 'opacity-0 cursor-pointer' : 'opacity-100'}
            `}
            style={{ 
              background: isExpanded 
                ? 'var(--color-surface)' 
                : 'transparent' 
            }}
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center justify-center w-4 h-4"
          >
            {Icons.search}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InlineFilters() {
  const filters = useDashboardStore((state) => state.filters);
  const setFilters = useDashboardStore((state) => state.setFilters);
  const resetFilters = useDashboardStore((state) => state.resetFilters);
  const projects = useDashboardStore((state) => state.projects);
  const sprints = useDashboardStore((state) => state.sprints);
  const team = useDashboardStore((state) => state.team);
  const issues = useDashboardStore((state) => state.issues);

  const currentProject = projects[filters.projectId];
  const sprintOptions = currentProject?.sprintIds?.map(id => sprints[id]).filter(Boolean) || [];
  const teamOptions = Object.values(team).filter(member => member.active);
  
  // Contar issues que coinciden con filtros actuales
  const matchingIssues = Object.values(issues).filter(issue => {
    // Filtrar por proyecto usando la relación con sprints
    if (filters.projectId && issue.sprintId) {
      const issuesSprint = sprints[issue.sprintId];
      if (issuesSprint && issuesSprint.projectId !== filters.projectId) return false;
    }
    if (filters.sprintId && issue.sprintId !== filters.sprintId) return false;
    if (filters.assigneeId && issue.assigneeId !== filters.assigneeId) return false;
    if (filters.issueType !== 'ALL' && issue.type !== filters.issueType) return false;
    if (filters.searchTerm && !issue.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });

  const activeFiltersCount = [
    filters.sprintId,
    filters.assigneeId,
    filters.issueType !== 'ALL' ? filters.issueType : null,
    filters.searchTerm,
    ...filters.labels
  ].filter(Boolean).length;

  return (
    <>
      {/* Desktop Inline Filters */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Sprint */}
        <select
          value={filters.sprintId || ''}
          onChange={(e) => setFilters({ sprintId: e.target.value || undefined })}
          className="px-3 py-2 h-9 text-sm font-medium bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent min-w-24"
        >
          <option value="">Sprint</option>
          {sprintOptions.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name.slice(0, 15)}...
            </option>
          ))}
        </select>

        {/* Responsable */}
        <select
          value={filters.assigneeId || ''}
          onChange={(e) => setFilters({ assigneeId: e.target.value || undefined })}
          className="px-3 py-2 h-9 text-sm font-medium bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent min-w-28"
        >
          <option value="">Responsable</option>
          {teamOptions.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name.split(' ')[0]}
            </option>
          ))}
        </select>

        {/* Tipo */}
        <select
          value={filters.issueType}
          onChange={(e) => setFilters({ issueType: e.target.value as typeof filters.issueType })}
          className="px-3 py-2 h-9 text-sm font-medium bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent min-w-20"
        >
          <option value="ALL">Tipo</option>
          <option value="EPIC">Epic</option>
          <option value="STORY">Story</option>
          <option value="TASK">Task</option>
        </select>

        {/* Contador e información */}
        <div className="flex items-center gap-2 ml-3 pl-3 border-l border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              {matchingIssues.length} issues
            </span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-[var(--color-primary)] text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center w-7 h-7 text-xs bg-[var(--color-surface-secondary)] hover:bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-md transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              title="Limpiar filtros"
            >
              {Icons.x}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filters Panel */}
      <div className="lg:hidden">
        <div className="flex flex-col gap-3">
          {/* Sprint */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Sprint
            </label>
            <select
              value={filters.sprintId || ''}
              onChange={(e) => setFilters({ sprintId: e.target.value || undefined })}
              className="px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              <option value="">Todos</option>
              {sprintOptions.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>

          {/* Responsable */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Responsable
            </label>
            <select
              value={filters.assigneeId || ''}
              onChange={(e) => setFilters({ assigneeId: e.target.value || undefined })}
              className="px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              <option value="">Todos</option>
              {teamOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Tipo
            </label>
            <select
              value={filters.issueType}
              onChange={(e) => setFilters({ issueType: e.target.value as typeof filters.issueType })}
              className="px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              <option value="ALL">Todos</option>
              <option value="EPIC">Epic</option>
              <option value="STORY">Story</option>
              <option value="TASK">Task</option>
            </select>
          </div>

          {/* Información y acciones para mobile */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {matchingIssues.length} issues
              </span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-[var(--color-primary)] text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            
            {activeFiltersCount > 0 && (
              <Button
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--color-surface-secondary)] hover:bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-md transition-colors text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]"
              >
                <span className="text-[var(--color-text-secondary)]">{Icons.x}</span>
                <span className="text-[var(--color-text-primary)]">Limpiar</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function EnhancedHeader({
  mobileMenuOpen,
  onToggleMobileMenu
}: Omit<EnhancedHeaderProps, 'activeProjectId' | 'projects'>) {  

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      {/* Header Principal - Una sola fila en desktop */}
      <div className="px-4 py-3 lg:px-8 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Mobile Menu + Project Selector */}
          <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              size="sm"
              onClick={onToggleMobileMenu}
              className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-[var(--color-neutral)] transition-colors border-none shadow-none"
            >
              <span className="text-[var(--color-text-secondary)]">
                {mobileMenuOpen ? Icons.close : Icons.menu}
              </span>
            </Button>
          </div>

            {/* Project Selector - Más compacto en desktop */}
            <div className="min-w-0">
              <ProjectSelector />
            </div>
          </div>

          {/* Center Section - Filtros inline (solo desktop) */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            <InlineFilters />
          </div>

          {/* Right Section - Search */}
          <div className="flex items-center">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)]"
          >
            <div className="p-4">
              <InlineFilters />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
