import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getMockServerUrl } from './scripts/config';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  },
  server: {
    sourcemapIgnoreList: false,
    proxy: {
      '/api': {
        target: getMockServerUrl(),
        changeOrigin: true,
      }
    }
  },
  css: {
    devSourcemap: true
  },
  esbuild: {
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
