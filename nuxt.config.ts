// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/i18n",
    [
      "vuetify-nuxt-module",
      {
        moduleOptions: {
          prefixComposables: ["useLayout"],
        },
      },
    ],
  ],
  i18n: {
    // Single set of routes, locale is not encoded in the URL
    strategy: "no_prefix",
    defaultLocale: "en",
    locales: [
      { code: "en", name: "English", language: "en-US", file: "en.json" },
      { code: "de", name: "Deutsch", language: "de-DE", file: "de.json" },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "travel_comp_locale",
      redirectOn: "no prefix",
      fallbackLocale: "en",
    },
  },
  app: {
    head: {
      title: "Travel Comp", // default fallback title
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/travel-comp/favicon.svg",
        },
      ],
    },
    baseURL: "/travel-comp/",
  },
  nitro: {
    prerender: {
      ignore: ["/travel-comp/manifest.json"],
    },
  },
});
