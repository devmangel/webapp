import React from "react";
import HomeClient from "../components/home/homeClient";
import { GoogleSignInButton, GitHubSignInButton } from "../components/auth/SignInButton";
import SignOutButton from "../components/auth/SignOutButton";
import { getCurrentSession, isAuthenticated } from "../lib/auth";

// This page handles localized routes like /en, /es, etc.
export default async function LocaleHomePage() {
  // Server-side authentication check
  const session = await getCurrentSession();
  const authenticated = await isAuthenticated();

  return (
    <div className="min-h-screen bg-background-light ">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-foreground-light dark:text-foreground-dark sm:text-5xl">
              Bienvenido a la App
            </h1>
            <p className="mt-4 text-xl text-text-secondary-light dark:text-text-secondary-dark">
              Sistema de autenticación con NextAuth.js
            </p>
          </div>

          {/* Authentication Section */}
          <div className="mt-12 shadow-lg rounded-lg bg-neutral-light dark:bg-neutral-dark border border-border-light dark:border-border-dark">
            <div className="px-4 py-5 sm:p-6">
              {authenticated && session?.user ? (
                // Usuario autenticado
                <div className="text-center">
                  <div className="mb-6">
                    {session.user.image && (
                      <img
                        className="mx-auto h-24 w-24 rounded-full"
                        src={session.user.image}
                        alt={session.user.name || 'Usuario'}
                      />
                    )}
                    <h2 className="mt-4 text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                      ¡Hola, {session.user.name || session.user.email}!
                    </h2>
                    <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                      Has iniciado sesión correctamente
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Sesión activa
                          </p>
                          <p className="mt-1 text-sm text-green-700">
                            Email: {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <SignOutButton 
                      callbackUrl="/"
                    />
                  </div>
                </div>
              ) : (
                // Usuario no autenticado
                <div className="text-center">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                      Iniciar Sesión
                    </h2>
                    <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                      Elige tu método de autenticación preferido
                    </p>
                  </div>
                  
                  <div className="space-y-4 max-w-sm mx-auto">
                    <GoogleSignInButton 
                      callbackUrl="/dashboard"                      
                    />
                    
                    <GitHubSignInButton 
                      callbackUrl="/dashboard"                      
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Home Client Component */}
          <div className="mt-8">
            <HomeClient />
          </div>
        </div>
      </div>
    </div>
  );
}
