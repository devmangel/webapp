'use client'

import { signOutAction } from '../../lib/auth/server'
import { DEFAULT_SIGNIN_URL } from '../../lib/auth/utils'

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
    px-4 py-2 border border-transparent
    text-sm font-medium rounded-md
    text-white bg-red-600 hover:bg-red-700
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `.trim().replace(/\s+/g, ' ')

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={disabled}
      className={className || defaultClassName}
    >
      {children || (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  return (
    <SignOutButton
      {...props}
      className={props.className || `
        inline-flex items-center justify-center
        px-4 py-2 border border-gray-300
        text-sm font-medium rounded-md
        text-gray-700 bg-white hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      `.trim().replace(/\s+/g, ' ')}
    >
      {props.children || 'Cerrar sesión'}
    </SignOutButton>
  )
}

export function SignOutButtonLink(props: SignOutButtonProps) {
  return (
    <SignOutButton
      {...props}
      className={props.className || `
        inline-flex items-center
        text-sm text-gray-600 hover:text-gray-900
        focus:outline-none focus:underline
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      `.trim().replace(/\s+/g, ' ')}
    >
      {props.children || 'Cerrar sesión'}
    </SignOutButton>
  )
}
