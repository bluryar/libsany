// require('@rushstack/eslint-patch/modern-module-resolution')
// process.env.ESLINT_TSCONFIG = 'tsconfig.json'

/**
 * @type {import('eslint').ESLint.ConfigData}
 */
module.exports = {
  extends: [
    '@bluryar/vue',
    './auto-eslintrc.json',
  ],
  globals: {
    __DEV__: true,
    BMAP_AK: true,
    BigInt: true,
  },
}
