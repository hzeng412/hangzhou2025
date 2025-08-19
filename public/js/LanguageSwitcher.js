/**
 * Language Switcher Client-Side Functionality
 * Handles language switching with proper URL generation and state management
 */

class LanguageSwitcher {
  constructor() {
    this.LOCALES = ['en', 'zh'];
    this.DEFAULT_LOCALE = 'en';
    this.init();
  }

  init() {
    // Initialize language switcher functionality
    this.bindEvents();
    this.detectLanguagePreference();
  }

  bindEvents() {
    // Bind click events to language switcher links
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-language-switch]');
      if (target) {
        event.preventDefault();
        const targetLocale = target.getAttribute('data-language-switch');
        this.switchLanguage(targetLocale);
      }
    });

    // Handle keyboard navigation for dropdown
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeAllDropdowns();
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.language-dropdown')) {
        this.closeAllDropdowns();
      }
    });
  }

  detectLanguagePreference() {
    // Check if user has a stored language preference
    try {
      const storedLanguage = localStorage.getItem('preferred-language');
      if (storedLanguage && this.LOCALES.includes(storedLanguage)) {
        const currentLocale = this.getCurrentLocale();
        if (currentLocale !== storedLanguage) {
          // Optionally redirect to preferred language
          // Uncomment the line below to enable automatic redirection
          // this.switchLanguage(storedLanguage);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  getCurrentLocale() {
    const pathname = window.location.pathname || '/';
    const localeFromPath = pathname.split('/')[1];
    
    if (this.LOCALES.includes(localeFromPath)) {
      return localeFromPath;
    }
    
    return this.DEFAULT_LOCALE;
  }

  getLocalizedPath(path, locale) {
    const targetLocale = locale || this.DEFAULT_LOCALE;
    
    // Ensure path is defined and is a string
    const safePath = path || '/';
    
    // Remove leading slash if present
    const cleanPath = safePath.startsWith('/') ? safePath.slice(1) : safePath;
    
    // For default locale, don't add prefix
    if (targetLocale === this.DEFAULT_LOCALE) {
      return cleanPath === '' ? '/' : `/${cleanPath}`;
    }
    
    // For other locales, add locale prefix
    return cleanPath === '' ? `/${targetLocale}/` : `/${targetLocale}/${cleanPath}`;
  }

  getLanguageVariantUrl(currentPath, targetLocale) {
    // Ensure currentPath is defined and is a string
    const safePath = currentPath || '/';
    
    // Remove current locale from path if present
    const currentLocale = this.getCurrentLocale();
    let cleanPath = safePath;
    
    if (currentLocale !== this.DEFAULT_LOCALE) {
      // Remove locale prefix (e.g., /zh/speakers -> /speakers)
      cleanPath = safePath.replace(new RegExp(`^/${currentLocale}`), '') || '/';
    }
    
    // Ensure clean path starts with /
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    
    // Generate new path with target locale
    return this.getLocalizedPath(cleanPath, targetLocale);
  }

  switchLanguage(targetLocale) {
    if (!this.LOCALES.includes(targetLocale)) {
      console.warn(`Invalid locale: ${targetLocale}`);
      return;
    }

    const currentPath = window.location.pathname;
    const newUrl = this.getLanguageVariantUrl(currentPath, targetLocale);
    
    // Store language preference
    try {
      localStorage.setItem('preferred-language', targetLocale);
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Add loading state to language switchers
    this.setLoadingState(true);
    
    // Navigate to new URL
    window.location.href = newUrl;
  }

  setLoadingState(isLoading) {
    const switchers = document.querySelectorAll('.language-switcher');
    switchers.forEach(switcher => {
      if (isLoading) {
        switcher.classList.add('loading');
        switcher.style.opacity = '0.6';
        switcher.style.pointerEvents = 'none';
      } else {
        switcher.classList.remove('loading');
        switcher.style.opacity = '';
        switcher.style.pointerEvents = '';
      }
    });
  }

  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.language-dropdown-content');
    dropdowns.forEach(dropdown => {
      dropdown.style.display = 'none';
    });
  }

  // Public API methods
  static switchTo(locale) {
    const instance = window.languageSwitcher || new LanguageSwitcher();
    instance.switchLanguage(locale);
  }

  static getCurrentLanguage() {
    const instance = window.languageSwitcher || new LanguageSwitcher();
    return instance.getCurrentLocale();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.languageSwitcher = new LanguageSwitcher();
  });
} else {
  window.languageSwitcher = new LanguageSwitcher();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageSwitcher;
}