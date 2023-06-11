import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineBuildConfig } from 'unbuild'

const isDevelopment = process.env.NODE_ENV === 'development'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineBuildConfig({
  entries: [
    'src/index',
  ],

  replace: {
    'import.meta.vitest': 'undefined',
    '__DEV__': JSON.stringify(isDevelopment),
  },

  declaration: !!1,

  clean: true,

  rollup: {
    emitCJS: true,

    inlineDependencies: !!1,

    alias: {
      entries: {
        '@bluryar/shared': resolve(__dirname, '../shared/index.ts'),
      },
    },

    esbuild: {
      jsx: 'automatic',
    },
  },

  externals: [
    'vue',
    'lodash-es',
    '@vueuse/core',
  ],
})
