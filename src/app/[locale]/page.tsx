import React from "react";

import HomeClient from "../components/home/homeClient";
import PrimaryButton from "../components/ui/PrimaryButton";

// This page handles localized routes like /en, /es, etc.
export default async function LocaleHomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-app-background)]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-[var(--color-app-foreground)] sm:text-5xl">
              Bienvenido a la App
            </h1>
          </div>

          {/* Call to Action */}
          <PrimaryButton text="Ir a iniciar sesión" href="/es/iniciar-session" />

          {/* Home Client Component */}
          <div className="mt-8">
            <HomeClient />
          </div>
        </div>
      </div>
    </div>
  );
}
