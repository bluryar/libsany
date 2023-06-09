import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      imports: ['vitest'],
      eslintrc: {
        enabled: !!1,
        filepath: './auto-eslintrc.json',
      },
      dts: true, // generate TypeScript declaration
    }),
  ],
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
    globals: !!1,
    includeSource: ['src/**/*.{js,tsx,jsx,tsx,vue}'],
    environment: 'jsdom',
  },
})
