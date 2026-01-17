
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Tropical Dreams POS',
        short_name: 'TropicalPOS',
        description: 'Offline-First POS for Tropical Dreams Coffee House',
        theme_color: '#0f766e',
        background_color: '#f5f4f1',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'landscape',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/751/751621.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/751/751621.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Fix: Removed CacheFirst strategy for external images (Unsplash) 
        // because they often return opaque responses which break Workbox caching.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist', 
    emptyOutDir: true,
  }
});
