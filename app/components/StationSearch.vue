<template>
  <ClientOnly fallback-tag="div">
    <v-alert
      type="error"
      variant="tonal"
      class="mb-4"
      border="start"
    >
      <strong>API Outage:</strong> The VBB transit API (vbb-rest) is currently experiencing a complete outage.
      All data endpoints are returning 502/503 errors. Station search, departures, and journey planning are
      temporarily unavailable. See <a href="https://github.com/derhuerst/vbb-rest/issues/70" target="_blank">upstream issue #70</a>.
    </v-alert>

    <div class="d-flex align-center mb-2">
      <v-menu location="top">
        <template #activator="{ props }">
          <v-chip
            v-bind="props"
            :prepend-icon="healthIcon"
            :color="healthColor"
            size="small"
            label
            variant="flat"
            class="mr-2"
            style="cursor: pointer"
          >
            {{
              apiStatus === "healthy"
                ? "Online"
                : apiStatus === "unhealthy"
                  ? "API Outage"
                  : "Checking…"
            }}
          </v-chip>
        </template>
        <v-card density="compact" class="pa-2 text-body-2">
          {{
            apiStatus === "healthy"
              ? "The station search is operational."
              : apiStatus === "unhealthy"
                ? "vbb-rest API is down. All transit data unavailable."
                : "Checking API status…"
          }}
          Next check in {{ healthCountdown }}s.
        </v-card>
      </v-menu>
    </div>

    <v-text-field
      v-model="query"
      label="Search station"
      placeholder="Enter station name"
      clearable
      :loading="searchStatus === 'pending' && query"
      @click:clear="onClear"
    />

    <v-list v-if="stations && stations.length">
      <v-list-item
        v-for="station in stations"
        :key="station.id || station.name"
        :to="`/departures/${station.id}`"
        @click="selectStation(station)"
      >
        <v-list-item-title class="text-pre-wrap">{{ station.name }}</v-list-item-title>
        <div class="d-inline-flex ga-1">
          <v-img v-if="station.products?.bus" :src="getIconForProduct('bus')" width="24px"></v-img>
          <v-img
            v-if="station.products?.tram"
            :src="getIconForProduct('tram')"
            width="24px"
          ></v-img>
          <v-img
            v-if="station.products?.subway"
            :src="getIconForProduct('subway')"
            width="24px"
          ></v-img>
          <v-img
            v-if="station.products?.suburban"
            :src="getIconForProduct('suburban')"
            width="24px"
          ></v-img>
          <v-img
            v-if="station.products?.regional"
            :src="getIconForProduct('regional')"
            width="24px"
          ></v-img>
          <v-img
            v-if="station.products?.express"
            :src="getIconForProduct('express')"
            width="24px"
          ></v-img>
          <v-img
            v-if="station.products?.ferry"
            :src="getIconForProduct('ferry')"
            width="24px"
          ></v-img>
        </div>
        <v-divider v-if="stations.length > 1"></v-divider>
      </v-list-item>
    </v-list>

    <template v-else-if="searchStatus === 'pending'">
      <v-skeleton-loader type="list-item-avatar-two-line"></v-skeleton-loader>
    </template>
    <v-alert v-else-if="searchStatus === 'error'" type="error" class="mt-2">
      Failed to load stations. Please try again later.
      <v-btn
        :active="false"
        @click="refresh"
        variant="text"
        prepend-icon="mdi-refresh"
        color="on-surface"
        >Refresh</v-btn>
    </v-alert>
    <p v-else-if="query && searchStatus === 'success' && query === debouncedQuery" class="mt-2">
      No stations found
    </p>

    <template #fallback>
      <v-skeleton-loader type="chip, text"></v-skeleton-loader>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { refDebounced } from "@vueuse/core";
import { getIconForProduct } from "~/utils/transportIcons";
import { useApiHealth } from "~/utils/apiHealth";

const emit = defineEmits<{
  "station-selected": [station: any];
}>();

const { status: apiStatus, checkHealth } = useApiHealth();
const HEALTH_POLL_SECONDS = 300;
const healthCountdown = ref(HEALTH_POLL_SECONDS);
let healthInterval: ReturnType<typeof setInterval> | null = null;

const healthIcon = computed(() =>
  apiStatus.value === "healthy"
    ? "mdi-check-circle"
    : apiStatus.value === "unhealthy"
      ? "mdi-close-circle"
      : "mdi-help-circle",
);

const healthColor = computed(() =>
  apiStatus.value === "healthy" ? "success" : apiStatus.value === "unhealthy" ? "error" : "warning",
);

function startHealthPolling() {
  checkHealth();
  healthCountdown.value = HEALTH_POLL_SECONDS;
  if (healthInterval) clearInterval(healthInterval);
  healthInterval = setInterval(() => {
    healthCountdown.value--;
    if (healthCountdown.value <= 0) {
      checkHealth();
      healthCountdown.value = HEALTH_POLL_SECONDS;
    }
  }, 1000);
}

onMounted(() => {
  startHealthPolling();
});

onUnmounted(() => {
  if (healthInterval) clearInterval(healthInterval);
});

const query = ref("");
const debounceTime = 1000;
const debouncedQuery = refDebounced(query, debounceTime);

const {
  data: stations,
  status: searchStatus,
  refresh,
} = useAsyncData(
  () => `stations-${debouncedQuery.value}`,
  () => {
    if (debouncedQuery.value == null || !debouncedQuery.value.trim()) return [];
    return $fetch(
      `https://v6.vbb.transport.rest/locations?poi=false&addresses=false&query=${encodeURIComponent(debouncedQuery.value)}`,
    );
  },
  { default: () => [], watch: [debouncedQuery], timeout: debounceTime + 10000 },
);

function selectStation(station: any) {
  emit("station-selected", station);
  query.value = "";
  stations.value = [];
}

function onClear() {
  query.value = "";
  stations.value = [];
}
</script>
