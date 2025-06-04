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
        manualChunks: (id) => {
          // 第三方库分离
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }
          if (id.includes('node_modules/axios')) {
            return 'axios-vendor';
          }
          
          // 共享组件优先处理 - 在页面级别分离之前
          if (id.includes('/components/VideoPlayer') || 
              id.includes('/components/TabBar') ||
              id.includes('/components/Toast') ||
              id.includes('/components/LoadingView') ||
              id.includes('/components/ErrorView') ||
              id.includes('/components/ConfirmDialog') ||
              id.includes('/components/DebugConsole') ||
              id.includes('/components/icons')) {
            return 'shared-components';
          }
          
          // 页面级别分离 - 更精确的匹配
          if (id.includes('/pages/home/') && !id.includes('/pages/home/content/')) {
            return 'page-home';
          }
          if (id.includes('/pages/mine/')) {
            return 'page-mine';
          }
          if (id.includes('/edit/') && !id.includes('/cut/videoedit/')) {
            return 'page-edit';
          }
          if (id.includes('/videolist/')) {
            return 'page-videolist';
          }
          if (id.includes('/detail/')) {
            return 'page-detail';
          }
          if (id.includes('/operate/')) {
            return 'page-operate';
          }
          if (id.includes('/cut/videoSlice/')) {
            return 'page-video-slice';
          }
          if (id.includes('/cut/videoedit/')) {
            return 'page-video-edit';
          }
          if (id.includes('/cut/videoParse/')) {
            return 'page-video-parse';
          }
          
          // 其他剩余的组件分离 - 页面特定的组件
          if (id.includes('/edit/components/')) {
            return 'page-edit';
          }
          if (id.includes('/cut/videoedit/components/') && !id.includes('/components/VideoPlayer')) {
            return 'page-video-edit';
          }
          if (id.includes('/cut/videoSlice/components/')) {
            return 'page-video-slice';
          }
          if (id.includes('/cut/videoParse/components/')) {
            return 'page-video-parse';
          }
          if (id.includes('/operate/components/')) {
            return 'page-operate';
          }
          
          // 工具库分离
          if (id.includes('/utils/')) {
            return 'shared-utils';
          }
          
          // API相关
          if (id.includes('/api/') || id.includes('/config/api')) {
            return 'shared-utils';
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      },
      // 优化外部依赖
      external: [],
      // 禁用预加载
      treeshake: true
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 控制chunk大小
    chunkSizeWarningLimit: 500
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
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCaseOnly',
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    // CSS代码分割配置
    preprocessorOptions: {
      // 如果你使用sass/scss
      // scss: {
      //   additionalData: `@import "src/styles/variables.scss";`
      // }
    }
  },
  esbuild: {
    sourcemap: true
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom']
  }
})
