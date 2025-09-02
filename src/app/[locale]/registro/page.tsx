import React from "react"
import Link from "next/link"
import ThemeToggle from "../../components/ui/ThemeToggle"
import SignupClient from "./SignupClient"
import { redirectToDashboard } from "../../lib/auth"

export default async function SignUpPage() {
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
              Crear Cuenta
            </h1>
            <p className="mt-4 text-xl text-[var(--color-text-secondary)]">
              Únete a nuestra plataforma y comienza tu experiencia
            </p>
          </div>

          {/* Auth Card */}
          <div className="mt-12 text-center shadow-lg rounded-lg bg-[var(--color-neutral)] border border-[var(--color-border)]">
            <div className="px-4 py-5 sm:p-6">
              <SignupClient callbackUrl="/dashboard" />
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                href="/iniciar-session" 
                className="font-medium text-primary hover:text-secondary transition-colors duration-200"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
