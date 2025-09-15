import React from 'react'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentSession } from '../../../lib/auth/server'
import { AuthLayout } from '../shared/AuthLayout'
import { AuthCard } from '../shared/AuthCard'
import { LoginForm } from '../client/LoginForm'
import { AuthPageProps } from '../shared/types'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Iniciar Sesión | MiApp',
    description: 'Inicia sesión en tu cuenta de MiApp',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export async function LoginPage({ searchParams }: AuthPageProps) {
  // Redirect authenticated users
  const session = await getCurrentSession()
  if (session?.user) {
    const callbackUrl = searchParams?.callbackUrl || '/dashboard'
    redirect(callbackUrl)
  }

  const callbackUrl = searchParams?.callbackUrl
  const error = searchParams?.error

  return (
    <AuthLayout>
      <AuthCard
        title="Bienvenido de nuevo"
        subtitle="Inicia sesión en tu cuenta para continuar"
      >
        <LoginForm
          callbackUrl={callbackUrl}
          error={error}
        />
      </AuthCard>
    </AuthLayout>
  )
}
