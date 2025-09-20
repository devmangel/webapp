'use client'
import React from 'react'
import { motion } from 'motion/react'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

export function AuthCard({ children, title, subtitle, className = '' }: AuthCardProps) {
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Glassmorphism Background */}
        <div className="glass-morphism rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700/30">
          {/* Gradient Border Effect */}
          <div className="absolute -inset-px bg-gradient-to-br from-amber-400/20 via-transparent to-amber-600/20 rounded-2xl"></div>
          
          {/* Inner Content */}
          <div className="relative bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8">
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
                {title}
              </h2>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {subtitle}
                </p>
              )}
            </motion.div>

            {/* Content with stagger animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              {children}
            </motion.div>
          </div>
        </div>

        {/* Subtle Shadow Enhancement */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-amber-400/5 to-amber-600/5 blur-xl transform translate-y-2"></div>
      </motion.div>
    </div>
  )
}
