// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import { resumePath, resumeUrl } from './src/data/resume.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://huynhmytuan.dev',
  redirects: {
    [resumePath]: resumeUrl,
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext', 'vietnamese'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter Tight',
      cssVariable: '--font-inter-tight',
      weights: ['600 700'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext', 'vietnamese'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
