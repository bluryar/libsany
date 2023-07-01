// require('@rushstack/eslint-patch/modern-module-resolution')
// process.env.ESLINT_TSCONFIG = 'tsconfig.json'

/**
 * @type {import('eslint').ESLint.ConfigData}
 */
module.exports = {
  extends: [
    '@bluryar/vue',
  ],
  globals: {
    __DEV__: true,
    __BMAPGL_SCRIPT__: true,
    __BMAPGL_STYLE__: true,
    BMAP_AK: true,
    BigInt: true,
  },
}
