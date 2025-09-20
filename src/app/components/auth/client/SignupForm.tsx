'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { AuthProviders } from './AuthProviders'
import { EmailForm } from './EmailForm'

interface SignupFormProps {
  callbackUrl?: string
  error?: string
}

// Error Icon Component
const ErrorIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const EmailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-700/50 rounded-xl"
          >
            <div className="flex items-center">
              <ErrorIcon className="w-5 h-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                {errorMessages[error] || errorMessages.default}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showEmailForm ? (
          <motion.div
            key="providers"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* OAuth Providers */}
            <AuthProviders callbackUrl={callbackUrl} />
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 font-medium">
                  O regístrate con
                </span>
              </div>
            </div>

            {/* Email Option */}
            <motion.button
              onClick={() => setShowEmailForm(true)}
              className="
                w-full flex items-center justify-center px-4 py-3 
                border border-gray-200 dark:border-gray-600 rounded-xl
                bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
                hover:bg-gray-50 dark:hover:bg-gray-700/50
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                group
              "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <EmailIcon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400 group-hover:text-amber-500 transition-colors" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Registrarse con email
              </span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="email-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Email Form */}
            <EmailForm callbackUrl={callbackUrl} />
            
            {/* Back Button */}
            <motion.button
              onClick={() => setShowEmailForm(false)}
              className="
                w-full text-center text-gray-500 dark:text-gray-400
                hover:text-amber-600 dark:hover:text-amber-400
                transition-colors duration-200 font-medium
                flex items-center justify-center
              "
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a otras opciones
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms and Privacy */}
      <motion.div
        className="text-xs text-center leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-200/30 dark:border-amber-700/30">
          <p className="text-gray-600 dark:text-gray-400">
            Al registrarte en <span className="font-semibold text-amber-600 dark:text-amber-400">PAI Kanvás</span>, aceptas nuestros{' '}
            <Link
              href="/terminos"
              className="font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors duration-200 underline underline-offset-2"
            >
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link
              href="/privacidad"
              className="font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors duration-200 underline underline-offset-2"
            >
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </motion.div>

      {/* Login Link */}
      <motion.div
        className="text-center text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <span className="text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta en PAI Kanvás?{' '}
        </span>
        <Link
          href="/login"
          className="font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors duration-200"
        >
          Inicia sesión aquí
        </Link>
      </motion.div>
    </motion.div>
  )
}
