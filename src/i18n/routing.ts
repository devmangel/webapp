import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// Configuración de idiomas
export const routing = defineRouting({
  locales: ["en", "es", "zh", "ar"] as const,
  defaultLocale: "es" as const,
  // Usar siempre prefijo de locale para evitar bucles con la redirección de '/'
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
