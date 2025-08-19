// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh-CN'
        }
      },
      // Filter function to ensure proper URL generation
      filter: (page) => {
        // Include all pages in sitemap
        return true;
      },
      // Custom serialize function to ensure proper URL structure
      serialize: (item) => {
        // Ensure URLs are properly formatted for multilingual site
        return {
          url: item.url,
          changefreq: 'weekly',
          lastmod: new Date(),
          priority: item.url === 'https://hangzhou2025.gosim.org/' ? 1.0 : 0.8,
          links: [
            {
              url: item.url,
              lang: item.url.includes('/zh/') ? 'zh-CN' : 'en'
            }
          ]
        };
      }
    })
  ],
  site: "https://hangzhou2025.gosim.org/",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false
    },
    fallback: {
      zh: "en"
    }
  }
});
