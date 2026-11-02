<template>
  <div>
    <ViewToggle />
    <StationSearch @station-selected="handleStationSelected" />
  </div>
</template>

<script setup lang="ts">
const selectedStation = ref<any>(null);

function handleStationSelected(station: any) {
  selectedStation.value = station;
}
</script>
