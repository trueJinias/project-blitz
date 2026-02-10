// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // デプロイ後に実際のURLに更新してください
  // 例: 'https://your-project.vercel.app' または 'https://yourdomain.com'
  site: 'https://project-blitz.vercel.app',
  output: 'server',

  integrations: [sitemap(), react()],

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en-us', 'hi-in'],
    routing: {
      prefixDefaultLocale: false
    }
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },

  adapter: vercel()
});