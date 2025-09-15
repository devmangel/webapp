export interface AuthFormData {
  email: string
  callbackUrl?: string
}

export interface AuthError {
  message: string
  code?: string
}

export interface AuthProvider {
  id: 'google' | 'github' | 'facebook' | 'apple' | 'email'
  name: string
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  textColor: string
  hoverColor: string
}

export interface AuthPageProps {
  searchParams?: {
    callbackUrl?: string
    error?: string
  }
}
