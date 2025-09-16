import React from 'react'
import { AuthLayout } from '../../components/auth/shared/AuthLayout'

export default function LoginLoading() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            {/* Title Skeleton */}
            <div className="text-center mb-8">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-md w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mx-auto"></div>
            </div>
            
            {/* Provider Buttons Skeleton */}
            <div className="space-y-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            
            {/* Divider Skeleton */}
            <div className="relative mb-6">
              <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="absolute inset-0 flex justify-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            
            {/* Email Button Skeleton */}
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            
            {/* Link Skeleton */}
            <div className="text-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
