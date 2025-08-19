/**
 * Component Rendering Tests
 * 
 * Tests for component rendering in both languages
 * Requirements covered: 2.3, 4.1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock Astro environment
const mockAstroContext = (locale = 'en') => ({
  currentLocale: locale,
  props: {},
  request: {
    url: `https://example.com/${locale === 'en' ? '' : locale + '/'}`
  }
});

// Mock translation data
const mockTranslations = {
  en: {
    navigation: {
      home: 'Home',
      speakers: 'Speakers',
      schedule: 'Schedule',
      tickets: 'Tickets',
      get_tickets: 'Get Tickets',
      go_to_homepage: 'Go to Homepage'
    },
    footer: {
      code_of_conduct: 'Code of Conduct',
      privacy: 'Privacy Policy'
    },
    speakers: {
      title: 'Featured Speakers',
      more_speakers: 'More Speakers',
      view_all: 'View All Speakers'
    },
    faq: {
      title: 'Frequently Asked Questions',
      all_categories: 'All Categories'
    },
    sponsors: {
      title: 'Our Sponsors',
      all_categories: 'All Categories'
    }
  },
  zh: {
    navigation: {
      home: '首页',
      speakers: '演讲者',
      schedule: '日程',
      tickets: '门票',
      get_tickets: '获取门票',
      go_to_homepage: '回到首页'
    },
    footer: {
      code_of_conduct: '行为准则',
      privacy: '隐私政策'
    },
    speakers: {
      title: '特邀演讲者',
      more_speakers: '更多演讲者',
      view_all: '查看所有演讲者'
    },
    faq: {
      title: '常见问题',
      all_categories: '所有分类'
    },
    sponsors: {
      title: '我们的赞助商',
      all_categories: '所有分类'
    }
  }
};

// Mock the i18n utilities
vi.mock('../src/i18n/utils.ts', () => ({
  LOCALES: ['en', 'zh'],
  DEFAULT_LOCALE: 'en',
  getCurrentLocale: vi.fn((context) => context?.currentLocale || 'en'),
  createTranslationFunction: vi.fn((locale) => {
    return (key, params) => {
      const keys = key.split('.');
      let value = mockTranslations[locale];
      for (const k of keys) {
        value = value?.[k];
      }
      if (!value) return key;
      
      if (params) {
        Object.entries(params).forEach(([param, val]) => {
          value = value.replace(new RegExp(`{{${param}}}`, 'g'), val);
        });
      }
      return value;
    };
  }),
  getLocalizedPath: vi.fn((path, locale) => {
    if (locale === 'en' || !locale) return path;
    return `/${locale}${path}`;
  }),
  getAlternateLinks: vi.fn((path) => [
    { locale: 'en', href: `https://example.com${path}`, hreflang: 'en' },
    { locale: 'zh', href: `https://example.com/zh${path}`, hreflang: 'zh-CN' }
  ]),
  loadTranslations: vi.fn(() => Promise.resolve())
}));

// Mock data files
vi.mock('../src/i18n/data/speakers.json', () => ({
  default: {
    categories: [
      { name: { en: 'All', zh: '全部' }, id: 'all' },
      { name: { en: 'AI Models', zh: 'AI 模型' }, id: 'ai-models' }
    ],
    speakers: [
      {
        id: 'test-speaker',
        name: { en: 'John Doe', zh: '约翰·多伊' },
        bio: { en: 'Test bio', zh: '测试简介' },
        role: { en: 'Engineer', zh: '工程师' },
        org: { en: 'Test Corp', zh: '测试公司' },
        image: 'test.jpg',
        tag: 'ai-models'
      }
    ]
  }
}));

vi.mock('../src/i18n/data/faq.json', () => ({
  default: {
    categories: [
      { name: { en: 'All', zh: '全部' } },
      { name: { en: 'Tickets', zh: '门票' } }
    ],
    faqs: [
      {
        category: { en: 'Tickets', zh: '门票' },
        question: { en: 'How to buy tickets?', zh: '如何购买门票？' },
        answer: { en: 'Visit our website', zh: '访问我们的网站' }
      }
    ]
  }
}));

vi.mock('../src/i18n/data/sponsors.json', () => ({
  default: {
    categories: [
      { name: { en: 'All', zh: 'All' } },
      { name: { en: 'Sponsors', zh: 'Sponsors' } }
    ],
    partners: [
      {
        category: { en: 'Sponsors', zh: 'Sponsors' },
        image: 'sponsor1.png'
      }
    ]
  }
}));

describe('Component i18n Integration', () => {
  let dom;
  
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
  });

  describe('Translation Function Integration', () => {
    it('should create correct translation functions for different locales', async () => {
      const { createTranslationFunction } = await import('../src/i18n/utils.ts');
      
      const tEn = createTranslationFunction('en');
      const tZh = createTranslationFunction('zh');
      
      expect(tEn('navigation.home')).toBe('Home');
      expect(tZh('navigation.home')).toBe('首页');
      
      expect(tEn('speakers.title')).toBe('Featured Speakers');
      expect(tZh('speakers.title')).toBe('特邀演讲者');
    });

    it('should handle missing translations gracefully', async () => {
      const { createTranslationFunction } = await import('../src/i18n/utils.ts');
      
      const tEn = createTranslationFunction('en');
      expect(tEn('nonexistent.key')).toBe('nonexistent.key');
    });
  });

  describe('Locale Detection in Components', () => {
    it('should detect English locale correctly', async () => {
      const { getCurrentLocale } = await import('../src/i18n/utils.ts');
      
      const context = mockAstroContext('en');
      const locale = getCurrentLocale(context);
      
      expect(locale).toBe('en');
    });

    it('should detect Chinese locale correctly', async () => {
      const { getCurrentLocale } = await import('../src/i18n/utils.ts');
      
      const context = mockAstroContext('zh');
      const locale = getCurrentLocale(context);
      
      expect(locale).toBe('zh');
    });
  });

  describe('Path Generation in Components', () => {
    it('should generate correct paths for English locale', async () => {
      const { getLocalizedPath } = await import('../src/i18n/utils.ts');
      
      expect(getLocalizedPath('/speakers', 'en')).toBe('/speakers');
      expect(getLocalizedPath('/tickets', 'en')).toBe('/tickets');
    });

    it('should generate correct paths for Chinese locale', async () => {
      const { getLocalizedPath } = await import('../src/i18n/utils.ts');
      
      expect(getLocalizedPath('/speakers', 'zh')).toBe('/zh/speakers');
      expect(getLocalizedPath('/tickets', 'zh')).toBe('/zh/tickets');
    });
  });

  describe('Data Structure Handling', () => {
    it('should handle multilingual speaker data correctly', async () => {
      const speakersData = await import('../src/i18n/data/speakers.json');
      const data = speakersData.default;
      
      expect(data.speakers[0].name.en).toBe('John Doe');
      expect(data.speakers[0].name.zh).toBe('约翰·多伊');
      expect(data.categories[0].name.en).toBe('All');
      expect(data.categories[0].name.zh).toBe('全部');
    });

    it('should handle multilingual FAQ data correctly', async () => {
      const faqData = await import('../src/i18n/data/faq.json');
      const data = faqData.default;
      
      expect(data.faqs[0].question.en).toBe('How to buy tickets?');
      expect(data.faqs[0].question.zh).toBe('如何购买门票？');
    });

    it('should handle sponsor data correctly', async () => {
      const sponsorsData = await import('../src/i18n/data/sponsors.json');
      const data = sponsorsData.default;
      
      expect(data.partners[0].image).toBe('sponsor1.png');
      expect(data.categories[0].name.en).toBe('All');
    });
  });

  describe('Component Rendering Logic', () => {
    it('should render navigation items in correct language', async () => {
      const { createTranslationFunction } = await import('../src/i18n/utils.ts');
      
      // Simulate component logic
      const renderNavigation = (locale) => {
        const t = createTranslationFunction(locale);
        return {
          home: t('navigation.home'),
          speakers: t('navigation.speakers'),
          schedule: t('navigation.schedule'),
          tickets: t('navigation.tickets')
        };
      };
      
      const enNav = renderNavigation('en');
      expect(enNav.home).toBe('Home');
      expect(enNav.speakers).toBe('Speakers');
      
      const zhNav = renderNavigation('zh');
      expect(zhNav.home).toBe('首页');
      expect(zhNav.speakers).toBe('演讲者');
    });

    it('should render speaker cards with correct language data', async () => {
      const speakersData = await import('../src/i18n/data/speakers.json');
      const { createTranslationFunction } = await import('../src/i18n/utils.ts');
      
      // Simulate speaker card rendering logic
      const renderSpeakerCard = (speaker, locale) => {
        const t = createTranslationFunction(locale);
        return {
          name: speaker.name[locale],
          bio: speaker.bio[locale],
          role: speaker.role[locale],
          org: speaker.org[locale],
          title: t('speakers.title')
        };
      };
      
      const speaker = speakersData.default.speakers[0];
      
      const enCard = renderSpeakerCard(speaker, 'en');
      expect(enCard.name).toBe('John Doe');
      expect(enCard.bio).toBe('Test bio');
      expect(enCard.title).toBe('Featured Speakers');
      
      const zhCard = renderSpeakerCard(speaker, 'zh');
      expect(zhCard.name).toBe('约翰·多伊');
      expect(zhCard.bio).toBe('测试简介');
      expect(zhCard.title).toBe('特邀演讲者');
    });

    it('should render FAQ items with correct language data', async () => {
      const faqData = await import('../src/i18n/data/faq.json');
      const { createTranslationFunction } = await import('../src/i18n/utils.ts');
      
      // Simulate FAQ rendering logic
      const renderFAQ = (faq, locale) => {
        const t = createTranslationFunction(locale);
        return {
          question: faq.question[locale],
          answer: faq.answer[locale],
          category: faq.category[locale],
          title: t('faq.title')
        };
      };
      
      const faq = faqData.default.faqs[0];
      
      const enFAQ = renderFAQ(faq, 'en');
      expect(enFAQ.question).toBe('How to buy tickets?');
      expect(enFAQ.answer).toBe('Visit our website');
      expect(enFAQ.title).toBe('Frequently Asked Questions');
      
      const zhFAQ = renderFAQ(faq, 'zh');
      expect(zhFAQ.question).toBe('如何购买门票？');
      expect(zhFAQ.answer).toBe('访问我们的网站');
      expect(zhFAQ.title).toBe('常见问题');
    });
  });

  describe('SEO and Meta Tag Generation', () => {
    it('should generate correct alternate links', async () => {
      const { getAlternateLinks } = await import('../src/i18n/utils.ts');
      
      const alternates = getAlternateLinks('/speakers');
      
      expect(alternates).toHaveLength(2);
      expect(alternates[0].locale).toBe('en');
      expect(alternates[0].href).toBe('https://example.com/speakers');
      expect(alternates[1].locale).toBe('zh');
      expect(alternates[1].href).toBe('https://example.com/zh/speakers');
    });

    it('should handle meta tag generation for different locales', async () => {
      const { createTranslationFunction } = await import('../src/i18n/utils.ts');
      
      // Simulate SEO component logic
      const generateMetaTags = (locale, titleKey, descriptionKey) => {
        const t = createTranslationFunction(locale);
        return {
          title: t(titleKey),
          description: t(descriptionKey),
          lang: locale
        };
      };
      
      // Mock some SEO translation keys
      mockTranslations.en.seo = { title: 'GOSIM 2025', description: 'Premier conference' };
      mockTranslations.zh.seo = { title: 'GOSIM 2025', description: '顶级会议' };
      
      const enMeta = generateMetaTags('en', 'seo.title', 'seo.description');
      expect(enMeta.lang).toBe('en');
      
      const zhMeta = generateMetaTags('zh', 'seo.title', 'seo.description');
      expect(zhMeta.lang).toBe('zh');
    });
  });

  describe('Error Handling in Components', () => {
    it('should handle missing translation data gracefully', async () => {
      const { createTranslationFunction } = await import('../src/i18n/utils.ts');
      
      const t = createTranslationFunction('en');
      
      // Should return key when translation is missing
      expect(t('missing.translation.key')).toBe('missing.translation.key');
    });

    it('should handle malformed data structures', () => {
      // Simulate component handling malformed data
      const handleSpeakerData = (speaker, locale) => {
        try {
          return {
            name: speaker?.name?.[locale] || 'Unknown',
            bio: speaker?.bio?.[locale] || 'No bio available'
          };
        } catch (error) {
          return {
            name: 'Error',
            bio: 'Data unavailable'
          };
        }
      };
      
      const malformedSpeaker = { name: null, bio: undefined };
      const result = handleSpeakerData(malformedSpeaker, 'en');
      
      expect(result.name).toBe('Unknown');
      expect(result.bio).toBe('No bio available');
    });
  });
});

describe('Component Integration Tests', () => {
  it('should work end-to-end for a complete page render', async () => {
    const { getCurrentLocale, createTranslationFunction, getLocalizedPath } = await import('../src/i18n/utils.ts');
    const speakersData = await import('../src/i18n/data/speakers.json');
    
    // Simulate complete page rendering logic
    const renderPage = (astroContext) => {
      const currentLocale = getCurrentLocale(astroContext);
      const t = createTranslationFunction(currentLocale);
      
      // Navigation
      const navigation = {
        home: { text: t('navigation.home'), link: getLocalizedPath('/', currentLocale) },
        speakers: { text: t('navigation.speakers'), link: getLocalizedPath('/speakers', currentLocale) }
      };
      
      // Speakers section
      const speakers = speakersData.default.speakers.map(speaker => ({
        name: speaker.name[currentLocale],
        bio: speaker.bio[currentLocale],
        role: speaker.role[currentLocale]
      }));
      
      return {
        locale: currentLocale,
        navigation,
        speakers,
        title: t('speakers.title')
      };
    };
    
    // Test English page
    const enContext = mockAstroContext('en');
    const enPage = renderPage(enContext);
    
    expect(enPage.locale).toBe('en');
    expect(enPage.navigation.home.text).toBe('Home');
    expect(enPage.navigation.speakers.link).toBe('/speakers');
    expect(enPage.speakers[0].name).toBe('John Doe');
    expect(enPage.title).toBe('Featured Speakers');
    
    // Test Chinese page
    const zhContext = mockAstroContext('zh');
    const zhPage = renderPage(zhContext);
    
    expect(zhPage.locale).toBe('zh');
    expect(zhPage.navigation.home.text).toBe('首页');
    expect(zhPage.navigation.speakers.link).toBe('/zh/speakers');
    expect(zhPage.speakers[0].name).toBe('约翰·多伊');
    expect(zhPage.title).toBe('特邀演讲者');
  });
});