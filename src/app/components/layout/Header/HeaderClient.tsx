'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Session } from 'next-auth'
import { NavItem } from '../../../../types/header'
import ThemeToggle from '../../ui/ThemeToggle'
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
      <div className="hidden md:flex md:items-center md:space-x-4">

        {/* Auth Section */}
        {showAuth && (
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                {session.user?.name && (
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Hola, {session.user.name}
                  </span>
                )}
                <SignOutButton className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg
                  text-[var(--color-text-secondary)]
                  hover:text-[var(--color-text-primary)]
                  hover:bg-[var(--color-neutral)]/50
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
                  transition-all duration-300
                `.trim().replace(/\s+/g, ' ')} />
              </div>
            ) : (
              <Link
                href="/iniciar-session"
                className={`
                  px-4 py-1.5 text-sm font-medium rounded-lg
                  text-[var(--color-text-secondary)]
                  hover:text-[var(--color-text-primary)]
                  hover:bg-[var(--color-neutral)]/30
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
                  transition-all duration-300
                  border border-[var(--color-border)]/50
                  hover:border-[var(--color-border)]
                `.trim().replace(/\s+/g, ' ')}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center space-x-3">
        <ThemeToggle />
        <button
          onClick={toggleMobileMenu}
          className={`
            inline-flex items-center justify-center p-2 rounded-lg
            text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)]
            hover:bg-[var(--color-neutral)]/30
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
            transition-all duration-300
          `.trim().replace(/\s+/g, ' ')}
          aria-expanded={isMobileMenuOpen}
          aria-label="Abrir menú de navegación"
        >
          <svg
            className="h-5 w-5"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12h18M3 6h18M3 18h18"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Full Screen Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />

          {/* Full Screen Menu Panel */}
          <div className="relative h-full bg-[var(--color-app-background)]/95 backdrop-blur-xl flex flex-col">
            {/* Header with X button */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--color-border)]/30">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="flex items-center space-x-3 text-[var(--color-text-primary)]"
                  onClick={toggleMobileMenu}
                >
                  <span className="text-lg font-semibold tracking-tight">
                    MiApp
                  </span>
                </Link>
              </div>
              
              {/* Dedicated X Close Button */}
              <button
                onClick={toggleMobileMenu}
                className={`
                  inline-flex items-center justify-center p-2 rounded-lg
                  text-[var(--color-text-primary)]
                  hover:text-[var(--color-primary)]
                  hover:bg-[var(--color-neutral)]/30
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
                  transition-all duration-300
                `.trim().replace(/\s+/g, ' ')}
                aria-label="Cerrar menú"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Centered Content */}
            <div className="flex-1 flex flex-col justify-center px-8 space-y-8">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const linkContent = (
                    <span className="flex items-center justify-center space-x-3">
                      {item.icon}
                      <span className="text-xl font-medium">{item.label}</span>
                    </span>
                  )

                  const className = `
                    block px-6 py-4 rounded-xl text-center
                    text-[var(--color-text-primary)]
                    hover:text-[var(--color-primary)]
                    hover:bg-[var(--color-neutral)]/30
                    transition-all duration-300
                    active:scale-95
                  `.trim().replace(/\s+/g, ' ')

                  return item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      className={className}
                      onClick={toggleMobileMenu}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {linkContent}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={className}
                      onClick={toggleMobileMenu}
                    >
                      {linkContent}
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Auth Section */}
              {showAuth && (
                <div className="space-y-4 pt-6">
                  {session ? (
                    <div className="space-y-4 text-center">
                      {session.user?.name && (
                        <p className="text-lg font-medium text-[var(--color-text-primary)]">
                          Hola, {session.user.name}
                        </p>
                      )}
                      <SignOutButton className={`
                        w-full px-6 py-4 text-lg font-medium rounded-xl
                        text-[var(--color-text-primary)]
                        hover:text-[var(--color-primary)]
                        hover:bg-[var(--color-neutral)]/30
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
                        transition-all duration-300
                        active:scale-95
                      `.trim().replace(/\s+/g, ' ')} />
                    </div>
                  ) : (
                    <Link
                      href="/iniciar-session"
                      className={`
                        block w-full px-6 py-4 text-base font-medium rounded-xl text-center
                        text-[var(--color-text-primary)] bg-red
                        hover:text-[var(--color-primary)]
                        hover:bg-[var(--color-neutral)]/30
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
                        transition-all duration-300
                        border border-[var(--color-border)]/50
                        hover:border-[var(--color-border)]
                        active:scale-95
                      `.trim().replace(/\s+/g, ' ')}
                      onClick={toggleMobileMenu}
                    >
                      Iniciar sesión
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Theme Toggle */}
            <div className="flex justify-center pb-8">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
