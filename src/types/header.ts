export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  external?: boolean
  submenu?: NavItem[]
}

export interface BrandConfig {
  logo?: string
  name?: string
  href?: string
}

export interface HeaderProps {
  brand?: BrandConfig
  navigation?: NavItem[]
  showAuth?: boolean
  className?: string
  variant?: 'default' | 'transparent' | 'elevated'
}

export type HeaderVariant = 'default' | 'transparent' | 'elevated'
