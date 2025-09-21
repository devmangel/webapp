import React from 'react'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth/config'
import { AuthLayout } from '../shared/AuthLayout'
import { AuthCard } from '../shared/AuthCard'
import { LoginForm } from '../client/LoginForm'
import { AuthPageProps } from '../shared/types'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Iniciar Sesión | PAI Kanvás',
    description: 'Accede a tu cuenta de PAI Kanvás y gestiona tus proyectos de forma inteligente',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export async function LoginPage({ searchParams }: AuthPageProps) {
  // Redirect authenticated users
  const session = await getServerSession(authOptions)
  
  // Await searchParams for Next.js 15+
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  
  if (session?.user) {
    const callbackUrl = resolvedSearchParams?.callbackUrl || '/dashboard'
    redirect(callbackUrl)
  }

  const callbackUrl = resolvedSearchParams?.callbackUrl
  const error = resolvedSearchParams?.error

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
