require('@rushstack/eslint-patch/modern-module-resolution')
// process.env.ESLINT_TSCONFIG = 'tsconfig.json'

/**
 * @type {import('eslint').ESLint.ConfigData}
 */
module.exports = {
  extends: [
    '@bluryar/vue',
  ],
}
