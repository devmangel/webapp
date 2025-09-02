# Ejemplos de Servidor - Guías Prácticas

## 🚀 Ejemplos Completos de Server Components y Server Actions

Esta guía proporciona ejemplos prácticos y casos de uso reales para implementar autenticación server-first en Next.js App Router.

---

## 📋 Índice de Ejemplos

### **🔒 Páginas Protegidas**
- [Página Básica Protegida](#página-básica-protegida)
- [Dashboard con Datos del Usuario](#dashboard-con-datos-del-usuario)
- [Layout Protegido](#layout-protegido)
- [Página Admin con Roles](#página-admin-con-roles)

### **🏠 Landing Pages**
- [Landing Inteligente](#landing-inteligente)
- [Homepage con Estado Auth](#homepage-con-estado-auth)
- [Redirección Condicional](#redirección-condicional)

### **🔄 Server Actions**
- [Login con Formulario](#login-con-formulario)
- [Logout con Redirección](#logout-con-redirección)
- [Email Magic Link](#email-magic-link)
- [Multi-Provider Login](#multi-provider-login)

### **🎨 Componentes Híbridos**
- [Navegación Adaptativa](#navegación-adaptativa)
- [User Profile](#user-profile)
- [Avatar Component](#avatar-component)
- [Auth Status Badge](#auth-status-badge)

---

## 🔒 Páginas Protegidas

### **Página Básica Protegida**

```typescript
// app/dashboard/page.tsx
import { requireAuth, getCurrentUser } from 'lib/auth'

export default async function DashboardPage() {
  // 🛡️ Protección automática - redirige si no autenticado
  await requireAuth()
  
  // 🔍 Obtener datos del usuario (sabemos que existe)
  const user = await getCurrentUser()
  
  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <p>Bienvenido, {user?.name || user?.email}</p>
      </header>
      
      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h2>Estadísticas</h2>
            <p>Contenido protegido aquí</p>
          </div>
          
          <div className="card">
            <h2>Actividad Reciente</h2>
            <p>Solo visible para usuarios autenticados</p>
          </div>
          
          <div className="card">
            <h2>Configuración</h2>
            <p>Panel de control personal</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Dashboard - Mi App',
  description: 'Panel de control personal'
}
```

---

### **Dashboard con Datos del Usuario**

```typescript
// app/profile/page.tsx
import { getCurrentSession, requireAuth, formatUserDisplayName, getUserInitials } from 'lib/auth'
import Image from 'next/image'

export default async function ProfilePage() {
  // 🛡️ Requiere autenticación
  await requireAuth('/login')
  
  // 🔍 Obtener sesión completa
  const session = await getCurrentSession()
  
  if (!session?.user) {
    // Esto no debería pasar debido a requireAuth, pero por seguridad
    return <div>Error: No se pudo cargar el perfil</div>
  }
  
  const { user } = session
  const displayName = formatUserDisplayName(user.name, user.email)
  const initials = getUserInitials(user.name, user.email)
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header con Avatar */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {displayName}
            </h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">
              ID: {user.id}
            </p>
          </div>
        </div>
      </div>
      
      {/* Información de Sesión */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Información de Sesión</h2>
        
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-500">Nombre</dt>
            <dd className="mt-1 text-gray-900">{user.name || 'No especificado'}</dd>
          </div>
          
          <div>
            <dt className="font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-gray-900">{user.email}</dd>
          </div>
          
          <div>
            <dt className="font-medium text-gray-500">Sesión expira</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(session.expires).toLocaleString('es-ES')}
            </dd>
          </div>
          
          <div>
            <dt className="font-medium text-gray-500">Avatar</dt>
            <dd className="mt-1 text-gray-900">
              {user.image ? 'Configurado' : 'No configurado'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
```

---

### **Layout Protegido**

```typescript
// app/dashboard/layout.tsx
import { requireAuth, getCurrentUser } from 'lib/auth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // 🛡️ Proteger todo el layout
  await requireAuth()
  
  // 🔍 Obtener usuario para el header
  const user = await getCurrentUser()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con info del usuario */}
      <Header user={user} />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar user={user} />
        
        {/* Contenido principal */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

// components/Header.tsx (Server Component)
interface HeaderProps {
  user: any // Usar tipo correcto de getCurrentUser
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.name || user?.email}
            </span>
            
            {/* SignOutButton será client component */}
            <SignOutButton className="btn-secondary" />
          </div>
        </div>
      </div>
    </header>
  )
}
```

---

## 🏠 Landing Pages

### **Landing Inteligente**

```typescript
// app/page.tsx
import { redirectAfterAuth } from 'lib/auth'

export default async function HomePage() {
  // 🔄 Redirección inteligente basada en estado de auth
  await redirectAfterAuth('/dashboard', '/welcome')
  
  // Este código nunca se ejecutará debido al redirect
  return null
}

// app/welcome/page.tsx (Página para usuarios no autenticados)
import { GoogleSignInButton, GitHubSignInButton } from 'components/auth/SignInButton'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido
            </h1>
            <p className="text-gray-600">
              Inicia sesión para acceder a tu dashboard
            </p>
          </div>
          
          <div className="space-y-4">
            <GoogleSignInButton 
              callbackUrl="/dashboard"
              className="w-full"
            />
            
            <GitHubSignInButton 
              callbackUrl="/dashboard"
              className="w-full"
            />
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Al continuar, aceptas nuestros términos de servicio
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### **Homepage con Estado Auth**

```typescript
// app/home/page.tsx
import { isAuthenticated, getCurrentUser } from 'lib/auth'
import { GoogleSignInButton } from 'components/auth/SignInButton'
import SignOutButton from 'components/auth/SignOutButton'

export default async function HomePage() {
  // 🔍 Verificar estado de autenticación
  const authenticated = await isAuthenticated()
  const user = authenticated ? await getCurrentUser() : null
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Mi Aplicación
          </h1>
          <p className="text-xl mb-8">
            La mejor experiencia para usuarios autenticados
          </p>
          
          {/* UI Condicional basada en autenticación */}
          {authenticated && user ? (
            <div className="bg-blue-700 rounded-lg p-6 inline-block">
              <p className="mb-4">
                ¡Hola de nuevo, {user.name || user.email}!
              </p>
              <div className="space-x-4">
                <a 
                  href="/dashboard"
                  className="bg-white text-blue-600 px-6 py-2 rounded font-semibold hover:bg-gray-100"
                >
                  Ir al Dashboard
                </a>
                <SignOutButton 
                  callbackUrl="/"
                  className="bg-blue-500 hover:bg-blue-400 px-6 py-2 rounded font-semibold"
                >
                  Cerrar Sesión
                </SignOutButton>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="mb-6">Inicia sesión para comenzar</p>
              
              <div className="flex justify-center space-x-4">
                <GoogleSignInButton 
                  callbackUrl="/dashboard"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                />
                
                <GitHubSignInButton 
                  callbackUrl="/dashboard"
                  className="bg-gray-800 hover:bg-gray-700"
                />
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {authenticated ? 'Tus Funcionalidades' : 'Funcionalidades'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-4">Dashboard Personal</h3>
              <p className="text-gray-600">
                {authenticated 
                  ? "Accede a tu panel personalizado" 
                  : "Tendrás acceso a un panel personalizado"
                }
              </p>
            </div>
            
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-4">Datos Seguros</h3>
              <p className="text-gray-600">
                {authenticated 
                  ? "Tus datos están protegidos" 
                  : "Protegemos tu información personal"
                }
              </p>
            </div>
            
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-4">Experiencia Premium</h3>
              <p className="text-gray-600">
                {authenticated 
                  ? "Disfruta de todas las funciones" 
                  : "Desbloquea funciones premium"
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

---

## 🔄 Server Actions

### **Login con Formulario**

```typescript
// app/login/page.tsx
import { signInAction, getCallbackUrlFromParams } from 'lib/auth'
import { redirect } from 'next/navigation'

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const callbackUrl = searchParams.callbackUrl || '/dashboard'
  
  // Server Actions para cada provider
  async function handleGoogleLogin() {
    'use server'
    await signInAction('google', { callbackUrl })
  }
  
  async function handleGitHubLogin() {
    'use server'
    await signInAction('github', { callbackUrl })
  }
  
  async function handleEmailLogin(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    
    if (!email) {
      redirect(`/login?error=missing-email&callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
    
    // Validación de email en servidor
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      redirect(`/login?error=invalid-email&callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
    
    await signInAction('email', { email, callbackUrl })
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {callbackUrl !== '/dashboard' && (
              <span>Serás redirigido a: {callbackUrl}</span>
            )}
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {/* OAuth Providers */}
          <div className="space-y-4">
            <form action={handleGoogleLogin}>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-gray-300"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  {/* Google Icon SVG */}
                </svg>
                Continuar con Google
              </button>
            </form>
            
            <form action={handleGitHubLogin}>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  {/* GitHub Icon SVG */}
                </svg>
                Continuar con GitHub
              </button>
            </form>
          </div>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">O continúa con email</span>
            </div>
          </div>
          
          {/* Email Form */}
          <form action={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="tu@email.com"
              />
            </div>
            
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enviar enlace mágico
            </button>
          </form>
          
          {/* Error Display */}
          {searchParams.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {searchParams.error === 'missing-email' && 'Por favor ingresa tu email'}
                {searchParams.error === 'invalid-email' && 'Formato de email inválido'}
                {searchParams.error === 'auth-error' && 'Error de autenticación'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### **Logout con Redirección**

```typescript
// app/settings/page.tsx
import { requireAuth, getCurrentUser, signOutAction } from 'lib/auth'

export default async function SettingsPage() {
  await requireAuth()
  const user = await getCurrentUser()
  
  // Server Actions para diferentes tipos de logout
  async function handleLogout() {
    'use server'
    await signOutAction('/')
  }
  
  async function handleLogoutToLogin() {
    'use server'
    await signOutAction('/login')
  }
  
  async function handleLogoutWithMessage() {
    'use server'
    await signOutAction('/?message=logged-out')
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Información de la Cuenta</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nombre</label>
            <p className="text-gray-900">{user?.name || 'No especificado'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Cerrar Sesión</h2>
        <p className="text-gray-600 mb-4">
          Elige dónde te gustaría ser redirigido después de cerrar sesión:
        </p>
        
        <div className="space-y-3">
          <form action={handleLogout}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cerrar sesión → Página principal
            </button>
          </form>
          
          <form action={handleLogoutToLogin}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cerrar sesión → Página de login
            </button>
          </form>
          
          <form action={handleLogoutWithMessage}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
            >
              Cerrar sesión → Con mensaje de confirmación
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

---

## 🎨 Componentes Híbridos

### **Navegación Adaptativa**

```typescript
// app/components/Navigation.tsx (Server Component)
import { isAuthenticated, getCurrentUser } from 'lib/auth'
import { NavigationClient } from './NavigationClient'

export default async function Navigation() {
  const authenticated = await isAuthenticated()
  const user = authenticated ? await getCurrentUser() : null
  
  return <NavigationClient authenticated={authenticated} user={user} />
}

// app/components/NavigationClient.tsx (Client Component)
'use client'
import { useState } from 'react'
import { GoogleSignInButton } from 'components/auth/SignInButton'
import SignOutButton from 'components/auth/SignOutButton'

interface NavigationClientProps {
  authenticated: boolean
  user: any | null
}

export function NavigationClient({ authenticated, user }: NavigationClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-gray-900">
              MiApp
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-600 hover:text-gray-900">
              Inicio
            </a>
            
            {authenticated ? (
              <>
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </a>
                <a href="/profile" className="text-gray-600 hover:text-gray-900">
                  Perfil
                </a>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {user?.name || user?.email}
                  </span>
                  <SignOutButton className="btn-secondary" />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <GoogleSignInButton 
                  callbackUrl="/dashboard"
                  className="btn-primary"
                >
                  Iniciar Sesión
                </GoogleSignInButton>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <a href="/" className="block px-3 py-2 text-gray-600">Inicio</a>
            
            {authenticated ? (
              <>
                <a href="/dashboard" className="block px-3 py-2 text-gray-600">Dashboard</a>
                <a href="/profile" className="block px-3 py-2 text-gray-600">Perfil</a>
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
                  <SignOutButton className="w-full btn-secondary" />
                </div>
              </>
            ) : (
              <div className="px-3 py-2">
                <GoogleSignInButton 
                  callbackUrl="/dashboard"
                  className="w-full btn-primary"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
```

---

### **User Profile Component**

```typescript
// app/components/UserProfile.tsx (Server Component)
import { getCurrentSession, formatUserDisplayName, getUserInitials } from 'lib/auth'
import Image from 'next/image'

interface UserProfileProps {
  layout?: 'card' | 'inline' | 'minimal'
  showEmail?: boolean
  showLogout?: boolean
}

export default async function UserProfile({ 
  layout = 'card', 
  showEmail = true,
  showLogout = true 
}: UserProfileProps) {
  const session = await getCurrentSession()
  
  if (!session?.user) {
    return null
  }
  
  const { user } = session
  const displayName = formatUserDisplayName(user.name, user.email)
  const initials = getUserInitials(user.name, user.email)
  
  if (layout === 'minimal') {
    return (
      <div className="flex items-center space-x-2">
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {displayName}
        </span>
      </div>
    )
  }
  
  if (layout === 'inline') {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {initials}
            </div>
          )}
          
          <div>
            <p className="font-medium text-gray-900">{displayName}</p>
            {showEmail && (
              <p className="text-sm text-gray-500">{user.email}</p>
            )}
          </div>
        </div>
        
        {showLogout && (
          <SignOutButton className="btn-secondary" />
        )}
      </div>
    )
  }
  
  // Layout: card (default)
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg
