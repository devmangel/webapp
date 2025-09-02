import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Función para validar locales
function isValidLocale(locale: string): locale is "en" | "es" {
  return routing.locales.includes(locale as "en" | "es");
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Resuelve el valor de `requestLocale` o asigna el idioma predeterminado
  const locale = (await requestLocale) || routing.defaultLocale;

  // Asegúrate de que el idioma solicitado es válido
  const validLocale = isValidLocale(locale) ? locale : routing.defaultLocale;

  // Carga los mensajes de traducción
  const messages = (await import(`../app/locales/${validLocale}.json`)).default;

  return {
    locale: validLocale,
    messages,
  };
});
