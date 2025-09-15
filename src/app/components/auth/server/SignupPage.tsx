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
    title: 'Registro | MiApp',
    description: 'Crea tu cuenta en MiApp y únete a nuestra comunidad',
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
        title="Crea tu cuenta"
        subtitle="Únete a MiApp y empieza tu experiencia"
      >
        <SignupForm
          callbackUrl={callbackUrl}
          error={error}
        />
      </AuthCard>
    </AuthLayout>
  )
}
