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
    <div class="d-flex align-center mb-4 ga-1">
      <span
        class="text-body-1 text-medium-emphasis"
        style="cursor: pointer"
        @click="openPickerDialog"
      >
        <template v-if="customDepartureTime">
          Showing departures for {{ formatCustomTime }}
        </template>
        <template v-else>
          {{ formattedTime }} | {{ formattedDate }} | Next update in {{ countdown }}s
        </template>
      </span>
      <v-btn
        v-if="customDepartureTime"
        @click="resetToNow"
        variant="text"
        color="primary"
        size="small"
        class="text-body-2"
      >
        Now
      </v-btn>
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
                    {{ dep.when ? formatRelativeTime(dep.when) : "Time not available" }}
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
              {{ dep.when ? formatRelativeTime(dep.when) : "Time not available" }}
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
  <v-bottom-sheet v-model="dialogVisible" max-width="400" inset>
    <v-card>
      <v-card-text class="pb-0 pt-2">
        <v-date-picker
          v-model="datePickerValue"
          :min="minDate"
          :max="maxDate"
          hide-header
          hide-weekdays
          no-month-picker
          tile
          :elevation="0"
          :control-height="36"
          control-variant="modal"
        />
        <v-time-picker
          v-model="timePickerValue"
          density="compact"
          format="24hr"
          hide-header
          tile
          variant="input"
          :elevation="0"
          class="mt-2"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="primary" @click="resetToNow"> Now </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="dialogVisible = false">Cancel</v-btn>
        <v-btn variant="text" color="primary" @click="applyDateTime">Apply</v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
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

const customDepartureTime = ref<Date | null>(null);

const currentTime = ref(new Date());

const datePickerValue = ref<Date | null>(null);
const timePickerValue = ref("");
const dialogVisible = ref(false);

function toHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function toLocalDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const dayMs = 86400000;
const minDate = toLocalDate(new Date(Date.now() - 5 * dayMs));
const maxDate = toLocalDate(new Date(Date.now() + 5 * dayMs));

function formatRelativeTime(when: string): string {
  const diffMs = new Date(when).getTime() - Date.now();
  const isPast = diffMs < 0;
  const totalMin = Math.floor(Math.abs(diffMs) / 60000);
  let duration: string;
  if (totalMin < 60) {
    duration = `${totalMin} min`;
  } else if (totalMin < 1440) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    duration = m > 0 ? `${h} h ${m} min` : `${h} h`;
  } else {
    const days = Math.floor(totalMin / 1440);
    const rem = totalMin % 1440;
    const h = Math.floor(rem / 60);
    const m = rem % 60;
    duration = `${days} d`;
    if (h > 0) duration += ` ${h} h`;
    if (m > 0) duration += ` ${m} min`;
  }
  return isPast ? `${duration} ago` : duration;
}

function toISOLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const zh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const zm = String(Math.abs(offset) % 60).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}:00${sign}${zh}:${zm}`;
}

const formatCustomTime = computed(() => {
  if (!customDepartureTime.value) return "";
  return customDepartureTime.value.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
});

const effectiveWhen = computed(() => {
  if (!customDepartureTime.value) return undefined;
  return toISOLocal(customDepartureTime.value);
});

function openPickerDialog() {
  const d = customDepartureTime.value ?? new Date();
  datePickerValue.value = toLocalDate(d);
  timePickerValue.value = toHHMM(d);
  dialogVisible.value = true;
}

function applyDateTime() {
  if (!datePickerValue.value || !timePickerValue.value) return;
  const [h, min] = timePickerValue.value.split(":").map(Number);
  const { value: date } = datePickerValue;
  customDepartureTime.value = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, min);
  dialogVisible.value = false;
  stopCountdown();
  refresh();
}

function resetToNow() {
  customDepartureTime.value = null;
  dialogVisible.value = false;
  startCountdown();
  refresh();
}

const countdown = ref(60);
let countdownInterval: number | null = null;

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

const startCountdown = () => {
  stopCountdown();
  countdown.value = 60;
  countdownInterval = setInterval(() => {
    currentTime.value = new Date();
    countdown.value--;
    if (countdown.value <= 0) {
      refresh();
      startCountdown();
    }
  }, 1000);
};

onMounted(() => {
  if (!customDepartureTime.value) {
    startCountdown();
  }
});

onUnmounted(() => {
  stopCountdown();
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
    const when = effectiveWhen.value;
    const data = await $fetch<DeparturesResponse>(
      `https://v6.vbb.transport.rest/stops/${props.selectedStation.id}/departures?results=20&duration=100${when ? `&when=${encodeURIComponent(when)}` : ""}`,
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
