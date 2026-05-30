<template>
  <div>
    <DeparturesSection :selected-station="selectedStation" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DeparturesSection from "~/components/DeparturesSection.vue";

const route = useRoute();

const stationId = computed(() => {
  const id = route.params.id as string;
  return id ? parseInt(id) : null;
});

// Fetch station details to get the name
const { data: stationData } = useAsyncData(
  () => `station-${stationId.value}`,
  async () => {
    if (!stationId.value) return null;
    try {
      return await $fetch(`https://v6.vbb.transport.rest/stops/${stationId.value}`);
    } catch (e) {
      return null;
    }
  },
  { watch: [stationId] },
);

const selectedStation = computed(() => {
  if (stationId.value) {
    return {
      id: stationId.value,
      name: stationData.value?.name,
    };
  }
  return null;
});

// Update page title dynamically
useHead({
  title: computed(() => selectedStation.value?.name || "Travel Comp"),
});
</script>
