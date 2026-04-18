<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <v-app-bar app>
      <v-app-bar-title>Travel Comp</v-app-bar-title>
    </v-app-bar>

    <v-main class="pt-16">
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
