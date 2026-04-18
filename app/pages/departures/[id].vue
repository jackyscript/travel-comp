<template>
  <div>
    <DeparturesSection :selected-station="selectedStation" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DeparturesSection from '~/components/DeparturesSection.vue'

const route = useRoute()

const selectedStation = computed(() => {
  const id = route.params.id as string
  if (id) {
    return { id: parseInt(id) }
  }
  return null
})
</script>