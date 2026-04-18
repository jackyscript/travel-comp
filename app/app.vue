<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <v-app-bar :elevation="2">
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Travel Comp</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <StationSearch @station-selected="handleStationSelected" />
        <DeparturesSection :selected-station="selectedStation" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StationSearch from '~/components/StationSearch.vue'
import DeparturesSection from '~/components/DeparturesSection.vue'

const selectedStation = ref(null)

function handleStationSelected(station: any) {
  selectedStation.value = station
}
</script>
