# Utilidades de Autenticación

## 🛠️ Funciones Puras y Constantes

Este documento detalla todas las utilidades disponibles en `src/app/lib/auth/utils.ts`. Estas son **funciones puras** que pueden ejecutarse tanto en servidor como en cliente, sin dependencias de `'use server'`.

## 📋 Índice de Utilidades

### 🔧 **Constantes**
- [`DEFAULT_CALLBACK_URL`](#default_callback_url)
- [`DEFAULT_SIGNIN_URL`](#default_signin_url)
- [`AUTH_PROVIDERS`](#auth_providers)

### 🎯 **Provider Management**
- [`getAvailableProviders()`](#getavailableproviders)
- [`getProviderDisplayName()`](#getproviderdisplayname)
- [`isValidProvider()`](#isvalidprovider)
- [`getProviderConfig()`](#getproviderconfig)

### 🌐 **URL & Navigation**
- [`createCallbackUrl()`](#createcallbackurl)
- [`getErrorFromUrl()`](#geterrorfromurl)
- [`getCallbackUrlFromParams()`](#getcallbackurlfromparams)
- [`isValidCallbackUrl()`](#isvalidcallbackurl)
- [`cleanAuthParams()`](#cleanauthparams)

### 🔍 **Validation & Formatting**
- [`isValidEmail()`](#isvalidemail)
- [`formatUserDisplayName()`](#formatuserdisplayname)
- [`getUserInitials()`](#getuserinitials)
- [`generateCallbackId()`](#generatecallbackid)

### 🚨 **Error Handling**
- [`handleAuthError()`](#handleautherror)

---

## 🔧 Constantes

### `DEFAULT_CALLBACK_URL`

URL por defecto para redirección después de la autenticación.

```typescript
export const DEFAULT_CALLBACK_URL = '/'
```

#### **Uso**
```typescript
import { DEFAULT_CALLBACK_URL } from 'lib/auth'

// En Server Actions
await signInAction('google', { 
  callbackUrl: DEFAULT_CALLBACK_URL 
})

// En componentes
<SignInButton callbackUrl={DEFAULT_CALLBACK_URL} />
```

---

### `DEFAULT_SIGNIN_URL`

URL por defecto para la página de inicio de sesión.

```typescript
export const DEFAULT_SIGNIN_URL = '/auth/signin'
```

#### **Uso**
```typescript
import { DEFAULT_SIGNIN_URL } from 'lib/auth'

// Redirección automática
if (!authenticated) {
  redirect(DEFAULT_SIGNIN_URL)
}

// En middleware
export function middleware(request: NextRequest) {
  // ...lógica
  return NextResponse.redirect(new URL(DEFAULT_SIGNIN_URL, request.url))
}
```

---

### `AUTH_PROVIDERS`

Mapeo de providers con sus nombres de display.

```typescript
export const AUTH_PROVIDERS: Record<AuthProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
  github: 'GitHub',
  email: 'Email'
}
```

#### **Uso**
```typescript
import { AUTH_PROVIDERS } from 'lib/auth'

// Generar lista de botones
Object.entries(AUTH_PROVIDERS).map(([key, name]) => (
  <SignInButton key={key} provider={key as AuthProvider}>
    Continuar con {name}
  </SignInButton>
))
```

---

## 🎯 Provider Management

### `getAvailableProviders()`

Obtiene la lista de todos los providers disponibles.

```typescript
export function getAvailableProviders(): AuthProvider[]
```

#### **Uso en Componente**
```typescript
import { getAvailableProviders } from 'lib/auth'

export default function AuthProvidersList() {
  const providers = getAvailableProviders()
  
  return (
    <div className="auth-providers">
      {providers.map(provider => (
        <SignInButton 
          key={provider} 
          provider={provider}
          className="provider-button"
        />
      ))}
    </div>
  )
}
```

#### **Return Value**
```typescript
['google', 'facebook', 'apple', 'github', 'email']
```

---

### `getProviderDisplayName()`

Obtiene el nombre de display para un provider específico.

```typescript
export function getProviderDisplayName(provider: AuthProvider): string
```

#### **Uso**
```typescript
import { getProviderDisplayName } from 'lib/auth'

// En componente
const displayName = getProviderDisplayName('google') // "Google"

// En texto dinámico
<h2>Iniciar sesión con {getProviderDisplayName(selectedProvider)}</h2>

// En logs
console.log(`Usuario autenticado con ${getProviderDisplayName(provider)}`)
```

---

### `isValidProvider()`

Valida si un string es un provider válido (type guard).

```typescript
export function isValidProvider(provider: string): provider is AuthProvider
```

#### **Uso con Type Safety**
```typescript
import { isValidProvider } from 'lib/auth'

// En API route
export async function POST(request: Request) {
  const { provider } = await request.json()
  
  if (!isValidProvider(provider)) {
    return NextResponse.json(
      { error: 'Provider inválido' }, 
      { status: 400 }
    )
  }
  
  // Aquí TypeScript sabe que provider es AuthProvider
  await signInAction(provider, { callbackUrl: '/dashboard' })
}

// En formulario dinámico
function handleProviderChange(value: string) {
  if (isValidProvider(value)) {
    setSelectedProvider(value) // Type-safe
  }
}
```

---

### `getProviderConfig()`

Obtiene la configuración específica para cada provider.

```typescript
export function getProviderConfig(provider: AuthProvider): ProviderConfig
```

#### **Configuraciones Disponibles**
```typescript
const configs = {
  google: {
    scope: 'openid email profile',
    params: { 
      prompt: 'consent', 
      access_type: 'offline', 
      response_type: 'code' 
    }
  },
  facebook: {
    scope: 'email public_profile'
  },
  apple: {
    scope: 'name email'
  },
  github: {
    scope: 'user:email'
  },
  email: {
    // Configuración específica para email provider
  }
}
```

#### **Uso Avanzado**
```typescript
import { getProviderConfig } from 'lib/auth'

// En configuración de NextAuth personalizada
const googleConfig = getProviderConfig('google')
console.log(googleConfig.scope) // "openid email profile"

// Para documentación automática
function generateProviderDocs() {
  return getAvailableProviders().map(provider => ({
    name: getProviderDisplayName(provider),
    config: getProviderConfig(provider)
  }))
}
```

---

## 🌐 URL & Navigation

### `createCallbackUrl()`

Crea una URL de callback completa con validación.

```typescript
export function createCallbackUrl(path: string, baseUrl?: string): string
```

#### **Uso**
```typescript
import { createCallbackUrl } from 'lib/auth'

// Con path relativo
const callback = createCallbackUrl('/dashboard')
// → "https://myapp.com/dashboard"

// Con path absoluto
const callback = createCallbackUrl('https://external.com/callback')
// → "https://external.com/callback"

// Con baseUrl customizada
const callback = createCallbackUrl('/admin', 'https://admin.myapp.com')
// → "https://admin.myapp.com/admin"
```

#### **Casos de Uso**
```typescript
// En configuración dinámica
const callbackUrl = createCallbackUrl(
  user.isAdmin ? '/admin' : '/dashboard'
)

// En deep links
const deepLink = createCallbackUrl(`/posts/${postId}`)

// En subdominios
const adminCallback = createCallbackUrl('/panel', 'https://admin.example.com')
```

---

### `getErrorFromUrl()`

Extrae y formatea errores de autenticación desde la URL.

```typescript
export function getErrorFromUrl(): string | null
```

#### **Uso en Páginas de Error**
```typescript
'use client'
import { getErrorFromUrl } from 'lib/auth'

export default function AuthErrorPage() {
  const error = getErrorFromUrl()
  
  if (!error) {
    return <div>No hay errores</div>
  }
  
  return (
    <div className="error-container">
      <h1>Error de Autenticación</h1>
      <p>{error}</p>
      <button onClick={() => window.location.href = '/login'}>
        Intentar de nuevo
      </button>
    </div>
  )
}
```

#### **Errores Soportados**
```typescript
// URL: /auth/error?error=OAuthCallback
getErrorFromUrl() // → "Error en el callback de OAuth"

// URL: /auth/error?error=CredentialsSignin  
getErrorFromUrl() // → "Credenciales inválidas"

// URL: /dashboard (sin error)
getErrorFromUrl() // → null
```

---

### `getCallbackUrlFromParams()`

Obtiene la URL de callback desde los parámetros de la URL.

```typescript
export function getCallbackUrlFromParams(defaultUrl: string = '/'): string
```

#### **Uso**
```typescript
import { getCallbackUrlFromParams } from 'lib/auth'

// URL: /login?callbackUrl=%2Fdashboard
const callback = getCallbackUrlFromParams()
// → "/dashboard"

// URL: /login (sin parámetros)
const callback = getCallbackUrlFromParams('/home')
// → "/home"

// En componente de login
export default function LoginPage() {
  const callbackUrl = getCallbackUrlFromParams('/dashboard')
  
  return (
    <SignInButton 
      provider="google"
      callbackUrl={callbackUrl}
    />
  )
}
```

---

## 🔍 Validation & Formatting

### `isValidEmail()`

Valida formato de email con regex estándar.

```typescript
export function isValidEmail(email: string): boolean
```

#### **Uso**
```typescript
import { isValidEmail } from 'lib/auth'

// En formularios
function validateEmailInput(email: string) {
  if (!isValidEmail(email)) {
    throw new Error('Email inválido')
  }
  return email
}

// En Server Action
export async function emailSignInAction(formData: FormData) {
  'use server'
  const email = formData.get('email') as string
  
  if (!isValidEmail(email)) {
    return { error: 'Formato de email inválido' }
  }
  
  await signInAction('email', { email })
}

// Ejemplos de validación
isValidEmail('user@example.com')     // → true
isValidEmail('invalid-email')        // → false
isValidEmail('user@')               // → false
```

---

### `formatUserDisplayName()`

Formatea el nombre de usuario para mostrar en UI.

```typescript
export function formatUserDisplayName(
  name?: string | null, 
  email?: string | null
): string
```

#### **Lógica de Fallback**
```typescript
// 1. Si hay name → usar name
// 2. Si hay email → usar parte antes de @
// 3. Fallback → "Usuario"
```

#### **Uso**
```typescript
import { formatUserDisplayName } from 'lib/auth'

// En componentes de UI
export default function UserGreeting({ user }) {
  const displayName = formatUserDisplayName(user.name, user.email)
  
  return <h1>¡Hola, {displayName}!</h1>
}

// Ejemplos
formatUserDisplayName('Juan Pérez', 'juan@example.com')
// → "Juan Pérez"

formatUserDisplayName(null, 'maria@example.com')
// → "maria"

formatUserDisplayName(null, null)
// → "Usuario"
```

---

### `getUserInitials()`

Genera iniciales del usuario para avatares.

```typescript
export function getUserInitials(
  name?: string | null, 
  email?: string | null
): string
```

#### **Uso en Avatar Components**
```typescript
import { getUserInitials } from 'lib/auth'

export default function UserAvatar({ user, size = 40 }) {
  const initials = getUserInitials(user.name, user.email)
  
  if (user.image) {
    return <img src={user.image} alt={user.name} />
  }
  
  return (
    <div 
      className="avatar-placeholder"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  )
}

// Ejemplos de generación
getUserInitials('Juan Pérez', null)           // → "JP"
getUserInitials('María', 'maria@example.com') // → "MA"
getUserInitials(null, 'test@example.com')     // → "TE"
getUserInitials(null, null)                   // → "U"
```

---

### `generateCallbackId()`

Genera un ID único para callbacks y tracking.

```typescript
export function generateCallbackId(): string
```

#### **Uso**
```typescript
import { generateCallbackId } from 'lib/auth'

// Para tracking de autenticación
const authId = generateCallbackId()
// → "auth_1704067200000_a8b4c2d1e"

// En logs y analytics
console.log(`Auth attempt: ${generateCallbackId()}`)

// Para estado temporal
const [authState, setAuthState] = useState({
  id: generateCallbackId(),
  status: 'pending'
})
```

---

## 🌐 URL Management

### `isValidCallbackUrl()`

Valida si una URL es segura para usar como callback.

```typescript
export function isValidCallbackUrl(url: string): boolean
```

#### **Uso en Seguridad**
```typescript
import { isValidCallbackUrl } from 'lib/auth'

// En Server Action
export async function customSignInAction(
  provider: AuthProvider,
  callbackUrl: string
) {
  'use server'
  
  if (!isValidCallbackUrl(callbackUrl)) {
    throw new Error('URL de callback inválida')
  }
  
  await signInAction(provider, { callbackUrl })
}

// Ejemplos de validación
isValidCallbackUrl('https://myapp.com/dashboard')  // → true
isValidCallbackUrl('/dashboard')                   // → true
isValidCallbackUrl('javascript:alert(1)')         // → false
isValidCallbackUrl('ftp://malicious.com')         // → false
```

---

### `cleanAuthParams()`

Limpia parámetros de autenticación de una URL.

```typescript
export function cleanAuthParams(url: string): string
```

#### **Uso**
```typescript
import { cleanAuthParams } from 'lib/auth'

// Limpiar URL después de auth
const cleanUrl = cleanAuthParams(window.location.href)
window.history.replaceState({}, '', cleanUrl)

// Ejemplos
const dirtyUrl = 'https://app.com/dashboard?code=abc123&state=xyz&error=none'
const cleanUrl = cleanAuthParams(dirtyUrl)
// → "https://app.com/dashboard"

// En navegación
function navigateToCleanUrl(url: string) {
  const cleanUrl = cleanAuthParams(url)
  router.push(cleanUrl)
}
```

---

## 🚨 Error Handling

### `handleAuthError()`

Convierte códigos de error de NextAuth en mensajes legibles.

```typescript
export function handleAuthError(error: string): string
```

#### **Mensajes de Error Soportados**
```typescript
const errorMessages = {
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

#### **Uso en UI**
```typescript
import { handleAuthError } from 'lib/auth'

// En páginas de error
export default function AuthErrorPage({ searchParams }) {
  const errorCode = searchParams.error
  const errorMessage = handleAuthError(errorCode)
  
  return (
    <div className="error-page">
      <h1>Error de Autenticación</h1>
      <p>{errorMessage}</p>
    </div>
  )
}

// En manejo de errores
try {
  await signInAction('google')
} catch (error) {
  const userMessage = handleAuthError(error.code)
  setErrorMessage(userMessage)
}
```

---

## 🎯 Patrones de Uso Combinados

### **Formulario de Login Completo**
```typescript
'use client'
import { 
  isValidEmail, 
  getAvailableProviders,
  getProviderDisplayName,
  handleAuthError 
} from 'lib/auth'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const providers = getAvailableProviders().filter(p => p !== 'email')
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    
    if (!isValidEmail(email)) {
      setError('Email inválido')
      return
    }
    
    try {
      await signInAction('email', { email })
    } catch (err) {
      setError(handleAuthError(err.code))
    }
  }
  
  return (
    <div>
      {/* OAuth Providers */}
      {providers.map(provider => (
        <SignInButton 
          key={provider}
          provider={provider}
        >
          {getProviderDisplayName(provider)}
        </SignInButton>
      ))}
      
      {/* Email Form */}
      <form onSubmit={handleEmailSubmit}>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <button type="submit">Continuar con Email</button>
      </form>
      
      {error && <p className="error">{error}</p>}
    </div>
  )
}
```

### **URL y Callback Management**
```typescript
import { 
  createCallbackUrl,
  getCallbackUrlFromParams,
  isValidCallbackUrl,
  cleanAuthParams
} from 'lib/auth'

export default function AuthRedirectManager() {
  // Obtener callback desde URL
  const requestedCallback = getCallbackUrlFromParams('/dashboard')
  
  // Validar seguridad
  const safeCallback = isValidCallbackUrl(requestedCallback) 
    ? requestedCallback 
    : '/dashboard'
  
  // Crear URL completa
  const fullCallbackUrl = createCallbackUrl(safeCallback)
  
  // Limpiar URL actual
  useEffect(() => {
    const cleanUrl = cleanAuthParams(window.location.href)
    if (cleanUrl !== window.location.href) {
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [])
  
  return (
    <SignInButton 
      provider="google"
      callbackUrl={fullCallbackUrl}
    />
  )
}
```

---

**Las utilidades proporcionan la base sólida para un sistema de autenticación flexible y seguro, con funciones puras que pueden usarse tanto en servidor como en cliente.**
