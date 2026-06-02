<template>
  <v-btn to="/" prepend-icon="mdi-arrow-left" class="mb-2" variant="text"
    >Go back to stations search</v-btn
  >
  <!-- Progress bar for auto-refresh countdown -->
  <template v-if="departuresStatus === 'pending' && isInitialLoad">
    <v-skeleton-loader type="heading, paragraph, card-avatar@5"></v-skeleton-loader>
  </template>
  <v-alert v-else-if="departuresStatus === 'error'" type="error" class="mt-2">
    Failed to load stations. Please try again later.
    <v-btn
      :active="false"
      @click="refresh"
      variant="text"
      prepend-icon="mdi-refresh"
      color="on-surface"
      >Refresh</v-btn
    >
  </v-alert>
  <template v-else-if="response?.departures.length > 0" class="mt-4">
    <h2 class="text-h5 mb-4">
      {{ filteredDepartures.length }}
      {{ filteredDepartures.length === 1 ? "Departure" : "Departures" }} from
      {{ response?.departures[0]?.stop.name }}
    </h2>
    <div class="d-flex align-center mb-4">
      <div class="text-body-1 text-medium-emphasis">
        {{ formattedTime }} | {{ formattedDate }} | Next update in {{ countdown }}s
      </div>
    </div>
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
    <v-card
      v-for="dep in filteredDepartures"
      :key="dep.tripId + dep.when"
      class="mb-3"
      elevation="2"
    >
      <div class="pa-3">
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

                <div class="d-flex flex-column flex-md-row ga-1 mt-1 align-start">
                  <v-chip
                    density="comfortable"
                    size="small"
                    label
                    variant="flat"
                    color="info"
                    v-if="!!dep.platform"
                    class="text-body-2 text-medium-emphasis"
                  >
                    <span v-if="!dep.platform.includes('Pos')">Pl. {{ dep.platform }}</span
                    ><span v-else>{{ dep.platform }}</span>
                  </v-chip>
                  <v-chip
                    v-if="getOccupancy(dep)"
                    density="comfortable"
                    size="small"
                    label
                    variant="flat"
                    :color="getOccupancy(dep)!.color"
                    :prepend-icon="getOccupancy(dep)!.icon"
                  >
                    {{ getOccupancy(dep)!.title }}
                  </v-chip>
                </div>
                <div class="d-sm-none d-flex align-center ga-1 mt-1">
                  <v-chip
                    density="comfortable"
                    size="small"
                    label
                    variant="flat"
                    prepend-icon="mdi-clock-outline"
                    class="text-body-2"
                  >
                    {{
                      dep.when
                        ? Math.floor(
                            (new Date(dep.when).getTime() - new Date().getTime()) / 60000,
                          ) + " min"
                        : "Time not available"
                    }}
                  </v-chip>
                  <v-chip
                    v-if="dep.delay && dep.delay > 0"
                    density="comfortable"
                    size="small"
                    label
                    variant="flat"
                    :color="dep.delay > 300 ? 'error' : 'warning'"
                    prepend-icon="mdi-clock-alert-outline"
                    class="text-body-2"
                  >
                    +{{ Math.floor(dep.delay / 60) }} min
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" sm="4" class="d-none d-sm-flex flex-column align-end ga-1">
            <v-chip
              density="comfortable"
              size="small"
              label
              variant="flat"
              prepend-icon="mdi-clock-outline"
              class="text-body-2"
            >
              {{
                dep.when
                  ? Math.floor((new Date(dep.when).getTime() - new Date().getTime()) / 60000) +
                    " min"
                  : "Time not available"
              }}
            </v-chip>
            <v-chip
              v-if="dep.delay && dep.delay > 0"
              density="comfortable"
              size="small"
              label
              variant="flat"
              :color="dep.delay > 300 ? 'error' : 'warning'"
              prepend-icon="mdi-clock-alert-outline"
              class="text-body-2"
            >
              +{{ Math.floor(dep.delay / 60) }} min delay
            </v-chip>
          </v-col>
        </v-row>
      </div>

      <v-card-actions v-if="getDisplayableRemarks(dep).length > 0" class="pt-0">
        <v-btn variant="text" size="small" @click="toggleExpand(dep)">
          {{ isExpanded(dep) ? "See less" : "See more" }}
        </v-btn>
        <v-spacer />
      </v-card-actions>

      <v-expand-transition>
        <div v-show="isExpanded(dep)">
          <v-divider />
          <div class="pa-3">
            <div
              v-for="(remark, i) in getDisplayableRemarks(dep)"
              :key="i"
              class="d-flex align-start py-1"
            >
              <v-icon :icon="remark.icon" size="small" class="mr-2 mt-1" />
              <span class="text-body-2" v-html="remark.text" />
            </div>
          </div>
        </div>
      </v-expand-transition>
    </v-card>
  </template>
  <template v-else>
    <div class="d-md-flex align-center">
      No departures found. You can try again later.
      <v-btn
        :active="false"
        @click="refresh"
        variant="text"
        prepend-icon="mdi-refresh"
        color="on-surface"
        >Refresh</v-btn
      >
    </div>
  </template>
</template>

<script setup lang="ts">
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiBus, mdiFerry, mdiSubway, mdiTrain, mdiTrainVariant, mdiTram } from "@mdi/js";
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
  remarks?: Array<{
    type: string;
    code?: string;
    text: string;
  }>;
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
    currentTime.value = new Date();
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval!);
      refresh();
      startCountdown();
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

const {
  data: response,
  status: departuresStatus,
  refresh,
} = useAsyncData<DeparturesResponse>(
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
watch(
  departuresStatus,
  (newStatus) => {
    if (newStatus === "success" && isInitialLoad.value) {
      isInitialLoad.value = false;
    }
  },
  { immediate: true },
);

const availableProducts = computed(() => {
  const products = new Set<string>();
  response.value?.departures.forEach((dep) => products.add(dep.line.product));
  return products;
});

const selectedProducts = ref<string[]>([]);

const filteredDepartures = computed(() => {
  if (selectedProducts.value.length === 0 || !response.value)
    return response.value?.departures || [];
  return response.value.departures.filter((dep) =>
    selectedProducts.value.includes(dep.line.product),
  );
});

function getOccupancy(dep: Departure) {
  const occ = dep.remarks?.find((r) => r.code?.startsWith("text.occup.loc.max"));
  if (!occ) return null;
  const isLow = occ.code?.endsWith("11");
  const isMed = occ.code?.endsWith("12");
  return {
    icon: isLow ? "mdi-account" : isMed ? "mdi-account-multiple" : "mdi-account-group",
    color: isLow ? "success" : isMed ? "warning" : "error",
    title: occ.text,
  };
}

const expandedTripId = ref<string | null>(null);

function toggleExpand(dep: Departure) {
  expandedTripId.value = expandedTripId.value === dep.tripId ? null : dep.tripId;
}

function isExpanded(dep: Departure) {
  return expandedTripId.value === dep.tripId;
}

const displayableRemarkCodes = new Set(["WV", "gu", "hj"]);

function getDisplayableRemarks(dep: Departure) {
  const items: Array<{ icon: string; text: string }> = [];
  for (const r of dep.remarks ?? []) {
    if (r.type === "warning") {
      items.push({ icon: "mdi-alert", text: r.text });
    } else if (r.code && displayableRemarkCodes.has(r.code)) {
      const icon =
        r.code === "WV"
          ? "mdi-wifi"
          : r.code === "hj"
            ? "mdi-information"
            : "mdi-wheelchair-accessibility";
      items.push({ icon, text: r.text });
    }
  }
  return items;
}
</script>
