<template>
  <div>
    <v-text-field
      v-model="query"
      label="Search station"
      placeholder="Enter station name"
      clearable
    />

    <v-list v-if="stations && stations.length">
      <v-list-item
        v-for="station in stations"
        :key="station.id || station.name"
        @click="selectStation(station)"
      >
        <v-list-item-title>{{ station.name }}</v-list-item-title>
        <template #append>
          <div class="d-flex flex-wrap ga-1">
            <v-img
              v-if="station.products?.bus"
              :src="getIconForProduct('bus')"
              width="30px"
            ></v-img>
            <v-img
              v-if="station.products?.tram"
              :src="getIconForProduct('tram')"
              width="30px"
            ></v-img>
            <v-img
              v-if="station.products?.subway"
              :src="getIconForProduct('subway')"
              width="30px"
            ></v-img>
            <v-img
              v-if="station.products?.suburban"
              :src="getIconForProduct('suburban')"
              width="30px"
            ></v-img>
            <v-img
              v-if="station.products?.regional"
              :src="getIconForProduct('regional')"
              width="30px"
            ></v-img>
            <v-img
              v-if="station.products?.express"
              :src="getIconForProduct('express')"
              width="30px"
            ></v-img>
            <v-img
              v-if="station.products?.ferry"
              :src="getIconForProduct('ferry')"
              width="30px"
            ></v-img>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <template v-else-if="searchStatus === 'pending'">
      <v-skeleton-loader type="table"></v-skeleton-loader>
    </template>
    <p v-else-if="query">No stations found</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getIconForProduct } from '~/utils/transportIcons'

const emit = defineEmits<{
  'station-selected': [station: any]
}>()

const query = ref('')

const { data: stations, refresh, status: searchStatus } = useAsyncData(
  () => `stations-${query.value}`,
  () => {
    if (!query.value.trim()) return []
    return $fetch(
      `https://v6.vbb.transport.rest/locations?poi=false&addresses=false&query=${encodeURIComponent(query.value)}`,
    )
  },
  { default: () => [] },
)

function selectStation(station: any) {
  emit('station-selected', station)
  query.value = ''
  stations.value = []
}

watch(query, () => {
  refresh()
})
</script>
