import React from 'react'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentSession } from '../../../lib/auth/server'
import { AuthLayout } from '../shared/AuthLayout'
import { AuthCard } from '../shared/AuthCard'
import { SignupForm } from '../client/SignupForm'
import { AuthPageProps } from '../shared/types'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Registro | PAI Kanvás',
    description: 'Crea tu cuenta en PAI Kanvás y transforma la gestión de tus proyectos',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export async function SignupPage({ searchParams }: AuthPageProps) {
  // Redirect authenticated users
  const session = await getCurrentSession()
  
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
        title="Únete a PAI Kanvás"
        subtitle="Crea tu cuenta y descubre el poder de la gestión inteligente"
      >
        <SignupForm
          callbackUrl={callbackUrl}
          error={error}
        />
      </AuthCard>
    </AuthLayout>
  )
}
