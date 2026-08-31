import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

function ogImagePlugin(siteUrl: string) {
  const ogImage = siteUrl ? `${siteUrl.replace(/\/$/, '')}/og-image.png` : '/og-image.png';

  return {
    name: 'og-image-meta',
    transformIndexHtml(html: string) {
      return html.replaceAll('__OG_IMAGE__', ogImage);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = env.VITE_SITE_URL ?? '';

  return {
    plugins: [react(), ogImagePlugin(siteUrl)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['pdfjs-dist'],
    },
    worker: {
      format: 'es',
    },
  };
});
