<template>
  <v-container>
    <v-switch v-model="view" :label="view === 'search' ? 'Departures' : 'Transit connections'" inset="material"
      true-icon="mdi-transit-connection-variant" false-value="search" true-value="routing" false-icon="mdi-bus-clock"
      size="x-large" color="secondary" base-color="secondary"></v-switch>
    <StationSearch v-if="view === 'search'" @station-selected="handleStationSelected" />
    <Routing v-else-if="view === 'routing'"></Routing>
  </v-container>
</template>

<script setup lang="ts">
const selectedStation = ref<any>(null);

const view = ref('search')

function handleStationSelected(station: any) {
  selectedStation.value = station;
}
</script>
