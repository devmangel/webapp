'use client'

import React from 'react'
import { AuthLayout } from '../../components/auth/shared/AuthLayout'
import { AuthCard } from '../../components/auth/shared/AuthCard'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LoginError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Login page error:', error)
  }, [error])

  return (
    <AuthLayout>
      <AuthCard
        title="Error de autenticación"
        subtitle="Ocurrió un problema al cargar la página de inicio de sesión"
      >
        <div className="space-y-6">
          {/* Error Icon and Message */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error-light mb-4">
              <svg className="h-8 w-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-textSecondary-light dark:text-textSecondary-dark mb-6">
              No pudimos cargar la página de inicio de sesión correctamente. 
              Por favor, intenta nuevamente.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center px-4 py-3 bg-primary hover:bg-secondary text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Intentar nuevamente
            </button>

            <a
              href="/"
              className="w-full flex items-center justify-center px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark hover:bg-neutral-light dark:hover:bg-neutral-dark text-textPrimary-light dark:text-textPrimary-dark font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ir al inicio
            </a>

            <a
              href="/signup"
              className="w-full text-center text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors duration-200"
            >
              ¿No tienes cuenta? Regístrate aquí
            </a>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
