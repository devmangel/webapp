'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AuthProviders } from './AuthProviders'
import { EmailForm } from './EmailForm'

interface SignupFormProps {
  callbackUrl?: string
  error?: string
}

export function SignupForm({ callbackUrl, error }: SignupFormProps) {
  const [showEmailForm, setShowEmailForm] = useState(false)

  const errorMessages: Record<string, string> = {
    OAuthSignin: 'Error iniciando sesión con el proveedor.',
    OAuthCallback: 'Error en el callback del proveedor.',
    OAuthCreateAccount: 'Error creando cuenta con el proveedor.',
    EmailCreateAccount: 'Error creando cuenta con email.',
    Callback: 'Error en el callback de autenticación.',
    OAuthAccountNotLinked: 'Esta cuenta ya existe con otro proveedor.',
    EmailSignin: 'Error enviando el enlace de registro.',
    CredentialsSignin: 'Credenciales inválidas.',
    SessionRequired: 'Sesión requerida para acceder.',
    default: 'Ocurrió un error inesperado. Intenta nuevamente.'
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-error-light border border-error/20 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-error mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-error-text">
              {errorMessages[error] || errorMessages.default}
            </p>
          </div>
        </div>
      )}

      {!showEmailForm ? (
        <>
          {/* OAuth Providers */}
          <AuthProviders callbackUrl={callbackUrl} />
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light dark:border-border-dark" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background-light dark:bg-background-dark text-textSecondary-light dark:text-textSecondary-dark">
                O regístrate con
              </span>
            </div>
          </div>

          {/* Email Option */}
          <button
            onClick={() => setShowEmailForm(true)}
            className="w-full flex items-center justify-center px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark hover:bg-neutral-light dark:hover:bg-neutral-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-3 text-textPrimary-light dark:text-textPrimary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-textPrimary-light dark:text-textPrimary-dark font-medium">
              Registrarse con email
            </span>
          </button>
        </>
      ) : (
        <>
          {/* Email Form */}
          <EmailForm callbackUrl={callbackUrl} />
          
          {/* Back Button */}
          <button
            onClick={() => setShowEmailForm(false)}
            className="w-full text-center text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors duration-200"
          >
            ← Volver a otras opciones
          </button>
        </>
      )}

      {/* Terms and Privacy */}
      <div className="text-xs text-textSecondary-light dark:text-textSecondary-dark text-center">
        Al registrarte, aceptas nuestros{' '}
        <Link
          href="/terminos"
          className="font-medium text-primary hover:text-secondary transition-colors duration-200"
        >
          Términos de Servicio
        </Link>{' '}
        y{' '}
        <Link
          href="/privacidad"
          className="font-medium text-primary hover:text-secondary transition-colors duration-200"
        >
          Política de Privacidad
        </Link>
        .
      </div>

      {/* Login Link */}
      <div className="text-center text-sm text-textSecondary-light dark:text-textSecondary-dark">
        ¿Ya tienes una cuenta?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-secondary transition-colors duration-200"
        >
          Inicia sesión aquí
        </Link>
      </div>
    </div>
  )
}
