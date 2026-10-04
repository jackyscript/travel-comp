<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <v-app-bar app>
      <v-btn to="/" icon class="ml-4" :active="false" color="secondary">
        <svg-icon type="mdi" :path="mdiTrainBus"></svg-icon>
      </v-btn>
      <v-app-bar-title>Travel Comp</v-app-bar-title>
      <v-btn
        icon
        class="mr-4"
        @click="toggleTheme"
        :aria-label="
          theme.global.name.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
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

theme.change(preferredDark.value ? "dark" : "light");

function toggleTheme() {
  theme.change(theme.global.name.value === "dark" ? "light" : "dark");
}
</script>
