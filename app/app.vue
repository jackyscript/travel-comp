<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <v-app-bar app>
      <v-btn to="/" icon class="ml-4" :active="false" color="secondary">
        <svg-icon type="mdi" :path="mdiTrainBus"></svg-icon>
      </v-btn>
      <v-app-bar-title>Travel Comp</v-app-bar-title>
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
import { mdiTrainBus } from "@mdi/js";
</script>
