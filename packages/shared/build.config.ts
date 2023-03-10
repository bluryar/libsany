import { defineBuildConfig } from 'unbuild'

const isDevelopment = process.env.NODE_ENV === 'development'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      sourceMap: !!1,
      define: {
        __DEV__: JSON.stringify(isDevelopment),
      },
    },
    inlineDependencies: !!1,
  },
  externals: ['lodash-es'],
})
