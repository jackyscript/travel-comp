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
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/travel-comp/favicon.svg",
        },
        {
          rel: "manifest",
          href: "/travel-comp/manifest.json",
        },
      ],
    },
    baseURL: "/travel-comp/",
  },
  nitro: {
    prerender: {
      ignore: ['/travel-comp/manifest.json'],
    },
  },
})
