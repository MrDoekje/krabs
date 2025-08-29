import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    Components({
      dts: true,
    }),
    VueRouter(),
    vueDevTools(),
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@krabs-sdk': path.resolve(__dirname, './krabs-sdk'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3042',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
