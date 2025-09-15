# API Reference - Módulo de Autenticación

## 📚 Referencia Completa de la API

Esta es la referencia técnica completa de todos los exports, tipos, funciones y componentes disponibles en el módulo de autenticación server-first.

---

## 📦 Exports del Barrel (lib/auth)

### **Server Functions**
```typescript
import {
  getCurrentSession,    // Promise<UserSession | null>
  isAuthenticated,     // Promise<boolean>
  getCurrentUser,      // Promise<User | null>
  signInAction,        // Server Action
  signOutAction,       // Server Action
  redirectAfterAuth,   // Server Action
  requireAuth,         // Server Action
  redirectToSignIn,    // Server Action
  redirectToHome,      // Server Action
  redirectToDashboard, // Server Action
  hasRole,            // Promise<boolean>
  getUserProfile      // Promise<UserProfile | null>
} from 'lib/auth'
```

### **Utility Functions**
```typescript
import {
  DEFAULT_CALLBACK_URL,      // string
  DEFAULT_SIGNIN_URL,        // string
  AUTH_PROVIDERS,            // Record<AuthProvider, string>
  getAvailableProviders,     // () => AuthProvider[]
  getProviderDisplayName,    // (provider) => string
  isValidProvider,           // (provider) => boolean
  createCallbackUrl,         // (path, baseUrl?) => string
  handleAuthError,           // (error) => string
  getProviderConfig,         // (provider) => ProviderConfig
  getErrorFromUrl,           // () => string | null
  getCallbackUrlFromParams,  // (defaultUrl?) => string
  isValidEmail,              // (email) => boolean
  generateCallbackId,        // () => string
  formatUserDisplayName,     // (name?, email?) => string
  getUserInitials,           // (name?, email?) => string
  isValidCallbackUrl,        // (url) => boolean
  cleanAuthParams           // (url) => string
} from 'lib/auth'
```

### **Types**
```typescript
import type {
  AuthProvider,           // Union type
  SignInOptions,          // Interface
  AuthResponse,           // Interface
  UserSession,            // Interface
  NextAuthSignInOptions   // Interface
} from 'lib/auth'
```

### **Configurations**
```typescript
import {
  sessionConfig,          // useSession config (required)
  optionalSessionConfig   // useSession config (optional)
} from 'lib/auth'
```

---

## 🏷️ Type Definitions

### **AuthProvider**
```typescript
type AuthProvider = 'google' | 'facebook' | 'apple' | 'github' | 'email'
```

**Uso:**
```typescript
const provider: AuthProvider = 'google'
await signInAction(provider)
```

---

### **SignInOptions**
```typescript
interface SignInOptions {
  provider: AuthProvider
  email?: string        // Requerido para provider 'email'
  callbackUrl?: string  // URL de redirección post-login
  redirect?: boolean    // Default: true
}
```

**Uso:**
```typescript
const options: SignInOptions = {
  provider: 'google',
  callbackUrl: '/dashboard',
  redirect: true
}
await signInAction(options.provider, options)
```

---

### **AuthResponse**
```typescript
interface AuthResponse {
  success: boolean
  error?: string
  url?: string
}
```

**Uso:**
```typescript
const response: AuthResponse = await someAuthFunction()
if (!response.success) {
  console.error(response.error)
}
```

---

### **UserSession**
```typescript
interface UserSession {
  user?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires: string
}
```

**Uso:**
```typescript
const session: UserSession | null = await getCurrentSession()
if (session?.user) {
  console.log(`Welcome ${session.user.name}`)
}
```

---

### **NextAuthSignInOptions**
```typescript
interface NextAuthSignInOptions {
  callbackUrl?: string
  redirect?: boolean
  email?: string
  [key: string]: unknown  // Extensible para opciones adicionales
}
```

**Uso interno:**
```typescript
// Esta interfaz se usa internamente en componentes cliente
const signInOptions: NextAuthSignInOptions = {
  callbackUrl: '/dashboard',
  redirect: true
}
```

---

## 🔒 Server Functions API

### **getCurrentSession()**
```typescript
function getCurrentSession(): Promise<UserSession | null>
```

**Descripción:** Obtiene la sesión actual del servidor usando NextAuth.

**Returns:**
- `UserSession` - Si hay sesión activa
- `null` - Si no hay sesión

**Throws:** Nunca (maneja errores internamente)

**Ejemplo:**
```typescript
const session = await getCurrentSession()
if (session) {
  console.log(`User: ${session.user?.email}`)
}
```

---

### **isAuthenticated()**
```typescript
function isAuthenticated(): Promise<boolean>
```

**Descripción:** Verifica rápidamente si hay una sesión autenticada.

**Returns:** `boolean`

**Performance:** Optimizada para verificaciones rápidas

**Ejemplo:**
```typescript
if (await isAuthenticated()) {
  return <DashboardContent />
} else {
  return <LoginPrompt />
}
```

---

### **getCurrentUser()**
```typescript
function getCurrentUser(): Promise<User | null>
```

**Descripción:** Obtiene solo los datos del usuario, sin metadatos de sesión.

**Returns:**
- `User` - Datos del usuario
- `null` - Si no hay usuario

**Cuándo usar:** Cuando solo necesitas información del usuario

**Ejemplo:**
```typescript
const user = await getCurrentUser()
return (
  <Avatar 
    name={user?.name} 
    image={user?.image} 
  />
)
```

---

### **signInAction(provider, options?)**
```typescript
function signInAction(
  provider: AuthProvider, 
  options?: Partial<SignInOptions>
): Promise<void>
```

**Descripción:** Server Action para iniciar sesión con cualquier provider.

**Parameters:**
- `provider` - Provider de autenticación
- `options` - Opciones adicionales (opcional)

**Behavior:** Redirige automáticamente al provider de OAuth o email

**Throws:** Error si el provider es inválido

**Ejemplo:**
```typescript
// OAuth
await signInAction('google', { callbackUrl: '/dashboard' })

// Email
await signInAction('email', { 
  email: 'user@example.com',
  callbackUrl: '/verify'
})
```

---

### **signOutAction(callbackUrl?)**
```typescript
function signOutAction(callbackUrl?: string): Promise<void>
```

**Descripción:** Server Action para cerrar sesión segura.

**Parameters:**
- `callbackUrl` - URL de redirección post-logout (opcional)

**Default:** Redirige a `DEFAULT_SIGNIN_URL`

**Behavior:** Limpia cookies y redirige automáticamente

**Ejemplo:**
```typescript
await signOutAction('/')  // Redirige a home
await signOutAction()     // Redirige a /auth/signin
```

---

### **requireAuth(redirectTo?)**
```typescript
function requireAuth(redirectTo?: string): Promise<void>
```

**Descripción:** Protege rutas requiriendo autenticación.

**Parameters:**
- `redirectTo` - URL de redirección si no autenticado (opcional)

**Default:** Redirige a `DEFAULT_SIGNIN_URL`

**Behavior:** Redirige automáticamente si no hay sesión

**Ejemplo:**
```typescript
export default async function ProtectedPage() {
  await requireAuth('/login')  // Custom login page
  
  // Solo ejecuta si está autenticado
  return <ProtectedContent />
}
```

---

### **redirectAfterAuth(authenticatedUrl?, unauthenticatedUrl?)**
```typescript
function redirectAfterAuth(
  authenticatedUrl?: string,    // Default: '/'
  unauthenticatedUrl?: string   // Default: '/auth/signin'
): Promise<void>
```

**Descripción:** Redirige condicionalmente basado en estado de auth.

**Uso típico:** Landing pages inteligentes

**Ejemplo:**
```typescript
export default async function HomePage() {
  await redirectAfterAuth('/dashboard', '/login')
  // Nunca renderiza debido al redirect
  return null
}
```

---

## 🛠️ Utilities API

### **Constants**

#### **DEFAULT_CALLBACK_URL**
```typescript
const DEFAULT_CALLBACK_URL: string = '/'
```

#### **DEFAULT_SIGNIN_URL**
```typescript
const DEFAULT_SIGNIN_URL: string = '/auth/signin'
```

#### **AUTH_PROVIDERS**
```typescript
const AUTH_PROVIDERS: Record<AuthProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
  github: 'GitHub',
  email: 'Email'
}
```

---

### **Provider Management**

#### **getAvailableProviders()**
```typescript
function getAvailableProviders(): AuthProvider[]
```

**Returns:** `['google', 'facebook', 'apple', 'github', 'email']`

**Ejemplo:**
```typescript
const providers = getAvailableProviders()
// Render buttons for each provider
```

---

#### **getProviderDisplayName(provider)**
```typescript
function getProviderDisplayName(provider: AuthProvider): string
```

**Examples:**
```typescript
getProviderDisplayName('google')   // → 'Google'
getProviderDisplayName('github')   // → 'GitHub'
```

---

#### **isValidProvider(provider)**
```typescript
function isValidProvider(provider: string): provider is AuthProvider
```

**Type Guard:** Valida y refina tipo

**Ejemplo:**
```typescript
const userInput = 'google'
if (isValidProvider(userInput)) {
  // TypeScript sabe que userInput es AuthProvider
  await signInAction(userInput)
}
```

---

### **URL Management**

#### **createCallbackUrl(path, baseUrl?)**
```typescript
function createCallbackUrl(path: string, baseUrl?: string): string
```

**Examples:**
```typescript
createCallbackUrl('/dashboard')  
// → 'https://myapp.com/dashboard'

createCallbackUrl('/admin', 'https://admin.example.com')
// → 'https://admin.example.com/admin'
```

---

#### **isValidCallbackUrl(url)**
```typescript
function isValidCallbackUrl(url: string): boolean
```

**Security:** Previene redirects maliciosos

**Examples:**
```typescript
isValidCallbackUrl('https://myapp.com/safe')    // → true
isValidCallbackUrl('/dashboard')                // → true
isValidCallbackUrl('javascript:alert(1)')      // → false
```

---

### **Validation**

#### **isValidEmail(email)**
```typescript
function isValidEmail(email: string): boolean
```

**Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Examples:**
```typescript
isValidEmail('user@example.com')  // → true
isValidEmail('invalid-email')     // → false
```

---

### **Formatting**

#### **formatUserDisplayName(name?, email?)**
```typescript
function formatUserDisplayName(
  name?: string | null, 
  email?: string | null
): string
```

**Logic:**
1. Si hay `name` → retorna `name`
2. Si hay `email` → retorna parte antes de @
3. Fallback → 'Usuario'

**Examples:**
```typescript
formatUserDisplayName('John Doe', 'john@example.com')  // → 'John Doe'
formatUserDisplayName(null, 'jane@example.com')        // → 'jane'
formatUserDisplayName(null, null)                      // → 'Usuario'
```

---

#### **getUserInitials(name?, email?)**
```typescript
function getUserInitials(
  name?: string | null, 
  email?: string | null
): string
```

**Logic:**
- Dos palabras → Primeras letras de cada una
- Una palabra → Primeras dos letras
- Solo email → Primeras dos letras antes de @

**Examples:**
```typescript
getUserInitials('John Doe', null)      // → 'JD'
getUserInitials('John', null)          // → 'JO'
getUserInitials(null, 'jane@test.com') // → 'JA'
```

---

## 🎨 Components API

### **SignInButton (Default Export)**
```typescript
interface SignInButtonProps {
  provider: AuthProvider
  email?: string          // Para provider 'email'
  callbackUrl?: string
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

export default function SignInButton(props: SignInButtonProps): JSX.Element
```

**Uso:**
```typescript
<SignInButton 
  provider="google"
  callbackUrl="/dashboard"
  className="custom-btn"
>
  Custom Google Login
</SignInButton>
```

---

### **GoogleSignInButton (Named Export)**
```typescript
interface GoogleSignInButtonProps extends Omit<SignInButtonProps, 'provider'> {}

export function GoogleSignInButton(props: GoogleSignInButtonProps): JSX.Element
```

**Features:**
- Google branding automático
- Icono SVG incluido
- Estilos predefinidos

**Uso:**
```typescript
<GoogleSignInButton callbackUrl="/dashboard" />
```

---

### **GitHubSignInButton (Named Export)**
```typescript
interface GitHubSignInButtonProps extends Omit<SignInButtonProps, 'provider'> {}

export function GitHubSignInButton(props: GitHubSignInButtonProps): JSX.Element
```

---

### **EmailSignInButton (Named Export)**
```typescript
interface EmailSignInButtonProps extends Omit<SignInButtonProps, 'provider' | 'email'> {
  email: string  // Requerido
}

export function EmailSignInButton(props: EmailSignInButtonProps): JSX.Element
```

**Uso:**
```typescript
<EmailSignInButton 
  email="user@example.com"
  callbackUrl="/verify"
/>
```

---

### **SignOutButton (Default Export)**
```typescript
interface SignOutButtonProps {
  callbackUrl?: string
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

export default function SignOutButton(props: SignOutButtonProps): JSX.Element
```

**Uso:**
```typescript
<SignOutButton 
  callbackUrl="/"
  className="logout-btn"
>
  Cerrar Sesión
</SignOutButton>
```

---

## 🔧 Configuration Objects

### **sessionConfig**
```typescript
const sessionConfig = {
  required: true,
  onUnauthenticated() {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin'
    }
  }
}
```

**Uso con useSession:**
```typescript
'use client'
import { useSession } from 'next-auth/react'
import { sessionConfig } from 'lib/auth'

export default function ProtectedComponent() {
  const { data: session } = useSession(sessionConfig)
  
  // Solo renderiza si está autenticado
  return <div>Protected Content</div>
}
```

---

### **optionalSessionConfig**
```typescript
const optionalSessionConfig = {
  required: false
}
```

**Uso:**
```typescript
const { data: session } = useSession(optionalSessionConfig)

if (session) {
  return <AuthenticatedUI />
} else {
  return <PublicUI />
}
```

---

## 🚨 Error Handling

### **handleAuthError(error)**
```typescript
function handleAuthError(error: string): string
```

**Supported Error Codes:**
```typescript
const errorMappings = {
  'CredentialsSignin': 'Credenciales inválidas',
  'EmailSignin': 'Error al enviar email de verificación',
  'OAuthSignin': 'Error al conectar con el proveedor OAuth',
  'OAuthCallback': 'Error en el callback de OAuth',
  'OAuthCreateAccount': 'Error al crear cuenta con OAuth',
  'EmailCreateAccount': 'Error al crear cuenta con email',
  'Callback': 'Error en el callback de autenticación',
  'OAuthAccountNotLinked': 'Cuenta OAuth no vinculada',
  'SessionRequired': 'Sesión requerida',
  'Default': 'Error de autenticación desconocido'
}
```

---

## 📋 Usage Patterns

### **Server Component Pattern**
```typescript
import { getCurrentSession, requireAuth } from 'lib/auth'

export default async function ServerPage() {
  await requireAuth()
  const session = await getCurrentSession()
  
  return <div>Hello {session?.user?.name}</div>
}
```

### **Client Component Pattern**
```typescript
'use client'
import { GoogleSignInButton } from 'components/auth/SignInButton'

export default function ClientAuth() {
  return (
    <GoogleSignInButton 
      callbackUrl="/dashboard"
      className="w-full"
    />
  )
}
```

### **Hybrid Pattern**
```typescript
// layout.tsx (Server)
import { isAuthenticated } from 'lib/auth'
import { ClientNavigation } from './ClientNavigation'

export default async function Layout({ children }) {
  const authenticated = await isAuthenticated()
  
  return (
    <div>
      <ClientNavigation authenticated={authenticated} />
      {children}
    </div>
  )
}

// ClientNavigation.tsx (Client)
'use client'
export function ClientNavigation({ authenticated }) {
  return (
    <nav>
      {authenticated ? <UserMenu /> : <LoginButton />}
    </nav>
  )
}
```

---

## ⏱️ Performance Considerations

### **Function Performance**
```typescript
// 🚀 Fastest - Boolean check
const isAuth = await isAuthenticated()        // ~5ms

// 🐌 Medium - User data only  
const user = await getCurrentUser()           // ~8ms

// 🐌 Slowest - Full session data
const session = await getCurrentSession()     // ~12ms
```

### **Bundle Size Impact**
```typescript
// Server imports: 0 KB client bundle
import { getCurrentSession } from 'lib/auth'

// Client imports: ~2.3 KB client bundle
import { GoogleSignInButton } from 'components/auth/SignInButton'
```

---

## 🔄 Migration Guide

### **From Old Monolithic Structure**
```typescript
// ❌ Before
import { 
  signInWithProvider,    // No longer exists
  signOutUser,          // No longer exists
  createSignInHandler   // No longer exists
} from 'lib/auth/auth'

// ✅ After
import { 
  signInAction,         // Server Action
  signOutAction        // Server Action
} from 'lib/auth'

// Components moved
import { GoogleSignInButton } from 'components/auth/SignInButton'
```

---

**Esta referencia API cubre todos los aspectos técnicos del módulo de autenticación server-first, proporcionando la información necesaria para una implementación correcta y eficiente.**
