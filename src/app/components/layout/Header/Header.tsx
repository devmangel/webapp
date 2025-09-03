import Image from 'next/image'
import Link from 'next/link'
import { getCurrentSession } from '../../../lib/auth/server'
import { HeaderProps } from '../../../../types/header'
import HeaderClient from './HeaderClient'

const defaultNavigation = [
  { label: 'Inicio', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Blog', href: '/blog' }
]

const defaultBrand = {
  name: 'MiApp',
  href: '/'
}

export default async function Header({
  brand = defaultBrand,
  navigation = defaultNavigation,
  showAuth = true,
  className = '',
  variant = 'elevated'
}: HeaderProps) {
  // Server-side session fetch
  const session = await getCurrentSession()

  // Get variant styles - Minimalist approach
  const getVariantStyles = () => {
    const base = `
      sticky top-0 z-50 w-full
      transition-all duration-300 ease-out
    `

    const variants = {
      default: `
        bg-[var(--color-app-background)]/95
        backdrop-blur-md
        border-b border-[var(--color-border)]/50
      `,
      transparent: `
        bg-[var(--color-app-background)]/80
        backdrop-blur-md
      `,
      elevated: `
        bg-[var(--color-app-background)]
        shadow-sm border-b border-[var(--color-border)]/30
        backdrop-blur-md
      `
    }

    return `${base} ${variants[variant]}`.trim().replace(/\s+/g, ' ')
  }

  return (
    <header className={`${getVariantStyles()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand/Logo Section */}
          <div className="flex items-center">
            <Link
              href={brand.href || '/'}
              className={`
                flex items-center space-x-3
                text-[var(--color-text-primary)]
                hover:text-[var(--color-primary)]
                transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
                rounded-lg px-1 py-1
              `.trim().replace(/\s+/g, ' ')}
            >
              {brand.logo && (
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              )}
              {brand.name && (
                <span className="text-lg font-semibold tracking-tight">
                  {brand.name}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => {
              const linkContent = (
                <span className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )

              const className = `
                relative px-3 py-2 text-base font-medium
                text-[var(--color-text-primary)]
                hover:text-[var(--color-text-primary)]
                transition-all duration-300
                focus:outline-none
                before:absolute before:bottom-0 before:left-0 before:w-0 
                before:h-0.5 before:bg-[var(--color-primary)]
                before:transition-all before:duration-300
                hover:before:w-full
              `.trim().replace(/\s+/g, ' ')

              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  className={className}
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
                >
                  {linkContent}
                </Link>
              )
            })}
          </nav>

          {/* Client-side interactive components */}
          <HeaderClient
            navigation={navigation}
            showAuth={showAuth}
            session={session}
          />
        </div>
      </div>
    </header>
  )
}
