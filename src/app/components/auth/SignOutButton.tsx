'use client'

import { signOutAction } from '../../lib/auth/server'

interface SignOutButtonProps {
  callbackUrl?: string
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

export default function SignOutButton({
  callbackUrl,
  className = '',
  children,
  disabled = false
}: SignOutButtonProps) {

  const handleSignOut = async () => {
    if (disabled) return

    try {
      await signOutAction(callbackUrl)
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  const defaultClassName = `
    inline-flex items-center justify-center
    px-6 py-3 border border-transparent
    text-sm font-medium rounded-lg shadow-sm
    text-[var(--color-text-primary)] bg-secondary hover:bg-amber-700
    dark:bg-secondary dark:hover:bg-amber-600
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary
    dark:focus:ring-offset-[var(--color-app-background)]
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200 ease-in-out
    hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
  `.trim().replace(/\s+/g, ' ')

  // Combine default styles with custom className
  const combinedClassName = className || defaultClassName

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={disabled}
      className={combinedClassName}
    >
      {children || (
        <>
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </>
      )}
    </button>
  )
}

// Variantes del botón
export function SignOutButtonSecondary(props: SignOutButtonProps) {
  const secondaryStyles = `
    inline-flex items-center justify-center
    px-6 py-3 border border-[var(--color-border)] dark:border-[var(--color-border)]
    text-sm font-medium rounded-lg shadow-sm
    text-[var(--color-text-primary)] bg-[var(--color-neutral-light)] hover:bg-amber-50
    dark:bg-[var(--color-neutral-dark)] dark:hover:bg-gray-800
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary
    dark:focus:ring-offset-[var(--color-app-background)]
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200 ease-in-out
    hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
  `.trim().replace(/\s+/g, ' ')

  const combinedClassName = props.className
    ? `${secondaryStyles} ${props.className}`
    : secondaryStyles

  return (
    <SignOutButton
      {...props}
      className={combinedClassName}
    >
      {props.children || 'Cerrar sesión'}
    </SignOutButton>
  )
}

export function SignOutButtonLink(props: SignOutButtonProps) {
  const linkStyles = `
    inline-flex items-center
    text-sm font-medium
    text-[var(--color-text-secondary)] hover:text-secondary
    dark:hover:text-amber-400
    focus:outline-none focus:underline focus:underline-offset-4
    disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer
    transition-all duration-200 ease-in-out
    hover:scale-[1.02] active:scale-[0.98]
  `.trim().replace(/\s+/g, ' ')

  const combinedClassName = props.className
    ? `${linkStyles} ${props.className}`
    : linkStyles

  return (
    <SignOutButton
      {...props}
      className={combinedClassName}
    >
      {props.children || 'Cerrar sesión'}
    </SignOutButton>
  )
}
