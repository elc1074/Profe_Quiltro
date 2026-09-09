import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

export default defineConfig({
  plugins: [vue(), VueI18nPlugin({ include: resolve(fileURLToPath(new URL('./src/i18n/locales/**/*.json', import.meta.url))) })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
})
