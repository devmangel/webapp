'use client';

import { memo, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface ProcessingPhase {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // segundos
  progress: number; // porcentaje final de esta fase
}

interface ProcessingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  backendCompleted?: boolean; // Nueva prop para indicar cuando el backend terminó
}

const ProcessingOverlay = memo(function ProcessingOverlay({
  isVisible,
  onComplete,
  backendCompleted = false
}: ProcessingOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Definir las fases del procesamiento usando useMemo para evitar recreación en cada render
  const phases = useMemo<ProcessingPhase[]>(() => [
    {
      id: 'analysis',
      label: 'Analizando especificación',
      description: 'La IA está leyendo y comprendiendo tu markdown',
      duration: 15,
      progress: 15,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'extraction',
      label: 'Extrayendo estructura',
      description: 'Identificando épicas, historias y tareas',
      duration: 25,
      progress: 25,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'project',
      label: 'Creando proyecto',
      description: 'Generando configuración inicial del proyecto',
      duration: 20,
      progress: 35,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 1v6" />
        </svg>
      )
    },
    {
      id: 'sprints',
      label: 'Generando sprints',
      description: 'Organizando trabajo en iteraciones secuenciales',
      duration: 20,
      progress: 50,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'epics',
      label: 'Procesando épicas',
      description: 'Creando objetivos y metas del proyecto',
      duration: 20,
      progress: 65,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      id: 'stories',
      label: 'Creando historias',
      description: 'Generando historias de usuario detalladas',
      duration: 15,
      progress: 80,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'tasks',
      label: 'Distribuyendo tareas',
      description: 'Asignando tareas y estimando esfuerzo',
      duration: 15,
      progress: 90,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'adjusting',
      label: 'Ajustando detalles finales',
      description: 'Aplicando las últimas configuraciones...',
      duration: Infinity, // Se mantiene hasta respuesta real del backend
      progress: 95,
      icon: (
        <svg className="h-8 w-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'finalize',
      label: 'Finalizando proyecto',
      description: 'Proyecto creado exitosamente',
      duration: 2,
      progress: 100,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
  ], []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect para manejar la respuesta del backend
  useEffect(() => {
    if (backendCompleted && phases[currentPhase]?.id === 'adjusting') {
      // El backend completó mientras estamos en la fase de ajuste
      setCurrentPhase(phases.length - 1); // Ir a la fase final
    }
  }, [backendCompleted, currentPhase, phases]);

  useEffect(() => {
    if (!isVisible) return;

    let timeElapsed = 0;

    const interval = setInterval(() => {
      const currentPhaseDuration = phases[currentPhase]?.duration || 0;        

      // Si estamos en una fase con duración infinita y el backend no ha completado
      if (currentPhaseDuration === Infinity && !backendCompleted) {
        const currentPhaseTarget = phases[currentPhase]?.progress || 0;
        setProgress(currentPhaseTarget); // Mantener el progreso fijo de esta fase
        return; // No incrementar el tiempo transcurrido ni cambiar fase
      }

      timeElapsed += 1;

      // Para fases con duración finita, calcular progreso normalmente
      if (currentPhaseDuration !== Infinity) {
        const phaseProgress = Math.min(timeElapsed / currentPhaseDuration, 1);
        const prevProgress = currentPhase > 0 ? phases[currentPhase - 1].progress : 0;
        const currentPhaseTarget = phases[currentPhase]?.progress || 0;
        const newProgress = prevProgress + (currentPhaseTarget - prevProgress) * phaseProgress;
        setProgress(newProgress);
      }

      // Cambiar a siguiente fase si es necesario
      // Solo avanzar si la duración no es infinita O si el backend completó
      const shouldAdvancePhase = timeElapsed >= currentPhaseDuration && 
                                currentPhase < phases.length - 1 && 
                                (currentPhaseDuration !== Infinity || backendCompleted);
      
      if (shouldAdvancePhase) {
        setCurrentPhase(prev => prev + 1);
        timeElapsed = 0; // Reset tiempo para la nueva fase
      }

      // Completar procesamiento (solo en la fase final)
      if (currentPhase === phases.length - 1 && timeElapsed >= currentPhaseDuration) {
        setProgress(100);
        setShowSuccess(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, currentPhase, phases, onComplete, backendCompleted]);

  if (!mounted || !isVisible) return null;

  const currentPhaseData = phases[currentPhase];
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background con glassmorphism - ajustado para ambos modos */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-lg dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20" />
      
      {/* Partículas animadas de fondo - visibles en ambos modos */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-blue-500/40 animate-pulse dark:bg-blue-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Glass card principal - mejorado para ambos modos */}
          <div className="rounded-3xl border border-gray-300/30 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-white/20 dark:bg-white/10">
            
            {/* Círculo de progreso SVG */}
            <div className="relative mx-auto mb-8 h-48 w-48">
              <svg className="h-48 w-48 -rotate-90 transform" viewBox="0 0 200 200">
                {/* Círculo de fondo */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-300 dark:text-white/20"
                />
                {/* Círculo de progreso */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                {/* Definir gradiente */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Contenido central del círculo */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="mb-2 text-gray-700 dark:text-white/80">
                  {currentPhaseData?.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Información de la fase actual */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {showSuccess ? '✅ ¡Proyecto creado exitosamente!' : currentPhaseData?.label}
              </h2>
              
              <p className="text-base text-gray-700 dark:text-white/80">
                {showSuccess 
                  ? 'Tu proyecto ha sido procesado y está listo para usar'
                  : currentPhaseData?.description
                }
              </p>

              {/* Indicador de fases */}
              <div className="flex justify-center space-x-2 pt-4">
                {phases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className={`h-2 w-8 rounded-full transition-all duration-500 ${
                      index < currentPhase
                        ? 'bg-green-500 dark:bg-green-400'
                        : index === currentPhase
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-gray-300 dark:bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Mensaje motivacional rotativo */}
            <div className="mt-6 text-sm text-gray-600 dark:text-white/60">
              {showSuccess 
                ? 'Redirigiendo a tu nuevo proyecto...'
                : currentPhaseData?.id === 'adjusting'
                ? 'Esperando respuesta del servidor... ⏳ Esto puede tomar unos minutos más'
                : 'Toma un café ☕ Esto puede tardar unos minutos'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Confetti para éxito */}
      {showSuccess && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '3s'
              }}
            >
              {['🎉', '✨', '🎊', '⭐'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
});

export default ProcessingOverlay;
