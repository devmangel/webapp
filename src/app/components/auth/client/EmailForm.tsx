'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { signInAction } from '../../../lib/auth/server'

interface EmailFormProps {
  callbackUrl?: string
}

// Custom SVG Icons
const EmailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <motion.path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 13l4 4L19 7"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    />
  </svg>
)

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

export function EmailForm({ callbackUrl }: EmailFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido')
      setIsLoading(false)
      return
    }

    try {
      await signInAction('email', { email, callbackUrl })
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error sending magic link:', error)
      setError('Error enviando el enlace. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isSubmitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Success Card */}
          <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
            {/* Success Icon */}
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                ¡Revisa tu email!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Te hemos enviado un enlace mágico a <br />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{email}</span><br />
                Haz clic en el enlace para acceder.
              </p>

              {/* Back Button */}
              <motion.button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
                className="inline-flex items-center text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors"
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Intentar con otro email
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Dirección de email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <EmailIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@ejemplo.com"
                className="
                  w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600
                  rounded-xl bg-white/50 dark:bg-gray-800/50
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                  transition-all duration-200
                  backdrop-blur-sm
                "
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 dark:text-red-400 text-sm font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || !email}
            className="
              w-full flex items-center justify-center px-4 py-3
              bg-gradient-to-r from-amber-400 to-amber-600
              hover:from-amber-500 hover:to-amber-700
              text-white font-semibold rounded-xl
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-[1.02] active:scale-[0.98]
              shadow-lg hover:shadow-xl
            "
            whileHover={{ scale: !isLoading && email ? 1.02 : 1 }}
            whileTap={{ scale: !isLoading && email ? 0.98 : 1 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  Enviando enlace...
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <EmailIcon className="w-5 h-5 mr-2" />
                  Enviar enlace mágico
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
