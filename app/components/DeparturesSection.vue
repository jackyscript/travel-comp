<template>
  <v-card v-if="selectedStation" class="mt-4">
    <v-card-title>Departures from {{ selectedStation.name }}</v-card-title>
    <v-card-text>
      <template v-if="departuresStatus === 'pending'">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </template>
      <template v-else-if="response && response.departures && response.departures.length > 0">
        <v-list>
          <v-list-item v-for="dep in response.departures" :key="dep.tripId">
            <v-list-item-title class="ml-2">
              {{ dep.line.name }} to {{ dep.direction }}
            </v-list-item-title>
            <template #prepend>
              <v-img
                :src="getIconForProduct(dep.line.product)"
                width="30px"
              ></v-img>
            </template>
            <template #append>
              <v-chip variant="flat" class="ml-2 font-weight-bold" v-if="dep.when">
                {{ Math.floor((new Date(dep.when) - new Date()) / 60000) }}
                min
              </v-chip>
              <v-chip
                class="ml-2"
                :color="dep.delay > 1 * 60 ? 'red' : 'green'"
                v-if="dep.delay > 0"
              >
                {{ dep.delay > 0 ? '+' : '-' }}{{ dep.delay / 60 }} min
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </template>
      <template v-else>
        <p>No departures found</p>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getIconForProduct } from '~/utils/transportIcons'

const props = defineProps<{
  selectedStation: any
}>()

const stationId = computed(() => props.selectedStation?.id)

const { data: response, status: departuresStatus } = useAsyncData(
  () => `departures-${stationId.value}`,
  () => {
    if (!props.selectedStation) return { departures: [] }
    return $fetch(
      `https://v6.vbb.transport.rest/stops/${props.selectedStation.id}/departures?results=5&duration=60`,
    )
  },
  { default: () => ({ departures: [] }) },
)
</script>
