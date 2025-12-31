import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          strategies: 'injectManifest',
          srcDir: 'public',
          filename: 'sw.js',
          injectManifest: {
            injectionPoint: undefined
          },
          injectRegister: 'inline',
          manifest: {
            name: 'محول الليرة السورية',
            short_name: 'الليرة',
            start_url: '/',
            display: 'standalone',
            background_color: '#17683c',
            theme_color: '#17683c',
            icons: [
              {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
