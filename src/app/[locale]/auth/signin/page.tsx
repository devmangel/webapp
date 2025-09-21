import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth/config'
import SigninPage from 'components/auth/server/SigninPage'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}

export default async function AuthSigninPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { callbackUrl, error } = await searchParams
  
  // Si ya está autenticado, redirigir
  const session = await getServerSession(authOptions)
  if (session) {
    redirect(callbackUrl || '/dashboard')
  }

  return (
    <SigninPage 
      locale={locale}
      callbackUrl={callbackUrl}
      error={error}
    />
  )
}
