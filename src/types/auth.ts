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
        role?: string
        timezone?: string
        capacityPerSprint?: number
        skills?: string[]
        active?: boolean
    }
    expires: string
}

export interface NextAuthSignInOptions {
    callbackUrl?: string
    redirect?: boolean
    email?: string
    [key: string]: unknown
}

// Extender los tipos de NextAuth
declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
            role?: string
            timezone?: string
            capacityPerSprint?: number
            skills?: string[]
            active?: boolean
        }
    }

    interface User {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string
        timezone?: string
        capacityPerSprint?: number
        skills?: string[]
        active?: boolean
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        userId?: string
        role?: string
        timezone?: string
        capacityPerSprint?: number
        skills?: string[]
        active?: boolean
    }
}
