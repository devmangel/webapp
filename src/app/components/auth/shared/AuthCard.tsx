import React from 'react'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

export function AuthCard({ children, title, subtitle, className = '' }: AuthCardProps) {
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-textSecondary-light dark:text-textSecondary-dark">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
