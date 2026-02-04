// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // デプロイ後に実際のURLに更新してください
  // 例: 'https://your-project.vercel.app' または 'https://yourdomain.com'
  site: 'https://project-blitz.vercel.app',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
