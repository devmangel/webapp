'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '../app/lib/store/dashboard-store';

/**
 * Hook que maneja la inicialización automática del dashboard store
 * Carga los datos iniciales desde la API cuando el componente se monta
 */
export function useDashboardInit() {
  const loadInitialState = useDashboardStore((state) => state.loadInitialState);
  const isHydrated = useDashboardStore((state) => state.isHydrated);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const loadError = useDashboardStore((state) => state.loadError);

  useEffect(() => {
    // Solo cargar si no está hidratado y no está cargando ya
    if (!isHydrated && !isLoading) {
      loadInitialState();
    }
  }, [isHydrated, isLoading, loadInitialState]);

  return {
    isHydrated,
    isLoading,
    loadError,
  };
}
