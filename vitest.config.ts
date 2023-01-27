import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
export default defineConfig({
  plugins: [vue(), vueJsx()],
  define: {
    __DEV__: JSON.stringify('false'),
  },
  test: {
    environment: 'jsdom',
  },
})
