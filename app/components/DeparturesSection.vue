<template>
  <div v-if="selectedStation" class="mt-4">
    <h2 class="text-h5 mb-4">Departures from {{ selectedStation.name }}</h2>
    <div class="text-body-1 text-medium-emphasis mb-4">
      {{ formattedTime }} • {{ formattedDate }}
    </div>
    <template v-if="departuresStatus === 'pending'">
      <v-skeleton-loader type="card" v-for="n in 3" :key="n" class="mb-2"></v-skeleton-loader>
    </template>
    <template v-else-if="response && response.departures && response.departures.length > 0">
      <v-card
        v-for="dep in response.departures"
        :key="dep.tripId"
        class="mb-3 pa-3"
        elevation="2"
      >
        <v-row align="center" density="compact">
          <v-col cols="12" md="8">
            <v-row align="center" density="compact">
              <v-col cols="auto" class="mr-3">
                <v-img
                  :src="getIconForProduct(dep.line.product)"
                  width="40px"
                  height="40px"
                ></v-img>
              </v-col>
              <v-col>
                <div class="text-h6">{{ dep.line.name }} to {{ dep.direction }}</div>
                <div class="text-body-2 text-medium-emphasis d-md-none">
                  {{ dep.when ? Math.floor((new Date(dep.when).getTime() - new Date().getTime()) / 60000) + ' min' : 'Time not available' }}
                  <span
                    v-if="dep.delay && dep.delay > 0"
                    :class="dep.delay > 60 ? 'text-error' : 'text-success'"
                    class="ml-2"
                  >
                    +{{ Math.floor(dep.delay / 60) }} min
                  </span>
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="4" class="d-none d-md-flex align-center justify-end">
            <div class="text-body-1 font-weight-medium text-right">
              {{ dep.when ? Math.floor((new Date(dep.when).getTime() - new Date().getTime()) / 60000) + ' min' : 'Time not available' }}
              <div
                v-if="dep.delay && dep.delay > 0"
                :class="dep.delay > 60 ? 'text-error' : 'text-success'"
                class="text-caption mt-1"
              >
                +{{ Math.floor(dep.delay / 60) }} min delay
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </template>
    <template v-else>
      <p>No departures found</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { getIconForProduct } from '~/utils/transportIcons'

interface Departure {
  tripId: string
  line: {
    name: string
    product: string
  }
  direction: string
  when?: string
  delay?: number
}

interface DeparturesResponse {
  departures: Departure[]
}

const props = defineProps<{
  selectedStation: any
}>()

const stationId = computed(() => props.selectedStation?.id)

// Current time display
const currentTime = ref(new Date())

const updateCurrentTime = () => {
  currentTime.value = new Date()
}

let timeInterval: number | null = null

onMounted(() => {
  // Update time every minute
  timeInterval = setInterval(updateCurrentTime, 60000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Format current time and date
const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const { data: response, status: departuresStatus } = useAsyncData<DeparturesResponse>(
  () => `departures-${stationId.value}`,
  async () => {
    if (!props.selectedStation) return { departures: [] }
    return await $fetch<DeparturesResponse>(
      `https://v6.vbb.transport.rest/stops/${props.selectedStation.id}/departures?results=5&duration=60`,
    )
  },
  { default: () => ({ departures: [] }) },
)
</script>
