'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import { NavItem } from '../../../../types/header'
import ThemeToggle from '../../ui/ThemeToggle'
import { GoogleSignInButton } from '../../auth/SignInButton'
import SignOutButton from '../../auth/SignOutButton'

interface HeaderClientProps {
  navigation: NavItem[]
  showAuth: boolean
  session: Session | null
}

export default function HeaderClient({
  navigation,
  showAuth,
  session
}: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Desktop Right Section */}
      <div className="hidden md:flex md:items-center md:space-x-3">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Auth Section */}
        {showAuth && (
          <div className="flex items-center space-x-3">
            {session ? (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                {session.user?.name && (
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    Hola, {session.user.name}
                  </span>
                )}
                <SignOutButton className={`
                  px-3 py-2 text-sm font-medium rounded-md
                  text-[var(--color-text-primary)]
                  bg-[var(--color-neutral)]
                  border border-[var(--color-border)]
                  hover:bg-[var(--color-app-background)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                  transition-all duration-200
                `.trim().replace(/\s+/g, ' ')} />
              </div>
            ) : (
              <GoogleSignInButton
                callbackUrl="/dashboard"
                className={`
                  px-4 py-2 text-sm font-medium rounded-md
                  text-[var(--color-text-primary)]
                  bg-[var(--color-neutral)]
                  border border-[var(--color-border)]
                  hover:bg-[var(--color-app-background)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                  transition-all duration-200
                `.trim().replace(/\s+/g, ' ')}
              >
                Iniciar sesión
              </GoogleSignInButton>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center space-x-3">
        <ThemeToggle />
        <button
          onClick={toggleMobileMenu}
          className={`
            inline-flex items-center justify-center p-2 rounded-md
            text-[var(--color-text-primary)]
            hover:text-[var(--color-primary)]
            hover:bg-[var(--color-neutral)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
            transition-colors duration-200
          `.trim().replace(/\s+/g, ' ')}
          aria-expanded={isMobileMenuOpen}
          aria-label="Abrir menú de navegación"
        >
          <svg
            className="h-6 w-6"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-16 left-0 right-0 z-50 bg-[var(--color-app-background)] border-b border-[var(--color-border)] shadow-lg md:hidden">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`
                      block px-3 py-2 rounded-md text-base font-medium
                      text-[var(--color-text-primary)]
                      hover:text-[var(--color-primary)]
                      hover:bg-[var(--color-neutral)]
                      transition-colors duration-200
                    `.trim().replace(/\s+/g, ' ')}
                    onClick={toggleMobileMenu}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                  </a>
                ))}
              </nav>

              {/* Mobile Auth Section */}
              {showAuth && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  {session ? (
                    <div className="space-y-3">
                      {session.user?.name && (
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          Hola, {session.user.name}
                        </p>
                      )}
                      <SignOutButton className={`
                        w-full px-3 py-2 text-sm font-medium rounded-md
                        text-[var(--color-text-primary)]
                        bg-[var(--color-neutral)]
                        border border-[var(--color-border)]
                        hover:bg-[var(--color-app-background)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                        transition-all duration-200
                      `.trim().replace(/\s+/g, ' ')} />
                    </div>
                  ) : (
                    <GoogleSignInButton
                      callbackUrl="/dashboard"
                      className={`
                        w-full px-4 py-2 text-sm font-medium rounded-md
                        text-[var(--color-text-primary)]
                        bg-[var(--color-neutral)]
                        border border-[var(--color-border)]
                        hover:bg-[var(--color-app-background)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                        transition-all duration-200
                      `.trim().replace(/\s+/g, ' ')}
                    >
                      Iniciar sesión
                    </GoogleSignInButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
