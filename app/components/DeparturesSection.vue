<template>
  <v-btn to="/" prepend-icon="mdi-arrow-left" class="mb-2" variant="text"
    >Go back to stations search</v-btn
  >
  <template v-if="departuresStatus === 'pending'">
    <v-skeleton-loader type="heading"></v-skeleton-loader>
    <v-skeleton-loader type="paragraph"></v-skeleton-loader>
    <v-skeleton-loader type="card"></v-skeleton-loader>
  </template>
  <template v-else-if="response?.departures.length > 0" class="mt-4">
    <v-row v-if="availableProducts.size > 1" class="mb-4" align="center">
      <v-col>
        <v-btn-toggle
          v-model="selectedProducts"
          multiple
          variant="flat"
          divided
          density="comfortable"
        >
          <v-btn
            v-for="product in availableProducts"
            :key="product"
            :value="product"
            :color="getColorForProduct(product)"
            icon
          >
            <svg-icon
              :path="
                product === 'bus'
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
              "
              type="mdi"
            />
          </v-btn>
        </v-btn-toggle>
        <v-btn
          v-if="selectedProducts.length > 0"
          @click="selectedProducts = []"
          size="small"
          class="ml-2"
          icon
          title="Reset filters"
          variant="flat"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <h2 class="text-h5 mb-4">
      Departures from {{ response?.departures[0]?.stop.name }}
    </h2>
    <div class="text-body-1 text-medium-emphasis mb-4">
      {{ formattedTime }} • {{ formattedDate }}
    </div>
    <v-card
      v-for="dep in filteredDepartures"
      :key="dep.tripId"
      class="mb-3 pa-3"
      elevation="2"
    >
      <v-row align="center" density="compact">
        <v-col cols="12" sm="8">
          <v-row align="center" density="compact">
            <v-col cols="auto" class="mr-2">
              <v-img
                :src="getIconForProduct(dep.line.product)"
                width="40px"
                height="40px"
              ></v-img>
            </v-col>
            <v-col>
              <div class="text-h6">
                <v-chip
                  density="comfortable"
                  size="small"
                  class="mr-2"
                  label
                  variant="flat"
                  :color="getColorForProduct(dep.line.product)"
                  >{{ dep.line.name }}</v-chip
                >
                {{ dep.direction }}
              </div>

              <v-chip
                density="comfortable"
                size="small"
                label
                variant="flat"
                color="info"
                v-if="!!dep.platform"
                class="text-body-2 text-medium-emphasis"
              >
                <span v-if="!dep.platform.includes('Pos')"
                  >Pl. {{ dep.platform }}</span
                ><span v-else>{{ dep.platform }}</span>
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
        <v-col
          cols="12"
          sm="4"
          class="d-none d-sm-flex align-center justify-end"
        >
          <div class="text-body-1 font-weight-medium text-right">
            {{
              dep.when
                ? Math.floor(
                    (new Date(dep.when).getTime() - new Date().getTime()) /
                      60000,
                  ) + " min"
                : "Time not available"
            }}
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

// Current time display
const currentTime = ref(new Date());

const updateCurrentTime = () => {
  currentTime.value = new Date();
};

let timeInterval: number | null = null;

onMounted(() => {
  // Update time every minute
  timeInterval = setInterval(updateCurrentTime, 60000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
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

const { data: response, status: departuresStatus } =
  useAsyncData<DeparturesResponse>(
    () => `departures-${stationId.value}`,
    async () => {
      if (!props.selectedStation) return { departures: [] };
      return await $fetch<DeparturesResponse>(
        `https://v6.vbb.transport.rest/stops/${props.selectedStation.id}/departures?results=20&duration=100`,
      );
    },
    { default: () => ({ departures: [] }) },
  );

const availableProducts = computed(() => {
  const products = new Set<string>();
  response.value.departures.forEach((dep) => products.add(dep.line.product));
  return products;
});

const selectedProducts = ref<string[]>([]); // or ref(null) if only one can be selected

const filteredDepartures = computed(() => {
  if (selectedProducts.value.length === 0) return response.value.departures;
  return response.value.departures.filter((dep) =>
    selectedProducts.value.includes(dep.line.product),
  );
});
</script>
