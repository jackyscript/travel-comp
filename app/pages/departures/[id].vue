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
  const name = route.query.name as string
  if (id && name) {
    return { id: parseInt(id), name: decodeURIComponent(name) }
  }
  return null
})
</script>