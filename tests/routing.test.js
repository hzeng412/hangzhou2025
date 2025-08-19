/**
 * URL Routing and Navigation Tests
 * 
 * Tests for URL routing and navigation functionality
 * Requirements covered: 1.3, 1.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock Astro's i18n routing functionality
const mockAstroRouting = {
  // Simulate Astro's routing behavior
  getRouteData: (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    
    if (['en', 'zh'].includes(firstSegment)) {
      return {
        locale: firstSegment,
        route: '/' + segments.slice(1).join('/') || '/',
        params: {}
      };
    }
    
    return {
      locale: 'en',
      route: pathname,
      params: {}
    };
  },
  
  // Simulate route matching
  matchRoute: (pathname, routes) => {
    const routeData = mockAstroRouting.getRouteData(pathname);
    const matchedRoute = routes.find(route => {
      if (route.pattern === routeData.route) return true;
      if (route.pattern.includes('[') && route.pattern.includes(']')) {
        // Dynamic route matching
        const pattern = route.pattern.replace(/\[.*?\]/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(routeData.route);
      }
      return false;
    });
    
    return matchedRoute ? { ...routeData, matchedRoute } : null;
  }
};

// Mock routes configuration
const mockRoutes = [
  { pattern: '/', component: 'index.astro' },
  { pattern: '/speakers', component: 'speakers/index.astro' },
  { pattern: '/speakers/[name]', component: 'speakers/[name].astro' },
  { pattern: '/schedule', component: 'schedule.astro' },
  { pattern: '/tickets', component: 'tickets.astro' },
  { pattern: '/faq', component: 'faq.astro' },
  { pattern: '/sponsors', component: 'sponsors.astro' },
  { pattern: '/workshops', component: 'workshops/index.astro' },
  { pattern: '/workshops/[name]', component: 'workshops/[name].astro' },
  { pattern: '/venue', component: 'venue.astro' },
  { pattern: '/code-of-conduct', component: 'code-of-conduct.astro' },
  { pattern: '/privacy', component: 'privacy.astro' }
];

// Import utilities
import {
  getCurrentLocale,
  getLocalizedPath,
  getLanguageVariantUrl,
  getLocaleFromPath,
  isValidLocale,
  switchLanguage
} from '../src/i18n/utils.ts';

describe('URL Routing Tests', () => {
  let dom;
  
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Route Pattern Matching', () => {
    it('should match static routes correctly', () => {
      const testCases = [
        { path: '/', expected: { locale: 'en', route: '/' } },
        { path: '/speakers', expected: { locale: 'en', route: '/speakers' } },
        { path: '/schedule', expected: { locale: 'en', route: '/schedule' } },
        { path: '/tickets', expected: { locale: 'en', route: '/tickets' } }
      ];
      
      testCases.forEach(({ path, expected }) => {
        const result = mockAstroRouting.getRouteData(path);
        expect(result.locale).toBe(expected.locale);
        expect(result.route).toBe(expected.route);
      });
    });

    it('should match localized routes correctly', () => {
      const testCases = [
        { path: '/zh/', expected: { locale: 'zh', route: '/' } },
        { path: '/zh/speakers', expected: { locale: 'zh', route: '/speakers' } },
        { path: '/zh/schedule', expected: { locale: 'zh', route: '/schedule' } },
        { path: '/en/tickets', expected: { locale: 'en', route: '/tickets' } }
      ];
      
      testCases.forEach(({ path, expected }) => {
        const result = mockAstroRouting.getRouteData(path);
        expect(result.locale).toBe(expected.locale);
        expect(result.route).toBe(expected.route);
      });
    });

    it('should match dynamic routes correctly', () => {
      const testCases = [
        { path: '/speakers/john-doe', expected: { locale: 'en', route: '/speakers/john-doe' } },
        { path: '/zh/speakers/zhang-san', expected: { locale: 'zh', route: '/speakers/zhang-san' } },
        { path: '/workshops/react-basics', expected: { locale: 'en', route: '/workshops/react-basics' } },
        { path: '/zh/workshops/vue-advanced', expected: { locale: 'zh', route: '/workshops/vue-advanced' } }
      ];
      
      testCases.forEach(({ path, expected }) => {
        const result = mockAstroRouting.getRouteData(path);
        expect(result.locale).toBe(expected.locale);
        expect(result.route).toBe(expected.route);
      });
    });

    it('should handle route matching with patterns', () => {
      const testCases = [
        { path: '/', pattern: '/', shouldMatch: true },
        { path: '/speakers', pattern: '/speakers', shouldMatch: true },
        { path: '/speakers/john-doe', pattern: '/speakers/[name]', shouldMatch: true },
        { path: '/workshops/react-basics', pattern: '/workshops/[name]', shouldMatch: true },
        { path: '/invalid-route', pattern: '/speakers', shouldMatch: false }
      ];
      
      testCases.forEach(({ path, pattern, shouldMatch }) => {
        const routeData = mockAstroRouting.getRouteData(path);
        const matchedRoute = mockAstroRouting.matchRoute(path, [{ pattern, component: 'test.astro' }]);
        
        if (shouldMatch) {
          expect(matchedRoute).toBeTruthy();
          expect(matchedRoute.matchedRoute.pattern).toBe(pattern);
        } else {
          expect(matchedRoute).toBeFalsy();
        }
      });
    });
  });

  describe('Locale Detection from URLs', () => {
    it('should detect locale from URL path correctly', () => {
      const testCases = [
        { path: '/', expected: 'en' },
        { path: '/speakers', expected: 'en' },
        { path: '/zh/', expected: 'zh' },
        { path: '/zh/speakers', expected: 'zh' },
        { path: '/en/schedule', expected: 'en' },
        { path: '/invalid/path', expected: 'en' }, // fallback to default
        { path: '', expected: 'en' } // empty path
      ];
      
      testCases.forEach(({ path, expected }) => {
        const result = getLocaleFromPath(path);
        expect(result).toBe(expected);
      });
    });

    it('should validate locales correctly', () => {
      const testCases = [
        { locale: 'en', expected: true },
        { locale: 'zh', expected: true },
        { locale: 'fr', expected: false },
        { locale: 'es', expected: false },
        { locale: '', expected: false },
        { locale: 'invalid', expected: false }
      ];
      
      testCases.forEach(({ locale, expected }) => {
        const result = isValidLocale(locale);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Path Generation', () => {
    it('should generate correct localized paths', () => {
      const testCases = [
        { path: '/', locale: 'en', expected: '/' },
        { path: '/speakers', locale: 'en', expected: '/speakers' },
        { path: '/', locale: 'zh', expected: '/zh/' },
        { path: '/speakers', locale: 'zh', expected: '/zh/speakers' },
        { path: '/schedule', locale: 'zh', expected: '/zh/schedule' },
        { path: 'speakers', locale: 'zh', expected: '/zh/speakers' }, // handle missing leading slash
        { path: '', locale: 'zh', expected: '/zh/' } // handle empty path
      ];
      
      testCases.forEach(({ path, locale, expected }) => {
        const result = getLocalizedPath(path, locale);
        expect(result).toBe(expected);
      });
    });

    it('should generate language variant URLs correctly', () => {
      const testCases = [
        { currentPath: '/speakers', targetLocale: 'zh', expected: '/zh/speakers' },
        { currentPath: '/zh/speakers', targetLocale: 'en', expected: '/speakers' },
        { currentPath: '/', targetLocale: 'zh', expected: '/zh/' },
        { currentPath: '/zh/', targetLocale: 'en', expected: '/' },
        { currentPath: '/zh/schedule', targetLocale: 'zh', expected: '/zh/schedule' }, // same locale
        { currentPath: '/speakers/john-doe', targetLocale: 'zh', expected: '/zh/speakers/john-doe' },
        { currentPath: '/zh/workshops/react', targetLocale: 'en', expected: '/workshops/react' }
      ];
      
      testCases.forEach(({ currentPath, targetLocale, expected }) => {
        const result = getLanguageVariantUrl(currentPath, targetLocale);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Navigation State Management', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(global, 'localStorage', {
        value: localStorageMock,
        writable: true
      });
    });

    it('should maintain navigation state during language switching', () => {
      // Test different page types
      const testCases = [
        { 
          currentPath: '/speakers', 
          targetLocale: 'zh',
          expectedPath: '/zh/speakers',
          pageType: 'static'
        },
        { 
          currentPath: '/speakers/john-doe', 
          targetLocale: 'zh',
          expectedPath: '/zh/speakers/john-doe',
          pageType: 'dynamic'
        },
        { 
          currentPath: '/zh/workshops/react-basics', 
          targetLocale: 'en',
          expectedPath: '/workshops/react-basics',
          pageType: 'dynamic'
        }
      ];
      
      testCases.forEach(({ currentPath, targetLocale, expectedPath, pageType }) => {
        // Create a new window object for each test case
        const mockWindow = {
          location: { pathname: currentPath, href: '' }
        };
        
        // Replace global window temporarily
        const originalWindow = global.window;
        global.window = mockWindow;
        
        // Simulate language switching
        switchLanguage(targetLocale);
        
        // Verify localStorage was updated
        expect(localStorage.setItem).toHaveBeenCalledWith('preferred-language', targetLocale);
        
        // Verify URL was updated correctly
        expect(mockWindow.location.href).toBe(expectedPath);
        
        // Restore original window
        global.window = originalWindow;
      });
    });

    it('should handle navigation between different page types', () => {
      const navigationScenarios = [
        {
          from: { path: '/', locale: 'en' },
          to: { path: '/speakers', locale: 'en' },
          expected: '/speakers'
        },
        {
          from: { path: '/zh/', locale: 'zh' },
          to: { path: '/speakers', locale: 'zh' },
          expected: '/zh/speakers'
        },
        {
          from: { path: '/speakers', locale: 'en' },
          to: { path: '/speakers/john-doe', locale: 'en' },
          expected: '/speakers/john-doe'
        },
        {
          from: { path: '/zh/speakers', locale: 'zh' },
          to: { path: '/speakers/zhang-san', locale: 'zh' },
          expected: '/zh/speakers/zhang-san'
        }
      ];
      
      navigationScenarios.forEach(({ from, to, expected }) => {
        const result = getLocalizedPath(to.path, to.locale);
        expect(result).toBe(expected);
      });
    });
  });

  describe('URL Validation and Error Handling', () => {
    it('should handle invalid URLs gracefully', () => {
      const invalidUrls = [
        '/invalid-locale/speakers',
        '/fr/schedule', // unsupported locale
        '//double-slash',
        '/zh//double-slash',
        null,
        undefined,
        ''
      ];
      
      invalidUrls.forEach(url => {
        expect(() => {
          const locale = getLocaleFromPath(url);
          expect(['en', 'zh'].includes(locale)).toBe(true); // Should fallback to valid locale
        }).not.toThrow();
      });
    });

    it('should handle malformed paths in route generation', () => {
      const malformedPaths = [
        null,
        undefined,
        '',
        '///',
        '/zh//speakers',
        '/zh/speakers///'
      ];
      
      malformedPaths.forEach(path => {
        expect(() => {
          const result = getLocalizedPath(path, 'zh');
          expect(typeof result).toBe('string');
          expect(result.startsWith('/')).toBe(true);
        }).not.toThrow();
      });
    });
  });

  describe('SEO and Canonical URLs', () => {
    it('should generate correct canonical URLs for different locales', () => {
      const testCases = [
        {
          path: '/speakers',
          locale: 'en',
          expectedCanonical: 'https://hangzhou2025.gosim.org/speakers'
        },
        {
          path: '/speakers',
          locale: 'zh',
          expectedCanonical: 'https://hangzhou2025.gosim.org/zh/speakers'
        },
        {
          path: '/',
          locale: 'en',
          expectedCanonical: 'https://hangzhou2025.gosim.org/'
        },
        {
          path: '/',
          locale: 'zh',
          expectedCanonical: 'https://hangzhou2025.gosim.org/zh/'
        }
      ];
      
      testCases.forEach(({ path, locale, expectedCanonical }) => {
        const localizedPath = getLocalizedPath(path, locale);
        const canonical = `https://hangzhou2025.gosim.org${localizedPath}`;
        expect(canonical).toBe(expectedCanonical);
      });
    });

    it('should generate correct hreflang URLs', () => {
      const testPath = '/speakers';
      const baseUrl = 'https://hangzhou2025.gosim.org';
      
      const hreflangs = [
        {
          locale: 'en',
          href: `${baseUrl}${getLocalizedPath(testPath, 'en')}`,
          hreflang: 'en'
        },
        {
          locale: 'zh',
          href: `${baseUrl}${getLocalizedPath(testPath, 'zh')}`,
          hreflang: 'zh-CN'
        }
      ];
      
      expect(hreflangs[0].href).toBe('https://hangzhou2025.gosim.org/speakers');
      expect(hreflangs[1].href).toBe('https://hangzhou2025.gosim.org/zh/speakers');
      expect(hreflangs[0].hreflang).toBe('en');
      expect(hreflangs[1].hreflang).toBe('zh-CN');
    });
  });

  describe('Dynamic Route Parameters', () => {
    it('should handle speaker detail pages correctly', () => {
      const speakerSlugs = [
        'john-doe',
        'zhang-san',
        'mehdi-snene',
        'speaker-with-long-name'
      ];
      
      speakerSlugs.forEach(slug => {
        const enPath = `/speakers/${slug}`;
        const zhPath = `/zh/speakers/${slug}`;
        
        // Test English route
        const enRouteData = mockAstroRouting.getRouteData(enPath);
        expect(enRouteData.locale).toBe('en');
        expect(enRouteData.route).toBe(enPath);
        
        // Test Chinese route
        const zhRouteData = mockAstroRouting.getRouteData(zhPath);
        expect(zhRouteData.locale).toBe('zh');
        expect(zhRouteData.route).toBe(enPath); // Should normalize to base route
        
        // Test route matching
        const enMatch = mockAstroRouting.matchRoute(enPath, mockRoutes);
        const zhMatch = mockAstroRouting.matchRoute(zhPath, mockRoutes);
        
        expect(enMatch).toBeTruthy();
        expect(zhMatch).toBeTruthy();
        expect(enMatch.matchedRoute.pattern).toBe('/speakers/[name]');
        expect(zhMatch.matchedRoute.pattern).toBe('/speakers/[name]');
      });
    });

    it('should handle workshop detail pages correctly', () => {
      const workshopSlugs = [
        'react-basics',
        'vue-advanced',
        'cangjie-workshop',
        'sglang-workshop'
      ];
      
      workshopSlugs.forEach(slug => {
        const enPath = `/workshops/${slug}`;
        const zhPath = `/zh/workshops/${slug}`;
        
        // Test route generation
        expect(getLocalizedPath(`/workshops/${slug}`, 'en')).toBe(enPath);
        expect(getLocalizedPath(`/workshops/${slug}`, 'zh')).toBe(zhPath);
        
        // Test language switching
        expect(getLanguageVariantUrl(enPath, 'zh')).toBe(zhPath);
        expect(getLanguageVariantUrl(zhPath, 'en')).toBe(enPath);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete navigation flow', () => {
      // Simulate user starting on English homepage
      let currentPath = '/';
      let currentLocale = getLocaleFromPath(currentPath);
      expect(currentLocale).toBe('en');
      
      // Navigate to speakers page
      currentPath = getLocalizedPath('/speakers', currentLocale);
      expect(currentPath).toBe('/speakers');
      
      // Switch to Chinese
      currentPath = getLanguageVariantUrl(currentPath, 'zh');
      currentLocale = getLocaleFromPath(currentPath);
      expect(currentPath).toBe('/zh/speakers');
      expect(currentLocale).toBe('zh');
      
      // Navigate to specific speaker
      const speakerSlug = 'mehdi-snene';
      currentPath = getLocalizedPath(`/speakers/${speakerSlug}`, currentLocale);
      expect(currentPath).toBe(`/zh/speakers/${speakerSlug}`);
      
      // Switch back to English
      currentPath = getLanguageVariantUrl(currentPath, 'en');
      currentLocale = getLocaleFromPath(currentPath);
      expect(currentPath).toBe(`/speakers/${speakerSlug}`);
      expect(currentLocale).toBe('en');
      
      // Navigate to different section
      currentPath = getLocalizedPath('/schedule', currentLocale);
      expect(currentPath).toBe('/schedule');
    });

    it('should maintain URL structure consistency', () => {
      const pages = [
        '/',
        '/speakers',
        '/speakers/john-doe',
        '/schedule',
        '/tickets',
        '/faq',
        '/sponsors',
        '/workshops',
        '/workshops/react-basics',
        '/venue',
        '/code-of-conduct',
        '/privacy'
      ];
      
      pages.forEach(page => {
        // Test English URLs (should not have locale prefix)
        const enUrl = getLocalizedPath(page, 'en');
        expect(enUrl).toBe(page);
        expect(enUrl.startsWith('/en/')).toBe(false);
        
        // Test Chinese URLs (should have /zh/ prefix)
        const zhUrl = getLocalizedPath(page, 'zh');
        if (page === '/') {
          expect(zhUrl).toBe('/zh/');
        } else {
          expect(zhUrl).toBe(`/zh${page}`);
        }
        
        // Test bidirectional conversion
        expect(getLanguageVariantUrl(enUrl, 'zh')).toBe(zhUrl);
        expect(getLanguageVariantUrl(zhUrl, 'en')).toBe(enUrl);
      });
    });
  });
});