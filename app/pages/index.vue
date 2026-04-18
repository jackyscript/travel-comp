<template>
  <v-container>
    <StationSearch @station-selected="handleStationSelected" />
  </v-container>
</template>

<script setup lang="ts">
const selectedStation = ref<any>(null)

function handleStationSelected(station: any) {
  selectedStation.value = station
}

</script>