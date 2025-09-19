'use client';

import { useState } from 'react';
import { TeamDashboard, TeamUtilizationHeatmap } from 'app/components/team';

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'heatmap'>('dashboard');

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas */}
      <div className="border-b border-border-light dark:border-border-dark">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'dashboard'
                ? 'border-primary text-primary'
                : 'border-transparent text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark hover:border-border-light dark:hover:border-border-dark'
            }`}
          >
            Vista de Equipo
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'heatmap'
                ? 'border-primary text-primary'
                : 'border-transparent text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark hover:border-border-light dark:hover:border-border-dark'
            }`}
          >
            Heatmap de Utilización
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="min-h-screen">
        {activeTab === 'dashboard' && <TeamDashboard />}
        {activeTab === 'heatmap' && <TeamUtilizationHeatmap />}
      </div>
    </div>
  );
}
