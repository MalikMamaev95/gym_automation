// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Ensure these paths are correct relative to the 'public' folder
      includeAssets: ['favicon.ico', 'gym-favicon.png', 'manifest.json'],
      manifest: {
        name: 'GymLogger',
        short_name: 'GymLogger',
        description: 'Track your gym, weight, and cardio progress.',
        theme_color: '#2d3748',
        background_color: '#1a202c',
        display: 'standalone',
        icons: [
          {
            src: 'gym-favicon.png', // Path relative to public folder
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'gym-favicon.png', // Path relative to public folder
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'favicon.ico', // Path relative to public folder
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
});


