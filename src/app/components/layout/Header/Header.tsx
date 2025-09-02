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
  variant = 'default'
}: HeaderProps) {
  // Server-side session fetch
  const session = await getCurrentSession()

  // Get variant styles
  const getVariantStyles = () => {
    const base = `
      sticky top-0 z-50 w-full
      border-b border-[var(--color-border)]
      transition-all duration-200 ease-in-out
    `

    const variants = {
      default: `
        bg-[var(--color-app-background)]
        backdrop-blur-sm
      `,
      transparent: `
        bg-[var(--color-app-background)]/80
        backdrop-blur-md
      `,
      elevated: `
        bg-[var(--color-app-background)]
        shadow-sm
        backdrop-blur-sm
      `
    }

    return `${base} ${variants[variant]}`.trim().replace(/\s+/g, ' ')
  }

  return (
    <header className={`${getVariantStyles()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo Section */}
          <div className="flex items-center">
            <a
              href={brand.href || '/'}
              className={`
                flex items-center space-x-2
                text-[var(--color-text-primary)]
                hover:text-[var(--color-primary)]
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                rounded-md px-2 py-1
              `.trim().replace(/\s+/g, ' ')}
            >
              {brand.logo && (
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="h-8 w-8"
                />
              )}
              {brand.name && (
                <span className="text-xl font-bold">
                  {brand.name}
                </span>
              )}
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium
                  text-[var(--color-text-primary)]
                  hover:text-[var(--color-primary)]
                  hover:bg-[var(--color-neutral)]
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                `.trim().replace(/\s+/g, ' ')}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="flex items-center space-x-1">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              </a>
            ))}
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
