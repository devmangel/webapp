'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Card, CardBody } from '../ui/Card';
import { TeamMemberCard } from './TeamMemberCard';
import { useDashboardStore } from 'app/lib/store/dashboard-store';
import { TeamMember, Issue } from 'types/domain';
import { formatPoints } from '../utils/format';

interface TeamDashboardProps {
  className?: string;
}

export function TeamDashboard({ className = '' }: TeamDashboardProps) {
  const projects = useDashboardStore((state) => state.projects);
  const team = useDashboardStore((state) => state.team);
  const issues = useDashboardStore((state) => state.issues);
  const filters = useDashboardStore((state) => state.filters);

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'utilization' | 'points'>('name');
  const [filterRole, setFilterRole] = useState<'ALL' | 'PM' | 'CONTRIBUTOR'>('ALL');

  const project = projects[filters.projectId];
  
  const activeMembers = useMemo(() => 
    Object.values(team).filter((member) => member.active), 
    [team]
  );


  const projectIssues = useMemo(() => {
    if (!project) return [] as Issue[];
    return project.issueIds
      .map((id) => issues[id])
      .filter((issue): issue is Issue => Boolean(issue));
  }, [project, issues]);

  // Calcular métricas por miembro
  const teamMetrics = useMemo(() => {
    return activeMembers.map((member) => {
      const memberIssues = projectIssues.filter(issue => issue.assigneeId === member.id);
      const totalPoints = memberIssues.reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0);
      
      // Corregir cálculo de utilización para casos edge
      let utilization: number;
      if (member.capacityPerSprint === 0) {
        utilization = totalPoints > 0 ? Infinity : 0;
      } else {
        utilization = totalPoints / member.capacityPerSprint;
      }
      
      return {
        member,
        totalPoints,
        utilization,
        totalIssues: memberIssues.length,
        memberIssues
      };
    });
  }, [activeMembers, projectIssues]);

  // Filtrar y ordenar miembros
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = teamMetrics;

    // Filtrar por rol
    if (filterRole !== 'ALL') {
      filtered = filtered.filter(m => m.member.role === filterRole);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'utilization':
          return b.utilization - a.utilization;
        case 'points':
          return b.totalPoints - a.totalPoints;
        case 'name':
        default:
          return a.member.name.localeCompare(b.member.name);
      }
    });

    return filtered;
  }, [teamMetrics, filterRole, sortBy]);

  // Métricas generales del equipo
  const overallMetrics = useMemo(() => {
    const totalCapacity = activeMembers.reduce((acc, member) => acc + member.capacityPerSprint, 0);
    const totalAssigned = teamMetrics.reduce((acc, m) => acc + m.totalPoints, 0);
    const avgUtilization = teamMetrics.length > 0 
      ? teamMetrics.reduce((acc, m) => acc + m.utilization, 0) / teamMetrics.length 
      : 0;
    
    const utilizationDistribution = {
      available: teamMetrics.filter(m => m.utilization < 0.7 && m.utilization !== Infinity).length,
      normal: teamMetrics.filter(m => m.utilization >= 0.7 && m.utilization < 0.9).length,
      high: teamMetrics.filter(m => m.utilization >= 0.9 && m.utilization < 1.2).length,
      overloaded: teamMetrics.filter(m => m.utilization >= 1.2 || m.utilization === Infinity).length,
    };

    return {
      totalCapacity,
      totalAssigned,
      avgUtilization,
      utilizationDistribution,
      totalMembers: activeMembers.length,
    };
  }, [activeMembers, teamMetrics]);

  const handleEditMember = (member: TeamMember) => {
    // TODO: Abrir modal de edición
    console.log('Editar miembro:', member.name);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con título y controles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
            Equipo de Proyecto
          </h1>
          <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
            Gestión de capacidades y utilización del equipo
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filtro por rol */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
            className="px-3 py-2 text-sm border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-neutral-900 text-textPrimary-light dark:text-textPrimary-dark focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ALL">Todos los roles</option>
            <option value="PM">Project Managers</option>
            <option value="CONTRIBUTOR">Contributors</option>
          </select>

          {/* Ordenar por */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 text-sm border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-neutral-900 text-textPrimary-light dark:text-textPrimary-dark focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="name">Nombre</option>
            <option value="utilization">Utilización</option>
            <option value="points">Story Points</option>
          </select>

          {/* Toggle vista */}
          <div className="flex border border-border-light dark:border-border-dark rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'cards'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-neutral-900 text-textSecondary-light dark:text-textSecondary-dark hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-neutral-900 text-textSecondary-light dark:text-textSecondary-dark hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              Tabla
            </button>
          </div>
        </div>
      </div>

      {/* Métricas generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wide">
                  Miembros Activos
                </p>
                <p className="mt-1 text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
                  {overallMetrics.totalMembers}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wide">
                  Capacidad Total
                </p>
                <p className="mt-1 text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
                  {formatPoints(overallMetrics.totalCapacity)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wide">
                  Points Asignados
                </p>
                <p className="mt-1 text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
                  {formatPoints(overallMetrics.totalAssigned)}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wide">
                  Utilización Promedio
                </p>
                <p className="mt-1 text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
                  {Math.round(overallMetrics.avgUtilization * 100)}%
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                overallMetrics.avgUtilization >= 0.9 
                  ? 'bg-red-500/10' 
                  : overallMetrics.avgUtilization >= 0.7 
                  ? 'bg-orange-500/10' 
                  : 'bg-emerald-500/10'
              }`}>
                <svg className={`w-5 h-5 ${
                  overallMetrics.avgUtilization >= 0.9 
                    ? 'text-red-600' 
                    : overallMetrics.avgUtilization >= 0.7 
                    ? 'text-orange-600' 
                    : 'text-emerald-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Distribución de carga */}
      <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-4">
            Distribución de Carga del Equipo
          </h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-emerald-600">
                  {overallMetrics.utilizationDistribution.available}
                </span>
              </div>
              <p className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">Disponible</p>
              <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">&lt; 70%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full mx-auto flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-amber-600">
                  {overallMetrics.utilizationDistribution.normal}
                </span>
              </div>
              <p className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">Normal</p>
              <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">70-89%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full mx-auto flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-orange-600">
                  {overallMetrics.utilizationDistribution.high}
                </span>
              </div>
              <p className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">Alta carga</p>
              <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">90-119%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full mx-auto flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-red-600">
                  {overallMetrics.utilizationDistribution.overloaded}
                </span>
              </div>
              <p className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">Sobrecargado</p>
              <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">≥ 120%</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lista de miembros */}
      {viewMode === 'cards' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedMembers.map((memberData) => (
            <TeamMemberCard
              key={memberData.member.id}
              member={memberData.member}
              assignedPoints={memberData.totalPoints}
              utilization={memberData.utilization}
              totalIssues={memberData.totalIssues}
              onEdit={handleEditMember}
            />
          ))}
        </div>
      ) : (
        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-border-light dark:divide-border-dark">
                <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider">
                      Miembro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider">
                      Capacidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider">
                      Asignado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider">
                      Utilización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider">
                      Issues
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-border-light dark:divide-border-dark">
                  {filteredAndSortedMembers.map((memberData) => (
                    <tr key={memberData.member.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {memberData.member.avatarUrl ? (
                              <Image
                                className="h-10 w-10 rounded-full"
                                src={memberData.member.avatarUrl}
                                alt={memberData.member.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {memberData.member.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">
                              {memberData.member.name}
                            </div>
                            <div className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                              {memberData.member.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {memberData.member.role === 'PM' ? 'PM' : 'Dev'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary-light dark:text-textPrimary-dark">
                        {formatPoints(memberData.member.capacityPerSprint)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary-light dark:text-textPrimary-dark">
                        {formatPoints(memberData.totalPoints)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className={`font-medium ${
                                memberData.utilization === Infinity || memberData.utilization >= 1.2 ? 'text-red-600' :
                                memberData.utilization >= 0.9 ? 'text-orange-600' :
                                memberData.utilization >= 0.7 ? 'text-amber-600' :
                                'text-emerald-600'
                              }`}>
                                {memberData.utilization === Infinity ? 'Sobrecargado' : `${Math.round(memberData.utilization * 100)}%`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  memberData.utilization === Infinity || memberData.utilization >= 1.2 ? 'bg-red-500' :
                                  memberData.utilization >= 0.9 ? 'bg-orange-500' :
                                  memberData.utilization >= 0.7 ? 'bg-amber-500' :
                                  'bg-emerald-500'
                                }`}
                                style={{ 
                                  width: memberData.utilization === Infinity 
                                    ? '100%' 
                                    : `${Math.min(memberData.utilization * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary-light dark:text-textPrimary-dark">
                        {memberData.totalIssues}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {filteredAndSortedMembers.length === 0 && (
        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-textSecondary-light dark:text-textSecondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-textPrimary-light dark:text-textPrimary-dark mb-2">
              No se encontraron miembros
            </h3>
            <p className="text-textSecondary-light dark:text-textSecondary-dark">
              Ajusta los filtros para ver más miembros del equipo
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
