// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: ['**/*.ts', '**/*.vue'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    // Le formatage (dont le "/" de <img />) est géré par Prettier :
    // cette règle ESLint le contredisait.
    'vue/html-self-closing': 'off',
  },
})
