import { fileURLToPath } from 'node:url'
import { defineBuildConfig } from 'unbuild'

const isDevelopment = process.env.NODE_ENV === 'development'
const tsConfigPath = fileURLToPath(new URL('../../tsconfig.json', import.meta.url))

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
    inlineDependencies: !!1,

    dts: {
      tsconfig: tsConfigPath,
      respectExternal: !!1,
    },
  },

  externals: [
    'vue-demi',
    'vue',
    'vitest',
    'vue-request',
    'async-validator',
    'lodash-es',
    'type-fest',
    '@bluryar/shared',
  ],

})
