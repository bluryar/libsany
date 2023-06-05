import { defineBuildConfig } from 'unbuild'

const isDevelopment = process.env.NODE_ENV === 'development'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],

  declaration: !!1,
  clean: true,
  rollup: {
    emitCJS: true,

    esbuild: {
      define: {
        __DEV__: JSON.stringify(isDevelopment),
      },
    },
  },

  externals: [
    'vue',
    'vitest',
    'naive-ui',
    'lodash-es',
  ],
})
