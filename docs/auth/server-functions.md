# Server Functions - Documentación Técnica

## 🔒 Server Actions y Funciones del Servidor

Este documento detalla todas las funciones disponibles en `src/app/lib/auth/server.ts`, diseñadas específicamente para ejecutarse en el servidor siguiendo las reglas de **Next.js 15.5.2**.

## 📋 Índice de Funciones

### 🔍 **Session Management**
- [`getCurrentSession()`](#getcurrentsession)
- [`isAuthenticated()`](#isauthenticated)
- [`getCurrentUser()`](#getcurrentuser)
- [`getUserProfile()`](#getuserprofile)
- [`hasRole()`](#hasrole)

### 🚀 **Server Actions**
- [`signInAction()`](#signinaction)
- [`signOutAction()`](#signoutaction)

### 🔄 **Navigation & Redirects**
- [`redirectAfterAuth()`](#redirectafterauth)
- [`requireAuth()`](#requireauth)
- [`redirectToSignIn()`](#redirecttosignin)
- [`redirectToHome()`](#redirecttohome)
- [`redirectToDashboard()`](#redirecttodashboard)

---

## 🔍 Session Management

### `getCurrentSession()`

Obtiene la sesión actual del servidor de forma segura.

```typescript
export async function getCurrentSession(): Promise<UserSession | null>
```

#### **Uso en Server Component**
```typescript
import { getCurrentSession } from 'lib/auth'

export default async function ProfilePage() {
  const session = await getCurrentSession()
  
  if (!session) {
    return <div>No hay sesión activa</div>
  }
  
  return (
    <div>
      <h1>Perfil de {session.user?.name}</h1>
      <p>Email: {session.user?.email}</p>
    </div>
  )
}
```

#### **Características**
- ✅ **Server-side only** - No funciona en cliente
- ✅ **Type-safe** - Retorna `UserSession | null`
- ✅ **Error handling** - Maneja errores internamente
- ✅ **Performance** - No requiere JavaScript cliente

---

### `isAuthenticated()`

Verifica si el usuario está autenticado de forma rápida.

```typescript
export async function isAuthenticated(): Promise<boolean>
```

#### **Uso Típico**
```typescript
import { isAuthenticated } from 'lib/auth'

export default async function DashboardLayout({ children }) {
  const authenticated = await isAuthenticated()
  
  return (
    <div>
      {authenticated ? (
        <nav>Dashboard Navigation</nav>
      ) : (
        <nav>Public Navigation</nav>
      )}
      {children}
    </div>
  )
}
```

#### **Ventajas**
- 🚀 **Rápido** - Solo verifica existencia de usuario
- 🔒 **Seguro** - Validación server-side
- 💡 **Simple** - Retorno boolean directo

---

### `getCurrentUser()`

Obtiene únicamente la información del usuario sin metadatos de sesión.

```typescript
export async function getCurrentUser(): Promise<User | null>
```

#### **Uso Optimizado**
```typescript
import { getCurrentUser } from 'lib/auth'

export default async function UserAvatar() {
  const user = await getCurrentUser()
  
  if (!user) return null
  
  return (
    <img 
      src={user.image || '/default-avatar.png'} 
      alt={user.name || 'Usuario'}
      className="w-8 h-8 rounded-full"
    />
  )
}
```

#### **Cuándo usar**
- ✅ Solo necesitas datos del usuario
- ✅ No necesitas metadatos de sesión
- ✅ Componentes de UI rápidos

---

## 🚀 Server Actions

### `signInAction()`

Server Action para iniciar sesión con cualquier provider.

```typescript
export async function signInAction(
  provider: AuthProvider, 
  options?: Partial<SignInOptions>
): Promise<void>
```

#### **Parámetros**
```typescript
interface SignInOptions {
  provider: 'google' | 'facebook' | 'apple' | 'github' | 'email'
  email?: string        // Requerido para provider 'email'
  callbackUrl?: string  // URL de redirección post-login
  redirect?: boolean    // Default: true
}
```

#### **Uso en Formulario Server Action**
```typescript
// app/login/page.tsx
import { signInAction } from 'lib/auth'

export default function LoginPage() {
  async function handleGoogleLogin() {
    'use server'
    await signInAction('google', {
      callbackUrl: '/dashboard'
    })
  }
  
  async function handleEmailLogin(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    await signInAction('email', {
      email,
      callbackUrl: '/dashboard'
    })
  }
  
  return (
    <div>
      <form action={handleGoogleLogin}>
        <button type="submit">Google Login</button>
      </form>
      
      <form action={handleEmailLogin}>
        <input name="email" type="email" required />
        <button type="submit">Email Login</button>
      </form>
    </div>
  )
}
```

#### **Comportamiento Interno**
```typescript
// OAuth Providers (google, facebook, github, apple)
redirect(`/api/auth/signin/${provider}?callbackUrl=${callbackUrl}`)

// Email Provider
redirect(`/api/auth/signin/email?email=${email}&callbackUrl=${callbackUrl}`)
```

---

### `signOutAction()`

Server Action para cerrar sesión de forma segura.

```typescript
export async function signOutAction(callbackUrl?: string): Promise<void>
```

#### **Uso Básico**
```typescript
// app/dashboard/page.tsx
import { signOutAction } from 'lib/auth'

export default function Dashboard() {
  async function handleSignOut() {
    'use server'
    await signOutAction('/') // Redirige a home
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      <form action={handleSignOut}>
        <button>Cerrar Sesión</button>
      </form>
    </div>
  )
}
```

#### **Características**
- 🔒 **Seguro** - Limpia cookies y sesión
- 🔄 **Automático** - Redirige después del logout
- ⚡ **Rápido** - No requiere JavaScript cliente

---

## 🔄 Navigation & Redirects

### `requireAuth()`

Protege rutas requiriendo autenticación. Redirige automáticamente si no está autenticado.

```typescript
export async function requireAuth(redirectTo?: string): Promise<void>
```

#### **Uso en Página Protegida**
```typescript
// app/dashboard/page.tsx
import { requireAuth, getCurrentUser } from 'lib/auth'

export default async function ProtectedDashboard() {
  // ✅ Protege la ruta automáticamente
  await requireAuth('/login')
  
  // Si llegamos aquí, el usuario está autenticado
  const user = await getCurrentUser()
  
  return (
    <div>
      <h1>Dashboard Privado</h1>
      <p>Bienvenido, {user?.name}!</p>
    </div>
  )
}
```

#### **Uso en Layout**
```typescript
// app/dashboard/layout.tsx
import { requireAuth } from 'lib/auth'

export default async function DashboardLayout({ children }) {
  await requireAuth() // Usa default: '/auth/signin'
  
  return (
    <div className="dashboard-layout">
      <nav>Dashboard Navigation</nav>
      <main>{children}</main>
    </div>
  )
}
```

---

### `redirectAfterAuth()`

Redirige condicionalmente basado en el estado de autenticación.

```typescript
export async function redirectAfterAuth(
  authenticatedUrl?: string,  // Default: '/'
  unauthenticatedUrl?: string // Default: '/auth/signin'
): Promise<void>
```

#### **Uso en Landing Page**
```typescript
// app/page.tsx
import { redirectAfterAuth } from 'lib/auth'

export default async function HomePage() {
  // Si está autenticado → dashboard
  // Si no está autenticado → login
  await redirectAfterAuth('/dashboard', '/login')
  
  // Este código nunca se ejecuta debido al redirect
  return null
}
```

---

### `redirectToSignIn()`

Redirige a la página de inicio de sesión con callback URL opcional.

```typescript
export async function redirectToSignIn(callbackUrl?: string): Promise<void>
```

#### **Uso en Middleware o Guards**
```typescript
// app/admin/page.tsx
import { hasRole, redirectToSignIn } from 'lib/auth'

export default async function AdminPage() {
  const isAdmin = await hasRole('admin')
  
  if (!isAdmin) {
    await redirectToSignIn('/admin') // Vuelve aquí después del login
  }
  
  return <div>Panel de Administración</div>
}
```

---

## 🔧 Funciones Avanzadas

### `hasRole()`

Verifica si el usuario tiene un rol específico (extensible).

```typescript
export async function hasRole(role: string): Promise<boolean>
```

#### **Nota Importante**
```typescript
// Esta función está preparada para futuras extensiones
// Actualmente retorna false ya que los roles no están implementados
// @ts-expect-error - Para futuras extensiones de roles
return session?.user?.role === role || false
```

#### **Uso Futuro**
```typescript
import { hasRole } from 'lib/auth'

export default async function AdminPanel() {
  const isAdmin = await hasRole('admin')
  const isModerator = await hasRole('moderator')
  
  if (!isAdmin && !isModerator) {
    return <div>Acceso denegado</div>
  }
  
  return <div>Panel de Control</div>
}
```

---

### `getUserProfile()`

Obtiene información extendida del usuario con tipado estricto.

```typescript
export async function getUserProfile(): Promise<UserProfile | null>
```

#### **Return Type**
```typescript
interface UserProfile {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  // Campos futuros se añadirán aquí
}
```

#### **Uso en Perfil Completo**
```typescript
import { getUserProfile } from 'lib/auth'

export default async function ProfilePage() {
  const profile = await getUserProfile()
  
  if (!profile) {
    return <div>Perfil no encontrado</div>
  }
  
  return (
    <div>
      <h1>Perfil de Usuario</h1>
      <p>ID: {profile.id}</p>
      <p>Nombre: {profile.name || 'No especificado'}</p>
      <p>Email: {profile.email}</p>
      {profile.image && (
        <img src={profile.image} alt="Avatar" />
      )}
    </div>
  )
}
```

---

## 🎯 Patrones de Uso Recomendados

### **1. Protección de Rutas**
```typescript
// ✅ Recomendado - Layout protegido
export default async function ProtectedLayout({ children }) {
  await requireAuth()
  return <div>{children}</div>
}
```

### **2. Redirección Condicional**
```typescript
// ✅ Recomendado - Landing inteligente  
export default async function LandingPage() {
  await redirectAfterAuth('/dashboard', '/login')
  return null
}
```

### **3. UI Condicional**
```typescript
// ✅ Recomendado - Navegación adaptativa
export default async function Navigation() {
  const authenticated = await isAuthenticated()
  
  return (
    <nav>
      {authenticated ? <UserMenu /> : <LoginButton />}
    </nav>
  )
}
```

### **4. Server Actions en Formularios**
```typescript
// ✅ Recomendado - Login con Server Action
export default function LoginForm() {
  async function handleLogin(formData: FormData) {
    'use server'
    const provider = formData.get('provider') as AuthProvider
    await signInAction(provider, { callbackUrl: '/dashboard' })
  }
  
  return (
    <form action={handleLogin}>
      <button name="provider" value="google">Google</button>
      <button name="provider" value="github">GitHub</button>
    </form>
  )
}
```

---

## ⚠️ Limitaciones y Consideraciones

### **Next.js 15.5.2 Compliance**
- ✅ Solo funciones `async` en archivos `'use server'`
- ✅ No exports de constantes en server.ts
- ✅ Todas las constantes movidas a utils.ts

### **Error Handling**
- Todas las funciones manejan errores internamente
- Los errores se logean en consola del servidor
- Las redirecciones fallan silenciosamente en caso de error

### **Performance**
- Las funciones de sesión cachean automáticamente
- Usa `isAuthenticated()` para verificaciones rápidas
- Usa `getCurrentUser()` cuando solo necesites datos del usuario

---

**Esta documentación cubre todas las funciones server-side del módulo de autenticación, optimizadas para Next.js App Router.**
