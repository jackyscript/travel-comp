<template>
  <v-btn to="/" prepend-icon="mdi-arrow-left" class="mb-2" variant="text">Go back to stations search</v-btn>
  <!-- Progress bar for auto-refresh countdown -->
  <template v-if="departuresStatus === 'pending' && isInitialLoad">
    <v-skeleton-loader type="heading"></v-skeleton-loader>
    <v-skeleton-loader type="paragraph"></v-skeleton-loader>
    <v-skeleton-loader type="card"></v-skeleton-loader>
  </template>
  <v-alert v-else-if="departuresStatus === 'error'" type="error" class="mt-2">
    Failed to load stations. Please try again later.
    <v-btn :active="false" @click="refresh" variant="text" prepend-icon="mdi-refresh"
      color="on-surface">Refresh</v-btn>
  </v-alert>
  <template v-else-if="response?.departures.length > 0" class="mt-4">
    <h2 class="text-h5 mb-4">
      {{ filteredDepartures.length }} {{ filteredDepartures.length === 1 ? "Departure" : "Departures" }} from {{
        response?.departures[0]?.stop.name }}
    </h2>
    <div class="d-flex align-center mb-4">
      <div class="text-body-1 text-medium-emphasis">
        {{ formattedTime }} | {{
          formattedDate }} | Next update in {{ countdown }}s
      </div>
    </div>  
    <v-row v-if="availableProducts.size > 1" class="mb-4" align="center">
      <v-col>
        <v-btn-toggle v-model="selectedProducts" multiple variant="flat" divided density="comfortable">
          <v-btn v-for="product in availableProducts" :key="product" :value="product"
            :color="getColorForProduct(product)" icon>
            <svg-icon :path="product === 'bus'
              ? mdiBus
              : product === 'tram'
                ? mdiTram
                : product === 'suburban'
                  ? mdiTrain
                  : product === 'subway'
                    ? mdiSubway
                    : product === 'ferry'
                      ? mdiFerry
                      : mdiTrainVariant
              " type="mdi" />
          </v-btn>
        </v-btn-toggle>
        <v-btn v-if="selectedProducts.length > 0" @click="selectedProducts = []" size="small" class="ml-2" icon
          title="Reset filters" variant="flat">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-card v-for="dep in filteredDepartures" :key="dep.tripId" class="mb-3 pa-3" elevation="2">
      <v-row align="center" density="compact">
        <v-col cols="12" sm="8">
          <v-row align="center" density="compact">
            <v-col cols="auto" class="mr-2">
              <v-img :src="getIconForProduct(dep.line.product)" width="40px" height="40px"></v-img>
            </v-col>
            <v-col>
              <div class="text-h6">
                <v-chip density="comfortable" size="small" class="mr-2" label variant="flat"
                  :color="getColorForProduct(dep.line.product)">{{ dep.line.name }}</v-chip>
                {{ dep.direction }}
              </div>

              <v-chip density="comfortable" size="small" label variant="flat" color="info" v-if="!!dep.platform"
                class="text-body-2 text-medium-emphasis">
                <span v-if="!dep.platform.includes('Pos')">Pl. {{ dep.platform }}</span><span v-else>{{ dep.platform
                  }}</span>
              </v-chip>
              <div class="text-body-2 text-medium-emphasis d-sm-none">
                {{
                  dep.when
                    ? Math.floor(
                      (new Date(dep.when).getTime() - new Date().getTime()) /
                      60000,
                    ) + " min"
                    : "Time not available"
                }}
                <span v-if="dep.delay && dep.delay > 0" :class="dep.delay > 60 ? 'text-error' : 'text-success'"
                  class="ml-2">
                  +{{ Math.floor(dep.delay / 60) }} min
                </span>
              </div>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="4" class="d-none d-sm-flex align-center justify-end">
          <div class="text-body-1 font-weight-medium text-right">
            {{
              dep.when
                ? Math.floor(
                  (new Date(dep.when).getTime() - new Date().getTime()) /
                  60000,
                ) + " min"
                : "Time not available"
            }}
            <div v-if="dep.delay && dep.delay > 0" :class="dep.delay > 60 ? 'text-error' : 'text-success'"
              class="text-caption mt-1">
              +{{ Math.floor(dep.delay / 60) }} min delay
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </template>
  <template v-else>
    <div class="d-md-flex align-center">
      No departures found. You can try again later.
      <v-btn :active="false" @click="refresh" variant="text" prepend-icon="mdi-refresh"
        color="on-surface">Refresh</v-btn>
    </div>
  </template>
</template>

<script setup lang="ts">
import SvgIcon from "@jamescoyle/vue-icon";
import {
  mdiBus,
  mdiFerry,
  mdiSubway,
  mdiTrain,
  mdiTrainVariant,
  mdiTram,
} from "@mdi/js";
import { getIconForProduct } from "~/utils/transportIcons";

interface Departure {
  tripId: string;
  line: {
    name: string;
    product: string;
  };
  direction: string;
  when?: string;
  delay?: number;
  stop: {
    name: string;
  };
  platform?: string;
}

interface DeparturesResponse {
  departures: Departure[];
}

const props = defineProps<{
  selectedStation: any;
}>();

const stationId = computed(() => props.selectedStation?.id);
const isInitialLoad = ref(true);

const currentTime = ref(new Date());

const countdown = ref(60);
let countdownInterval: number | null = null;

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  countdown.value = 60;
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval!);
      refresh();
      startCountdown(); // Restart the countdown
    }
  }, 1000);
};

onMounted(() => {
  startCountdown();
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});


// Format current time and date
const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
});

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const { data: response, status: departuresStatus, refresh } =
  useAsyncData<DeparturesResponse>(
    () => `departures-${stationId.value}`,
    async () => {
      if (!props.selectedStation) return { departures: [] };
      const data = await $fetch<DeparturesResponse>(
        `https://v6.vbb.transport.rest/stops/${props.selectedStation.id}/departures?results=20&duration=100`,
      );
      return data;
    },
    { default: () => ({ departures: [] }), timeout: 10000 },
  );

// After the first data fetch, set isInitialLoad to false
watch(departuresStatus, (newStatus) => {
  if (newStatus === 'success' && isInitialLoad.value) {
    isInitialLoad.value = false;
  }
}, { immediate: true });

const availableProducts = computed(() => {
  const products = new Set<string>();
  response.value?.departures.forEach((dep) => products.add(dep.line.product));
  return products;
});

const selectedProducts = ref<string[]>([]);

const filteredDepartures = computed(() => {
  if (selectedProducts.value.length === 0 || !response.value) return response.value?.departures || [];
  return response.value.departures.filter((dep) =>
    selectedProducts.value.includes(dep.line.product),
  );
});
</script>