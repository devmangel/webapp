"use client"

import React, { useState } from "react"
import Link from "next/link"
import { GoogleSignInButton, GitHubSignInButton, EmailSignInButton } from "../../components/auth/SignInButton"

interface LoginClientProps {
  callbackUrl?: string
}

export default function LoginClient({ callbackUrl = "/dashboard" }: LoginClientProps) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailToggle = () => {
    setShowEmailForm(!showEmailForm)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    
    setIsLoading(true)
    // EmailSignInButton manejará la redirección
  }

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      {/* OAuth Providers */}
      <div className="space-y-4">
        <GoogleSignInButton callbackUrl={callbackUrl} />
        <GitHubSignInButton callbackUrl={callbackUrl} />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[var(--color-neutral)] text-[var(--color-text-secondary)]">
            O continúa con
          </span>
        </div>
      </div>

      {/* Email Option */}
      <div className="space-y-4">
        {!showEmailForm ? (
          <button
            type="button"
            onClick={handleEmailToggle}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-[var(--color-border)] text-sm font-medium rounded-lg shadow-sm text-[var(--color-text-primary)] bg-[var(--color-neutral-light)] hover:bg-amber-50 dark:bg-[var(--color-neutral-dark)] dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-[var(--color-app-background)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Iniciar sesión con Email
          </button>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Dirección de email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg shadow-sm placeholder-[var(--color-text-secondary)] text-[var(--color-text-primary)] bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleEmailToggle}
                className="flex-1 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-neutral-light)] dark:hover:bg-[var(--color-neutral-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                disabled={isLoading}
              >
                Cancelar
              </button>
              {email.trim() && (
                <EmailSignInButton
                  email={email}
                  callbackUrl={callbackUrl}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    "Continuar"
                  )}
                </EmailSignInButton>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
