import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineBuildConfig } from 'unbuild'

const isDevelopment = process.env.NODE_ENV === 'development'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineBuildConfig({
  entries: [
    'src/index',
  ],

  declaration: !!1,
  clean: true,
  rollup: {
    emitCJS: true,
    alias: {
      entries: {
        '@bluryar/shared': resolve(__dirname, '../shared/index.ts'),
      },
    },

    esbuild: {

      define: {
        __DEV__: JSON.stringify(isDevelopment),
      },
    },

    inlineDependencies: !!1,
  },

  externals: [
    'vue',
    'lodash-es',
    '@vueuse/core',
    // 'vitest',
    // 'naive-ui',
  ],
})
