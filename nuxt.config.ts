// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module'],
  app: {
    head: {
      title: 'Travel Comp', // default fallback title
      htmlAttrs: {
        lang: 'en',
      },
    },
    baseURL: "/travel-comp/",
  },
})