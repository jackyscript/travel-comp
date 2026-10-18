<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <v-app-bar app>
      <v-btn to="/" icon class="ml-4" :active="false" color="secondary">
        <svg-icon type="mdi" :path="mdiTrainBus"></svg-icon>
      </v-btn>
      <v-app-bar-title>Travel Comp</v-app-bar-title>
      <v-menu>
        <template #activator="{ props: activatorProps }">
          <v-btn
            v-bind="activatorProps"
            class="mr-1"
            variant="text"
            append-icon="mdi-chevron-down"
            :aria-label="t('app.language')"
          >
            {{ currentLocaleName }}
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item
            v-for="availableLocale in locales"
            :key="availableLocale.code"
            :active="availableLocale.code === locale"
            @click="setLocale(availableLocale.code)"
          >
            <v-list-item-title>{{ availableLocale.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        icon
        class="mr-4"
        @click="toggleTheme"
        :aria-label="
          theme.global.name.value === 'dark'
            ? t('app.switchToLightMode')
            : t('app.switchToDarkMode')
        "
      >
        <svg-icon
          type="mdi"
          :path="theme.global.name.value === 'dark' ? mdiWeatherSunny : mdiWeatherNight"
        ></svg-icon>
      </v-btn>
    </v-app-bar>

    <v-main class="pt-16">
      <v-container>
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiTrainBus, mdiWeatherSunny, mdiWeatherNight } from "@mdi/js";
import { usePreferredDark } from "@vueuse/core";

const theme = useTheme();
const preferredDark = usePreferredDark();

const { t, locale, locales, setLocale } = useI18n();

const currentLocaleName = computed(
  () => locales.value.find((l) => l.code === locale.value)?.name ?? locale.value,
);

// Keeps `<html lang>` in sync. `seo` is off because every locale shares the same
// URL under the `no_prefix` strategy, so hreflang alternates would be duplicates.
useLocaleHead({ lang: true, dir: false, seo: false });

theme.change(preferredDark.value ? "dark" : "light");

function toggleTheme() {
  theme.change(theme.global.name.value === "dark" ? "light" : "dark");
}
</script>
