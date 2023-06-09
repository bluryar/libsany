import { defineBuildConfig } from 'unbuild'

const isDevelopment = process.env.NODE_ENV === 'development'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  replace: {
    'import.meta.vitest': 'undefined',
  },
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      define: {
        __DEV__: JSON.stringify(isDevelopment),
      },
    },
  },
})
