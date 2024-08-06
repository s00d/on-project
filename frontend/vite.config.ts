import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: '../backend/public', // Путь для сборки в папку ../backend/public
    emptyOutDir: true, // Очищать папку перед сборкой
  },
  server: {
    port: parseInt(process.env.VITE_SERVER_PORT ?? '5173') // Укажите желаемый порт здесь
  }
})
