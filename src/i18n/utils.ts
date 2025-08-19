import type { APIContext } from 'astro';

// Translation function type
export type TranslationFunction = (key: string, params?: Record<string, string>) => string;

// I18n utilities interface
export interface I18nUtils {
  t: TranslationFunction;
  getCurrentLocale(): string;
  getLocalizedPath(path: string, locale?: string): string;
  getAlternateLinks(): Array<{locale: string, href: string}>;
}

// Supported locales
export const LOCALES = ['en', 'zh'] as const;
export const DEFAULT_LOCALE = 'en';

// Type for supported locales
export type Locale = typeof LOCALES[number];

// Load translation files
export const translations: Record<Locale, Record<string, any>> = {
  en: {},
  zh: {}
};

// Function to load translations (will be populated when files are imported)
export async function loadTranslations() {
  try {
    const enTranslations = await import('./locales/en.json');
    const zhTranslations = await import('./locales/zh.json');
    
    translations.en = enTranslations.default;
    translations.zh = zhTranslations.default;
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
}

// Get nested object value by dot notation key
function getNestedValue(obj: any, key: string): string | undefined {
  return key.split('.').reduce((current, keyPart) => {
    return current && current[keyPart];
  }, obj);
}

// Translation function
export function createTranslationFunction(locale: Locale): TranslationFunction {
  return (key: string, params?: Record<string, string>): string => {
    let translation = getNestedValue(translations[locale], key);
    
    // Fallback to default locale if translation not found
    if (!translation && locale !== DEFAULT_LOCALE) {
      translation = getNestedValue(translations[DEFAULT_LOCALE], key);
    }
    
    // Fallback to key if no translation found
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
      return key;
    }
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), value);
      });
    }
    
    return translation;
  };
}

// Get current locale from Astro context
export function getCurrentLocale(context?: APIContext): Locale {
  // Check if locale is set in context.locals (from middleware)
  if (context?.locals?.locale) {
    return context.locals.locale as Locale;
  }
  
  // Check Astro's built-in currentLocale
  if (context?.currentLocale) {
    return context.currentLocale as Locale;
  }
  
  // Fallback for client-side or when context is not available
  if (typeof window !== 'undefined' && window.location) {
    const pathname = window.location.pathname || '/';
    const localeFromPath = pathname.split('/')[1];
    if (LOCALES.includes(localeFromPath as Locale)) {
      return localeFromPath as Locale;
    }
  }
  
  return DEFAULT_LOCALE;
}

// Generate localized path
export function getLocalizedPath(path: string, locale?: Locale): string {
  const targetLocale = locale || DEFAULT_LOCALE;
  
  // Ensure path is defined and is a string
  const safePath = path || '/';
  
  // Remove leading slash if present
  const cleanPath = safePath.startsWith('/') ? safePath.slice(1) : safePath;
  
  // For default locale, don't add prefix
  if (targetLocale === DEFAULT_LOCALE) {
    return `/${cleanPath}`;
  }
  
  // For other locales, add locale prefix
  return `/${targetLocale}/${cleanPath}`;
}

// Generate alternate language links for SEO
export function getAlternateLinks(currentPath: string): Array<{locale: Locale, href: string, hreflang: string}> {
  // Ensure currentPath is defined and is a string
  const safePath = currentPath || '/';
  
  // Remove current locale from path to get the base path
  const currentLocale = getLocaleFromPath(safePath);
  let cleanPath = safePath;
  
  if (currentLocale !== DEFAULT_LOCALE) {
    // Remove locale prefix (e.g., /zh/speakers -> /speakers)
    cleanPath = safePath.replace(new RegExp(`^/${currentLocale}`), '') || '/';
  }
  
  return LOCALES.map(locale => ({
    locale,
    href: getLocalizedPath(cleanPath, locale),
    hreflang: locale === 'zh' ? 'zh-CN' : locale
  }));
}

// Generate language variant URLs for the current page
export function getLanguageVariantUrl(currentPath: string, targetLocale: Locale): string {
  // Ensure currentPath is defined and is a string
  const safePath = currentPath || '/';
  
  // Remove current locale from path if present
  const currentLocale = getLocaleFromPath(safePath);
  let cleanPath = safePath;
  
  if (currentLocale !== DEFAULT_LOCALE) {
    // Remove locale prefix (e.g., /zh/speakers -> /speakers)
    cleanPath = safePath.replace(new RegExp(`^/${currentLocale}`), '') || '/';
  }
  
  // Generate new path with target locale
  return getLocalizedPath(cleanPath, targetLocale);
}

// Client-side language switching function
export function switchLanguage(targetLocale: Locale): void {
  if (typeof window === 'undefined') return;
  
  const currentPath = window.location.pathname;
  const newUrl = getLanguageVariantUrl(currentPath, targetLocale);
  
  // Store language preference
  try {
    localStorage.setItem('preferred-language', targetLocale);
  } catch (e) {
    // Ignore localStorage errors
  }
  
  // Navigate to new URL
  window.location.href = newUrl;
}

// Check if locale is supported
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

// Get locale from URL path
export function getLocaleFromPath(path: string): Locale {
  // Ensure path is defined and is a string
  const safePath = path || '/';
  const segments = safePath.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (isValidLocale(firstSegment)) {
    return firstSegment;
  }
  
  return DEFAULT_LOCALE;
}