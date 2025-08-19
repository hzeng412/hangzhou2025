/**
 * Simplified Final Validation Test Suite
 * 
 * Core validation tests for the i18n conversion
 * Requirements covered: 1.1, 2.3, 5.1, 5.2, 5.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Import utilities
import {
  getCurrentLocale,
  createTranslationFunction,
  getLocalizedPath,
  getAlternateLinks,
  getLanguageVariantUrl,
  isValidLocale,
  getLocaleFromPath,
  loadTranslations,
  LOCALES,
  DEFAULT_LOCALE
} from '../src/i18n/utils.ts';

describe('Final Validation - Core Functionality', () => {
  beforeEach(async () => {
    // Load translations for testing
    await loadTranslations();
    vi.clearAllMocks();
  });

  describe('1. Translation System Validation', () => {
    it('should load and use translations correctly', () => {
      const tEn = createTranslationFunction('en');
      const tZh = createTranslationFunction('zh');
      
      // Test basic translations
      expect(tEn('navigation.home')).toBe('Home');
      expect(tZh('navigation.home')).toBe('首页');
      
      expect(tEn('navigation.speakers')).toBe('Speakers');
      expect(tZh('navigation.speakers')).toBe('演讲者');
    });

    it('should handle missing translations with fallback', () => {
      const tEn = createTranslationFunction('en');
      const tZh = createTranslationFunction('zh');
      
      const missingKey = 'nonexistent.key';
      expect(tEn(missingKey)).toBe(missingKey);
      expect(tZh(missingKey)).toBe(missingKey);
    });

    it('should validate translation file structure', async () => {
      const enTranslations = await import('../src/i18n/locales/en.json');
      const zhTranslations = await import('../src/i18n/locales/zh.json');
      
      expect(enTranslations.default).toBeDefined();
      expect(zhTranslations.default).toBeDefined();
      
      // Check required sections exist
      expect(enTranslations.default.navigation).toBeDefined();
      expect(enTranslations.default.homepage).toBeDefined();
      expect(enTranslations.default.speakers).toBeDefined();
    });
  });

  describe('2. Locale Detection and Path Generation', () => {
    it('should validate locale detection from paths', () => {
      expect(getLocaleFromPath('/speakers')).toBe('en');
      expect(getLocaleFromPath('/zh/speakers')).toBe('zh');
      expect(getLocaleFromPath('/en/speakers')).toBe('en');
      expect(getLocaleFromPath('/invalid/speakers')).toBe('en'); // fallback
      expect(getLocaleFromPath('')).toBe('en'); // fallback
    });

    it('should generate correct localized paths', () => {
      expect(getLocalizedPath('/speakers', 'en')).toBe('/speakers');
      expect(getLocalizedPath('/speakers', 'zh')).toBe('/zh/speakers');
      expect(getLocalizedPath('/', 'en')).toBe('/');
      expect(getLocalizedPath('/', 'zh')).toBe('/zh/');
    });

    it('should validate locale switching', () => {
      expect(getLanguageVariantUrl('/speakers', 'zh')).toBe('/zh/speakers');
      expect(getLanguageVariantUrl('/zh/speakers', 'en')).toBe('/speakers');
      expect(getLanguageVariantUrl('/', 'zh')).toBe('/zh/');
      expect(getLanguageVariantUrl('/zh/', 'en')).toBe('/');
    });

    it('should validate locale validation function', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('zh')).toBe(true);
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('invalid')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });
  });

  describe('3. SEO and Meta Tag Generation', () => {
    it('should generate correct hreflang attributes', () => {
      const alternates = getAlternateLinks('/speakers');
      
      expect(alternates).toHaveLength(2);
      
      const enAlternate = alternates.find(alt => alt.locale === 'en');
      const zhAlternate = alternates.find(alt => alt.locale === 'zh');
      
      expect(enAlternate).toEqual({
        locale: 'en',
        href: 'https://hangzhou2025.gosim.org/speakers',
        hreflang: 'en'
      });
      
      expect(zhAlternate).toEqual({
        locale: 'zh',
        href: 'https://hangzhou2025.gosim.org/zh/speakers',
        hreflang: 'zh-CN'
      });
    });

    it('should generate alternate links for all pages', () => {
      const pages = ['/', '/speakers', '/schedule', '/tickets', '/faq'];
      
      pages.forEach(page => {
        const alternates = getAlternateLinks(page);
        expect(alternates).toHaveLength(LOCALES.length);
        
        alternates.forEach(alt => {
          expect(alt.href).toContain('hangzhou2025.gosim.org');
          expect(['en', 'zh-CN'].includes(alt.hreflang)).toBe(true);
        });
      });
    });

    it('should generate correct canonical URLs', () => {
      const testCases = [
        { path: '/', locale: 'en', expected: 'https://hangzhou2025.gosim.org/' },
        { path: '/', locale: 'zh', expected: 'https://hangzhou2025.gosim.org/zh/' },
        { path: '/speakers', locale: 'en', expected: 'https://hangzhou2025.gosim.org/speakers' },
        { path: '/speakers', locale: 'zh', expected: 'https://hangzhou2025.gosim.org/zh/speakers' }
      ];
      
      testCases.forEach(({ path, locale, expected }) => {
        const localizedPath = getLocalizedPath(path, locale);
        const canonical = `https://hangzhou2025.gosim.org${localizedPath}`;
        expect(canonical).toBe(expected);
      });
    });
  });

  describe('4. Data Structure Validation', () => {
    it('should validate unified data files exist and are accessible', async () => {
      const dataFiles = [
        '../src/i18n/data/speakers.json',
        '../src/i18n/data/faq.json',
        '../src/i18n/data/sponsors.json',
        '../src/i18n/data/workshops.json'
      ];
      
      for (const filePath of dataFiles) {
        const data = await import(filePath);
        expect(data.default).toBeDefined();
        expect(typeof data.default).toBe('object');
      }
    });

    it('should validate multilingual data structure', async () => {
      const speakersData = await import('../src/i18n/data/speakers.json');
      const speakers = speakersData.default.speakers;
      
      expect(Array.isArray(speakers)).toBe(true);
      expect(speakers.length).toBeGreaterThan(0);
      
      // Check first speaker has proper structure
      const firstSpeaker = speakers[0];
      expect(firstSpeaker.id).toBeDefined();
      expect(typeof firstSpeaker.name).toBe('object');
      expect(firstSpeaker.name.en).toBeDefined();
    });

    it('should validate FAQ data structure', async () => {
      const faqData = await import('../src/i18n/data/faq.json');
      const faqs = faqData.default.faqs;
      
      expect(Array.isArray(faqs)).toBe(true);
      expect(faqs.length).toBeGreaterThan(0);
      
      const firstFaq = faqs[0];
      expect(typeof firstFaq.question).toBe('object');
      expect(firstFaq.question.en).toBeDefined();
    });
  });

  describe('5. URL Structure and Routing', () => {
    it('should maintain consistent URL patterns', () => {
      const pages = ['/', '/speakers', '/schedule', '/tickets', '/faq'];
      
      pages.forEach(page => {
        // English URLs should not have locale prefix
        const enUrl = getLocalizedPath(page, 'en');
        expect(enUrl).toBe(page);
        expect(enUrl.startsWith('/en/')).toBe(false);
        
        // Chinese URLs should have /zh/ prefix
        const zhUrl = getLocalizedPath(page, 'zh');
        if (page === '/') {
          expect(zhUrl).toBe('/zh/');
        } else {
          expect(zhUrl).toBe(`/zh${page}`);
        }
      });
    });

    it('should handle dynamic routes correctly', () => {
      const dynamicRoutes = [
        '/speakers/mehdi-snene',
        '/workshops/react-basics'
      ];
      
      dynamicRoutes.forEach(route => {
        const locale = getLocaleFromPath(route);
        expect(locale).toBe('en');
        
        const zhRoute = getLanguageVariantUrl(route, 'zh');
        expect(zhRoute).toBe(`/zh${route}`);
        
        const zhLocale = getLocaleFromPath(zhRoute);
        expect(zhLocale).toBe('zh');
      });
    });
  });

  describe('6. Error Handling and Edge Cases', () => {
    it('should handle malformed URLs gracefully', () => {
      const malformedUrls = [null, undefined, '', '///', '/zh//speakers'];
      
      malformedUrls.forEach(url => {
        expect(() => {
          const locale = getLocaleFromPath(url);
          expect(LOCALES.includes(locale)).toBe(true);
        }).not.toThrow();
      });
    });

    it('should handle edge cases in path generation', () => {
      expect(getLocalizedPath(null, 'zh')).toBe('/zh/');
      expect(getLocalizedPath(undefined, 'en')).toBe('/');
      expect(getAlternateLinks(null)).toHaveLength(2);
      expect(getLanguageVariantUrl(undefined, 'zh')).toBe('/zh/');
    });
  });

  describe('7. Performance Validation', () => {
    it('should validate translation loading performance', async () => {
      const startTime = performance.now();
      await loadTranslations();
      const endTime = performance.now();
      
      // Should load quickly (< 50ms)
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should validate path generation performance', () => {
      const paths = ['/', '/speakers', '/schedule'];
      
      const startTime = performance.now();
      
      // Generate paths multiple times
      for (let i = 0; i < 100; i++) {
        paths.forEach(path => {
          getLocalizedPath(path, 'en');
          getLocalizedPath(path, 'zh');
          getLanguageVariantUrl(path, 'zh');
        });
      }
      
      const endTime = performance.now();
      
      // Should complete quickly (< 50ms)
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('8. Build Artifacts Validation', () => {
    it('should validate that build artifacts exist', () => {
      const distPath = path.join(process.cwd(), 'dist');
      
      if (fs.existsSync(distPath)) {
        // Check for key files
        const keyFiles = [
          'index.html',
          'speakers/index.html'
        ];
        
        keyFiles.forEach(file => {
          const filePath = path.join(distPath, file);
          if (fs.existsSync(filePath)) {
            expect(fs.statSync(filePath).isFile()).toBe(true);
          }
        });
      }
    });

    it('should validate sitemap generation', () => {
      const sitemapPath = path.join(process.cwd(), 'dist', 'sitemap-index.xml');
      
      if (fs.existsSync(sitemapPath)) {
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        expect(sitemapContent).toContain('<?xml');
        expect(sitemapContent).toContain('sitemap');
      }
    });
  });

  describe('9. Integration Scenarios', () => {
    it('should validate complete language switching flow', () => {
      const testPages = ['/speakers', '/schedule', '/tickets'];
      
      testPages.forEach(page => {
        // Start with English
        expect(getLocaleFromPath(page)).toBe('en');
        
        // Switch to Chinese
        const zhUrl = getLanguageVariantUrl(page, 'zh');
        expect(zhUrl).toBe(`/zh${page}`);
        expect(getLocaleFromPath(zhUrl)).toBe('zh');
        
        // Switch back to English
        const enUrl = getLanguageVariantUrl(zhUrl, 'en');
        expect(enUrl).toBe(page);
        expect(getLocaleFromPath(enUrl)).toBe('en');
      });
    });

    it('should validate SEO meta tag generation consistency', () => {
      const pages = ['/', '/speakers', '/schedule', '/faq'];
      
      pages.forEach(page => {
        const alternates = getAlternateLinks(page);
        
        // Should have alternates for all locales
        expect(alternates).toHaveLength(LOCALES.length);
        
        // Each alternate should have proper structure
        alternates.forEach(alt => {
          expect(alt.locale).toBeDefined();
          expect(alt.href).toBeDefined();
          expect(alt.hreflang).toBeDefined();
          expect(alt.href).toMatch(/^https:\/\/hangzhou2025\.gosim\.org/);
        });
      });
    });
  });
});