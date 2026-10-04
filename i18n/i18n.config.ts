import { de, en } from "vuetify/locale";

// Shared by both locales so date/time output stays in step with the UI language.
const dateTimeFormats = {
  date: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  time: {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
  long: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
} as const;

// `vuetify-nuxt-module` routes Vuetify's own strings through vue-i18n when
// `@nuxtjs/i18n` is installed, so its messages are registered here under
// `$vuetify`. App strings live in `./locales/*.json` and are merged on top.
export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: "en",
  datetimeFormats: {
    en: { ...dateTimeFormats },
    de: { ...dateTimeFormats },
  },
  messages: {
    en: { $vuetify: en },
    de: { $vuetify: de },
  },
}));