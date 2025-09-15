import { MetadataRoute } from 'next'
import { routing } from '../i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://miapp.com' // Replace with your actual domain
  const currentDate = new Date()

  // Helper function to generate URLs for all locales
  const generateLocalizedUrls = (path: string, priority: number = 0.8, changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly') => {
    return routing.locales.map(locale => {
      const url = locale === routing.defaultLocale 
        ? `${baseUrl}${path}` 
        : `${baseUrl}/${locale}${path}`
      
      return {
        url,
        lastModified: currentDate,
        changeFrequency,
        priority,
      }
    })
  }

  const sitemap: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    ...generateLocalizedUrls('/', 1.0, 'daily'),
    
    // Blog section
    ...generateLocalizedUrls('/blog', 0.9, 'daily'),
    
    // Legal pages - lower priority, updated less frequently
    ...generateLocalizedUrls('/privacidad', 0.5, 'monthly'),
    ...generateLocalizedUrls('/terminos', 0.5, 'monthly'),
  ]

  return sitemap
}
