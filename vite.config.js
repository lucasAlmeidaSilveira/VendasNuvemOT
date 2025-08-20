import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.png', 'icons/*.jpg'],
      manifest: {
        name: 'VendasNuvem - Dashboard',
        short_name: 'VendasNuvem',
        description: 'Dashboard de vendas e gestão de e-commerce',
        theme_color: '#1874CD',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/icons/logo.jpg',
            sizes: '300x300',
            type: 'image/jpg',
            purpose: 'maskable any',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: ['@ffmpeg/ffmpeg'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['@mui/x-charts', 'recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 5000,
  },
});
