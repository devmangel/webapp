// Tipos TypeScript para la autenticación
export type AuthProvider = 'google' | 'facebook' | 'apple' | 'github' | 'email'

export interface SignInOptions {
    provider: AuthProvider
    email?: string
    callbackUrl?: string
    redirect?: boolean
}

export interface AuthResponse {
    success: boolean
    error?: string
    url?: string
}

export interface UserSession {
    user?: {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
    }
    expires: string
}

export interface NextAuthSignInOptions {
    callbackUrl?: string
    redirect?: boolean
    email?: string
    [key: string]: unknown
}