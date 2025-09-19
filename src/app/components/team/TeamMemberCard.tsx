'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardBody } from '../ui/Card';
import { TeamMember } from 'types/domain/dashboard';
import { formatPoints } from '../utils/format';

interface TeamMemberCardProps {
  member: TeamMember;
  assignedPoints: number;
  utilization: number;
  totalIssues: number;
  onEdit?: (member: TeamMember) => void;
  className?: string;
}

export function TeamMemberCard({
  member,
  assignedPoints,
  utilization,
  totalIssues,
  onEdit,
  className = '',
}: TeamMemberCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Corregir utilización para casos donde capacidad = 0 pero tiene work asignado
  const correctedUtilization = member.capacityPerSprint === 0 && assignedPoints > 0 
    ? Infinity 
    : utilization;

  const getUtilizationColor = (value: number, hasWork: boolean) => {
    // Caso especial: sin capacidad pero con trabajo asignado = sobrecargado crítico
    if (value === Infinity || (member.capacityPerSprint === 0 && hasWork)) {
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
    }
    if (value >= 1.2) return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
    if (value >= 0.9) return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
    if (value >= 0.7) return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
    return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
  };

  const getUtilizationStatus = (value: number, hasWork: boolean) => {
    // Caso especial: sin capacidad pero con trabajo asignado
    if (value === Infinity || (member.capacityPerSprint === 0 && hasWork)) {
      return 'Sobrecargado';
    }
    if (value >= 1.2) return 'Sobrecargado';
    if (value >= 0.9) return 'Alta carga';
    if (value >= 0.7) return 'Carga normal';
    return 'Disponible';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PM':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'CONTRIBUTOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Card
      className={`relative overflow-hidden border-border-light/70 bg-white/95 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 dark:border-border-dark/60 dark:bg-neutral-900/70 ${
        isHovered ? 'scale-[1.02]' : 'scale-100'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardBody className="p-6">
        {/* Header con avatar y info básica */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-12 h-12 rounded-full border-2 border-primary/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-lg font-semibold text-primary">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
              {member.active && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-neutral-900"></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark truncate">
                {member.name}
              </h3>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark truncate">
                {member.title}
              </p>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(member.role)}`}>
                {member.role === 'PM' ? 'Project Manager' : 'Contributor'}
              </div>
            </div>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(member)}
              className="p-2 text-textSecondary-light hover:text-textPrimary-light dark:text-textSecondary-dark dark:hover:text-textPrimary-dark rounded-lg hover:bg-primary/10 transition-colors"
              aria-label="Editar miembro"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {formatPoints(assignedPoints)}
            </p>
            <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
              Story Points
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {totalIssues}
            </p>
            <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
              Issues asignados
            </p>
          </div>
        </div>

        {/* Capacidad y utilización */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark">
                Capacidad por sprint
              </span>
              <span className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                {formatPoints(member.capacityPerSprint)}
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark">
                Utilización
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${getUtilizationColor(correctedUtilization, assignedPoints > 0)}`}>
                {member.capacityPerSprint === 0 && assignedPoints > 0 ? '∞' : Math.round(correctedUtilization * 100)}% • {getUtilizationStatus(correctedUtilization, assignedPoints > 0)}
              </span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  correctedUtilization === Infinity || (member.capacityPerSprint === 0 && assignedPoints > 0)
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : correctedUtilization >= 1.2 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : correctedUtilization >= 0.9
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                    : correctedUtilization >= 0.7
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}
                style={{ 
                  width: correctedUtilization === Infinity || (member.capacityPerSprint === 0 && assignedPoints > 0)
                    ? '100%'
                    : `${Math.min(correctedUtilization * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        {member.skills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark mb-2">
              Habilidades
            </p>
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-textSecondary-light dark:text-textSecondary-dark text-xs rounded-full">
                  +{member.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Timezone info */}
        <div className="mt-4 pt-3 border-t border-border-light/50 dark:border-border-dark/50">
          <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
            <span className="font-medium">Zona horaria:</span> {member.timezone}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
