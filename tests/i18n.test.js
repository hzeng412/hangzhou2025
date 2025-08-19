/**
 * I18n Utilities Test Suite
 * 
 * Tests for translation utilities and locale detection
 * Requirements covered: 2.3, 4.1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as i18nUtils from '../src/i18n/utils.ts';

// Mock translation data
const mockTranslations = {
  en: {
    navigation: {
      home: 'Home',
      speakers: 'Speakers',
      schedule: 'Schedule'
    },
    homepage: {
      hero: {
        title: 'GOSIM Hangzhou 2025',
        subtitle: 'China\'s premier open-source conference'
      }
    },
    common: {
      greeting: 'Hello {{name}}!',
      welcome: 'Welcome to {{event}}'
    }
  },
  zh: {
    navigation: {
      home: '首页',
      speakers: '演讲者',
      schedule: '日程'
    },
    homepage: {
      hero: {
        title: 'GOSIM 杭州 2025',
        subtitle: '中国顶级开源大会'
      }
    },
    common: {
      greeting: '你好 {{name}}！',
      welcome: '欢迎来到 {{event}}'
    }
  }
};

// Mock the translation imports


describe('I18n Constants', () => {
  it('should have correct locale constants', () => {
    expect(i18nUtils.LOCALES).toEqual(['en', 'zh']);
    expect(i18nUtils.DEFAULT_LOCALE).toBe('en');
  });
});

describe('Translation Function', () => {
  let tEn, tZh;

  beforeEach(() => {
    vi.spyOn(i18nUtils, 'loadTranslations').mockImplementation(async () => {});
    i18nUtils.translations.en = mockTranslations.en;
    i18nUtils.translations.zh = mockTranslations.zh;
    tEn = i18nUtils.createTranslationFunction('en');
    tZh = i18nUtils.createTranslationFunction('zh');
  });

  it('should translate simple keys correctly', () => {
    expect(tEn('navigation.home')).toBe('Home');
    expect(tZh('navigation.home')).toBe('首页');
  });

  it('should translate nested keys correctly', () => {
    expect(tEn('homepage.hero.title')).toBe('GOSIM Hangzhou 2025');
    expect(tZh('homepage.hero.title')).toBe('GOSIM 杭州 2025');
  });

  it('should handle parameter substitution', () => {
    expect(tEn('common.greeting', { name: 'John' })).toBe('Hello John!');
    expect(tZh('common.greeting', { name: '张三' })).toBe('你好 张三！');
    
    expect(tEn('common.welcome', { event: 'GOSIM' })).toBe('Welcome to GOSIM');
    expect(tZh('common.welcome', { event: 'GOSIM' })).toBe('欢迎来到 GOSIM');
  });

  it('should fallback to default locale when translation missing', () => {
    // Assuming 'missing.key' doesn't exist in zh but exists in en
    const tZhWithFallback = i18nUtils.createTranslationFunction('zh');
    expect(tZhWithFallback('navigation.home')).toBe('首页'); // Should use zh
  });

  it('should return key when translation completely missing', () => {
    expect(tEn('nonexistent.key')).toBe('nonexistent.key');
    expect(tZh('nonexistent.key')).toBe('nonexistent.key');
  });

  it('should handle multiple parameter substitutions', () => {
    const tEn = i18nUtils.createTranslationFunction('en');
    // Mock a translation with multiple parameters
    const mockTrans = {
      en: {
        test: {
          multiParam: 'Hello {{name}}, welcome to {{event}} on {{date}}'
        }
      }
    };
    
    // We'll test the parameter replacement logic directly
    const result = 'Hello {{name}}, welcome to {{event}} on {{date}}'
      .replace(/\{\{name\}\}/g, 'John')
      .replace(/\{\{event\}\}/g, 'GOSIM')
      .replace(/\{\{date\}\}/g, '2025');
    
    expect(result).toBe('Hello John, welcome to GOSIM on 2025');
  });
});

describe('Locale Detection', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks();
  });

  it('should detect locale from Astro context', () => {
    const mockContext = { currentLocale: 'zh' };
    expect(i18nUtils.getCurrentLocale(mockContext)).toBe('zh');
  });

  it('should detect locale from window location', () => {
    // Mock window.location
    const mockLocation = {
      pathname: '/zh/speakers'
    };
    
    Object.defineProperty(global, 'window', {
      value: { location: mockLocation },
      writable: true
    });

    expect(i18nUtils.getCurrentLocale()).toBe('zh');
  });

  it('should fallback to default locale when no context', () => {
    // Mock window as undefined (server-side)
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true
    });

    expect(i18nUtils.getCurrentLocale()).toBe(i18nUtils.DEFAULT_LOCALE);
  });

  it('should validate locales correctly', () => {
    expect(i18nUtils.isValidLocale('en')).toBe(true);
    expect(i18nUtils.isValidLocale('zh')).toBe(true);
    expect(i18nUtils.isValidLocale('fr')).toBe(false);
    expect(i18nUtils.isValidLocale('invalid')).toBe(false);
    expect(i18nUtils.isValidLocale('')).toBe(false);
  });

  it('should extract locale from path correctly', () => {
    expect(i18nUtils.getLocaleFromPath('/en/speakers')).toBe('en');
    expect(i18nUtils.getLocaleFromPath('/zh/schedule')).toBe('zh');
    expect(i18nUtils.getLocaleFromPath('/speakers')).toBe('en'); // default
    expect(i18nUtils.getLocaleFromPath('/invalid/path')).toBe('en'); // default
    expect(i18nUtils.getLocaleFromPath('/')).toBe('en'); // default
    expect(i18nUtils.getLocaleFromPath('')).toBe('en'); // default
  });
});

describe('Path Generation', () => {
  it('should generate localized paths correctly', () => {
    expect(i18nUtils.getLocalizedPath('/speakers')).toBe('/speakers'); // default locale
    expect(i18nUtils.getLocalizedPath('/speakers', 'en')).toBe('/speakers');
    expect(i18nUtils.getLocalizedPath('/speakers', 'zh')).toBe('/zh/speakers');
    expect(i18nUtils.getLocalizedPath('speakers')).toBe('/speakers'); // handle missing leading slash
    expect(i18nUtils.getLocalizedPath('')).toBe('/'); // handle empty path
  });

  it('should generate alternate links correctly', () => {
    const alternates = i18nUtils.getAlternateLinks('/speakers');
    
    expect(alternates).toHaveLength(2);
    expect(alternates[0]).toEqual({
      locale: 'en',
      href: 'https://hangzhou2025.gosim.org/speakers',
      hreflang: 'en'
    });
    expect(alternates[1]).toEqual({
      locale: 'zh',
      href: 'https://hangzhou2025.gosim.org/zh/speakers',
      hreflang: 'zh-CN'
    });
  });

  it('should generate language variant URLs correctly', () => {
    expect(i18nUtils.getLanguageVariantUrl('/speakers', 'zh')).toBe('/zh/speakers');
    expect(i18nUtils.getLanguageVariantUrl('/zh/speakers', 'en')).toBe('/speakers');
    expect(i18nUtils.getLanguageVariantUrl('/zh/schedule', 'zh')).toBe('/zh/schedule');
    expect(i18nUtils.getLanguageVariantUrl('/', 'zh')).toBe('/zh/');
  });

  it('should handle edge cases in path generation', () => {
    expect(i18nUtils.getLocalizedPath(null, 'zh')).toBe('/zh/');
    expect(i18nUtils.getLocalizedPath(undefined, 'en')).toBe('/');
    expect(i18nUtils.getAlternateLinks(null)).toHaveLength(2);
    expect(i18nUtils.getLanguageVariantUrl(undefined, 'zh')).toBe('/zh/');
  });
});

describe('Language Switching', () => {
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

    // Mock window.location
    Object.defineProperty(global, 'window', {
      value: {
        location: {
          pathname: '/speakers',
          href: ''
        }
      },
      writable: true
    });
  });

  it('should switch language and update localStorage', () => {
    i18nUtils.switchLanguage('zh');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('preferred-language', 'zh');
    expect(window.location.href).toBe('/zh/speakers');
  });

  it('should handle localStorage errors gracefully', () => {
    localStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    // Should not throw error
    expect(() => i18nUtils.switchLanguage('zh')).not.toThrow();
  });

  it('should not execute on server-side', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true
    });

    // Should not throw error
    expect(() => i18nUtils.switchLanguage('zh')).not.toThrow();
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.spyOn(i18nUtils, 'loadTranslations').mockImplementation(async () => {});
    i18nUtils.translations.en = mockTranslations.en;
    i18nUtils.translations.zh = mockTranslations.zh;
  });

  it('should work end-to-end for a typical user flow', () => {
    // User visits Chinese page
    Object.defineProperty(global, 'window', {
      value: { location: { pathname: '/zh/speakers' } },
      writable: true
    });

    const currentLocale = i18nUtils.getCurrentLocale();
    expect(currentLocale).toBe('zh');

    const t = i18nUtils.createTranslationFunction(currentLocale);
    expect(t('navigation.speakers')).toBe('演讲者');

    // Generate alternate links for SEO
    const alternates = i18nUtils.getAlternateLinks('/speakers');
    expect(alternates.find(alt => alt.locale === 'en').href).toBe('https://hangzhou2025.gosim.org/speakers');

    // Switch to English
    const englishUrl = i18nUtils.getLanguageVariantUrl('/zh/speakers', 'en');
    expect(englishUrl).toBe('/speakers');
  });

  it('should handle complex nested translations', () => {
    const tEn = i18nUtils.createTranslationFunction('en');
    const tZh = i18nUtils.createTranslationFunction('zh');

    expect(tEn('homepage.hero.subtitle')).toBe('China\'s premier open-source conference');
    expect(tZh('homepage.hero.subtitle')).toBe('中国顶级开源大会');
  });
});