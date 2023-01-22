import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    __DEV__: JSON.stringify('false'),
  },
  test: {
    environment: 'jsdom',
  },
})
