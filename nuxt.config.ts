// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxt/test-utils/module'],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
})
