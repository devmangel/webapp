import React from "react"
import ThemeToggle from "../../components/ui/ThemeToggle"
import LoginClient from "./loginClient"
import { redirectToDashboard } from "../../lib/auth"

export default async function SignInPage() {
  // Si el usuario ya está autenticado, lo enviamos al dashboard
  await redirectToDashboard()

  return (
    <div className="min-h-screen bg-[var(--color-app-background)]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Theme Toggle */}
          <div className="flex justify-end mb-6">
            <ThemeToggle />
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-[var(--color-app-foreground)] sm:text-5xl">
              Iniciar Sesión
            </h1>
            <p className="mt-4 text-xl text-[var(--color-text-secondary)]">
              Elige tu método de autenticación preferido
            </p>
          </div>

          {/* Auth Card */}
          <div className="mt-12 text-center shadow-lg rounded-lg bg-[var(--color-neutral)] border border-[var(--color-border)]">
            <div className="px-4 py-5 sm:p-6">
              <LoginClient callbackUrl="/dashboard" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
