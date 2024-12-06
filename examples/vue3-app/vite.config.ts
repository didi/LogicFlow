import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// vite-plugin-vue-devtools 会导致所有的vue节点被记录在 全局变量 __VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__ 上，导致内存溢出的bug
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
