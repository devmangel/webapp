import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// Configuración de idiomas
export const routing = defineRouting({
  locales: ["en", "es", "zh", "ar"] as const,
  defaultLocale: "es" as const,
  // Forzar prefijo de locale siempre, incluyendo para el idioma por defecto
  localePrefix: "always",
  // Habilitar detección de locale
  localeDetection: false
});

// APIs de navegación traducidas
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

// Exportar tipo para validación de locales
export type Locale = typeof routing.locales[number];

// Función helper para validación de tipo
export function isValidLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}
