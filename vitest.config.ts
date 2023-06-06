import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  define: {
    __DEV__: JSON.stringify('false'),
  },
  resolve: {
    alias: {
      '@bluryar/shared': './packages/shared/index.ts',
      '@bluryar/shared/*': './packages/shared/*',
      '@bluryar/composables': './packages/composables/index.ts',
      '@bluryar/composables/*': './packages/composables/*',
    },
  },
  test: {
    environment: 'jsdom',
  },
})
