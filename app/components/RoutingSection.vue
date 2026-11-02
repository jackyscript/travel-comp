<template>
  <ClientOnly fallback-tag="div">
    <div class="d-flex flex-column ga-3">
      <v-autocomplete v-model="startStation" v-model:search="startQuery" :label="t('routing.start')"
        :items="startStations" item-title="name" item-value="id" return-object no-filter auto-select-first="exact"
        clearable :no-data-text="t('search.noResults')"
        :hide-no-data="!startQuery || startSearchStatus !== 'success' || startQuery !== debouncedStartQuery"
        :loading="startSearchStatus === 'pending' && !!startQuery" @click:clear="onStartStationClear">
        <template #item="{ props: itemProps, item }">
          <v-list-item v-bind="itemProps">
            <template #append>
              <div class="d-inline-flex ga-1">
                <v-img v-for="product in stationProducts(item)" :key="product" :src="getIconForProduct(product)"
                  width="24px"></v-img>
              </div>
            </template>
          </v-list-item>
        </template>
      </v-autocomplete>

      <v-alert v-if="startSearchStatus === 'error'" type="error">
        {{ t("search.loadError") }}
        <v-btn :active="false" @click="refresh" variant="text" prepend-icon="mdi-refresh" color="on-surface">{{
          t("common.refresh") }}</v-btn>
      </v-alert>

      <template v-if="showVia">
        <v-autocomplete v-model="viaStation" v-model:search="viaQuery" :label="t('routing.via')" :items="viaStations"
          item-title="name" item-value="id" return-object no-filter auto-select-first="exact" clearable
          :no-data-text="t('search.noResults')" :hide-no-data="!viaQuery || viaSearchStatus !== 'success' || viaQuery !== debouncedViaQuery"
          :loading="viaSearchStatus === 'pending' && !!viaQuery" @click:clear="onViaStationClear">
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps">
              <template #append>
                <div class="d-inline-flex ga-1">
                  <v-img v-for="product in stationProducts(item)" :key="product" :src="getIconForProduct(product)"
                    width="24px"></v-img>
                </div>
              </template>
            </v-list-item>
          </template>
          <template #append>
            <v-btn icon="mdi-close" variant="text" :title="t('routing.removeVia')" @click="onRemoveVia"></v-btn>
          </template>
        </v-autocomplete>

        <v-alert v-if="viaSearchStatus === 'error'" type="error">
          {{ t("search.loadError") }}
          <v-btn :active="false" @click="refreshVia" variant="text" prepend-icon="mdi-refresh" color="on-surface">{{
            t("common.refresh") }}</v-btn>
        </v-alert>
      </template>
      <v-btn v-else variant="text" size="small" prepend-icon="mdi-plus" @click="showVia = true">
        {{ t("routing.addVia") }}
      </v-btn>

      <v-autocomplete v-model="destinationStation" v-model:search="destinationQuery" :label="t('routing.destination')"
        :items="destinationStations" item-title="name" item-value="id" return-object no-filter auto-select-first="exact"
        clearable :no-data-text="t('search.noResults')"
        :hide-no-data="!destinationQuery || destinationSearchStatus !== 'success' || destinationQuery !== debouncedDestinationQuery"
        :loading="destinationSearchStatus === 'pending' && !!destinationQuery" @click:clear="onDestinationStationClear">
        <template #item="{ props: itemProps, item }">
          <v-list-item v-bind="itemProps">
            <template #append>
              <div class="d-inline-flex ga-1">
                <v-img v-for="product in stationProducts(item)" :key="product" :src="getIconForProduct(product)"
                  width="24px"></v-img>
              </div>
            </template>
          </v-list-item>
        </template>
      </v-autocomplete>

      <v-alert v-if="destinationSearchStatus === 'error'" type="error">
        {{ t("search.loadError") }}
        <v-btn :active="false" @click="refreshDestination" variant="text" prepend-icon="mdi-refresh"
          color="on-surface">{{ t("common.refresh") }}</v-btn>
      </v-alert>

      <v-alert v-if="sameStation" type="warning">
        {{ t("routing.sameStation") }}
      </v-alert>

      <TimeControl v-if="startStation && destinationStation && !sameStation" v-model="customTravelTime"
        :custom-label="customTimeLabel" :auto-refresh="false" />

      <template v-if="journeyStatus === 'pending' && startStation && destinationStation && !sameStation">
        <v-skeleton-loader type="card@3"></v-skeleton-loader>
      </template>
      <v-alert v-else-if="journeyStatus === 'error'" type="error">
        {{ t("routing.loadError") }}
        <v-btn :active="false" @click="refreshJourney" variant="text" prepend-icon="mdi-refresh"
          color="on-surface">{{ t("common.refresh") }}</v-btn>
      </v-alert>
      <template v-else-if="journeys?.journeys?.length">
        <h2 class="text-h5 mb-4">
          {{
            t("routing.title", {
              count: journeys.journeys.length,
              from: startStation?.name,
              to: destinationStation?.name,
            })
          }}
        </h2>
        <v-card v-for="(journey, journeyIndex) in journeys.journeys" :key="journeyIndex" class="mb-3" elevation="2"
          role="button" tabindex="0" :aria-expanded="isJourneyExpanded(journeyIndex)" style="cursor: pointer"
          @click="toggleJourney(journeyIndex)" @keydown.enter.prevent="toggleJourney(journeyIndex)"
          @keydown.space.prevent="toggleJourney(journeyIndex)">
          <div class="pa-3">
            <div class="d-flex align-center flex-wrap ga-2">
              <span class="text-h6">{{ formatJourneyTime(journeyStart(journey)) }}</span>
              <v-icon size="small">mdi-arrow-right</v-icon>
              <span class="text-h6">{{ formatJourneyTime(journeyEnd(journey)) }}</span>
              <v-chip v-if="journeyDuration(journey)" density="comfortable" size="small" label variant="flat"
                prepend-icon="mdi-clock-outline">
                {{ journeyDuration(journey) }}
              </v-chip>
              <v-chip v-if="transferCount(journey) === 0" density="comfortable" size="small" label variant="flat"
                color="success">
                {{ t("routing.direct") }}
              </v-chip>
              <v-chip v-else density="comfortable" size="small" label variant="flat">
                {{ t("routing.transfers", { count: transferCount(journey) }) }}
              </v-chip>
              <v-chip v-if="journeyDelay(journey) > 0" density="comfortable" size="small" label variant="flat"
                :color="journeyDelay(journey) > 300 ? 'error' : 'warning'" prepend-icon="mdi-clock-alert-outline">
                {{ t("routing.delay", { minutes: Math.floor(journeyDelay(journey) / 60) }) }}
              </v-chip>
              <v-spacer />
              <span class="text-body-2 text-medium-emphasis d-inline-flex align-center ga-1">
                {{ isJourneyExpanded(journeyIndex) ? t("routing.hideDetails") : t("routing.showDetails") }}
                <v-icon size="small">{{
                  isJourneyExpanded(journeyIndex) ? "mdi-chevron-up" : "mdi-chevron-down"
                }}</v-icon>
              </span>
            </div>

            <div class="d-flex align-center flex-wrap ga-1 mt-2">
              <template v-if="transitLegs(journey).length">
                <template v-for="(leg, legIndex) in transitLegs(journey)" :key="legIndex">
                  <v-chip density="compact" size="small" label variant="flat" :color="getLineColor(leg.line)"
                    :style="{ color: getLineTextColor(leg.line) }">
                    <template #prepend>
                      <v-img :src="getIconForProduct(leg.line.product)" width="16" height="16" class="mr-1"></v-img>
                    </template>
                    {{ leg.line.name }}
                  </v-chip>
                  <v-icon v-if="legIndex < transitLegs(journey).length - 1" size="x-small"
                    class="text-medium-emphasis">
                    mdi-chevron-right
                  </v-icon>
                </template>
              </template>
              <v-chip v-else density="compact" size="small" label variant="flat" prepend-icon="mdi-walk">
                {{ t("routing.walkShort") }}
              </v-chip>

              <span v-if="viaLabel(journey)" class="text-caption text-medium-emphasis ml-1">
                {{ viaLabel(journey) }}
              </span>
            </div>
          </div>

          <v-expand-transition>
            <div v-show="isJourneyExpanded(journeyIndex)">
              <v-divider></v-divider>
              <div class="pa-3">
                <v-row v-for="(leg, index) in journey.legs" :key="index" align="center" density="compact">
                  <v-col cols="12" sm="8">
                    <v-row v-if="!!leg.line" align="center" density="compact">
                      <v-col cols="auto" class="mr-2">
                        <v-img :src="getIconForProduct(leg?.line?.product)" width="40px" height="40px"></v-img>
                      </v-col>
                      <v-col>
                        <div class="text-h6">
                          <v-chip density="comfortable" size="small" class="mr-2" label variant="flat"
                            :color="getLineColor(leg.line)" :style="{ color: getLineTextColor(leg.line) }">{{ leg.line.name
                            }}</v-chip> {{ leg.direction }}
                        </div>
                        <div><v-icon class="mr-2">mdi-ray-start-arrow</v-icon><span>{{ leg?.origin?.name }}</span></div>
                        <div><v-icon class="mr-2">mdi-ray-end</v-icon><span>{{ leg?.destination?.name }}</span></div>

                        <div class="d-flex flex-column flex-md-row ga-1 mt-1 align-start">
                          <v-chip density="comfortable" size="small" label variant="flat" color="info"
                            v-if="!!leg.departurePlatform" class="text-body-2 text-medium-emphasis">
                            <span v-if="!leg.departurePlatform.includes('Pos')">{{
                              t("departures.platform", { platform: leg.departurePlatform })
                            }}</span><span v-else>{{ leg.departurePlatform }}</span>
                          </v-chip>
                        </div>
                      </v-col>
                    </v-row>
                    <v-row v-else align="center" density="compact">
                      <v-col cols="auto" class="mr-2">
                        <template v-if="leg.departure !== leg.arrival">
                          <v-icon class="mr-2">mdi-walk</v-icon><v-chip density="comfortable" label variant="flat"
                            class="text-body-2" color="yellow-lighten-1">
                            {{ t("routing.walkShort") }} {{ leg.distance ? `${leg.distance} m` : '' }}
                          </v-chip>
                        </template>
                        <template v-else>
                          <v-icon class="mr-2">mdi-transit-transfer</v-icon><v-chip density="comfortable" label
                            variant="flat" class="text-body-2" color="yellow-lighten-1">
                            {{ t("routing.transfer") }} {{ leg.distance ? `${leg.distance} m` : '' }}
                          </v-chip>
                        </template>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col v-if="legHasTimeInfo(leg)" cols="12" sm="4"
                    class="d-flex flex-wrap flex-sm-column align-center align-sm-end ga-1">
                    <template v-if="leg.departure !== leg.arrival">
                      <v-chip density="comfortable" size="small" label variant="flat" prepend-icon="mdi-ray-start-arrow"
                        class="text-body-2">
                        <span class="mr-1">{{ t("routing.departure") }}</span>
                        {{ leg.departure ? (toHHMM(new Date(leg.departure))) : t("departures.timeNotAvailable") }}
                      </v-chip>
                      <v-chip density="comfortable" size="small" label variant="flat" prepend-icon="mdi-ray-end"
                        class="text-body-2">
                        <span class="mr-1">{{ t("routing.arrival") }}</span>
                        {{ leg.arrival ? (toHHMM(new Date(leg.arrival))) : t("departures.timeNotAvailable") }}
                      </v-chip>
                    </template>
                    <v-chip v-if="leg.departureDelay && leg.departureDelay > 0 && !!leg.line" density="comfortable"
                      size="small" label variant="flat" :color="leg.departureDelay > 300 ? 'error' : 'warning'"
                      prepend-icon="mdi-clock-alert-outline" class="text-body-2">
                      {{ t("departures.delayLong", { minutes: Math.floor(leg.departureDelay / 60) }) }}
                    </v-chip>
                  </v-col>
                  <v-divider v-if="index < journey.legs.length - 1"></v-divider>
                </v-row>
              </div>
            </div>
          </v-expand-transition>
        </v-card>
      </template>
      <p v-else-if="journeyStatus === 'success' && startStation && destinationStation && !sameStation"
        class="text-body-1 text-medium-emphasis mt-4">
        {{ t("routing.noJourneys") }}
      </p>

      <template #fallback>
        <v-skeleton-loader type="chip, text"></v-skeleton-loader>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { refDebounced } from "@vueuse/core";
import type { Journey, Journeys, Leg } from "~/utils/types";
import { toHHMM, toISOLocal } from "~/utils/time";

const { t, d } = useI18n();
const route = useRoute();
const router = useRouter();

const productTypes = ["bus", "tram", "subway", "suburban", "regional", "express", "ferry"] as const;

function stationProducts(station: any) {
  return productTypes.filter((product) => station.products?.[product]);
}

const showVia = shallowRef(false);
const startStation = ref<any>(null);
const viaStation = ref<any>(null);
const destinationStation = ref<any>(null);
const expandedJourneyIndex = ref<number | null>(null);

const sameStation = computed(
  () =>
    !!stationId(startStation.value) &&
    stationId(startStation.value) === stationId(destinationStation.value),
);

const customTravelTime = ref<Date | null>(parseWhen(route.query.when));

const customTimeLabel = computed(() => {
  if (!customTravelTime.value) return "";
  return t("routing.showingConnectionsFor", {
    datetime: d(customTravelTime.value, "long"),
  });
});

const effectiveWhen = computed(() => {
  if (!customTravelTime.value) return undefined;
  return toISOLocal(customTravelTime.value);
});

function queryValue(value: unknown): string | null {
  if (Array.isArray(value)) value = value[0];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stationId(station: any): string | null {
  return station?.id != null ? String(station.id) : null;
}

function parseWhen(value: unknown): Date | null {
  const raw = queryValue(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function loadStation(id: string | null) {
  if (!id) return null;
  try {
    return await $fetch(`https://v6.vbb.transport.rest/stops/${id}`);
  } catch {
    return null;
  }
}

function isJourneyExpanded(index: number) {
  return expandedJourneyIndex.value === index;
}

function toggleJourney(index: number) {
  expandedJourneyIndex.value = isJourneyExpanded(index) ? null : index;
}

function transitLegs(journey: Journey): Leg[] {
  return journey.legs.filter((leg) => !!leg.line);
}

function transferStations(journey: Journey): string[] {
  const legs = transitLegs(journey);
  const stations: string[] = [];
  for (let index = 0; index < legs.length - 1; index++) {
    const name = legs[index]?.destination?.name ?? legs[index + 1]?.origin?.name;
    if (name) stations.push(name);
  }
  return stations;
}

function viaLabel(journey: Journey): string | null {
  const stations = transferStations(journey);
  if (stations.length === 0) return null;
  if (stations.length === 1) {
    return t("routing.viaStation", { station: stations[0] });
  }
  return t("routing.viaMore", { station: stations[0], count: stations.length - 1 });
}

function journeyStart(journey: Journey): string | undefined {
  const first = journey.legs[0];
  return first?.departure ?? first?.plannedDeparture;
}

function journeyEnd(journey: Journey): string | undefined {
  const last = journey.legs[journey.legs.length - 1];
  return last?.arrival ?? last?.plannedArrival;
}

function formatJourneyTime(value?: string): string {
  return value ? toHHMM(new Date(value)) : t("departures.timeNotAvailable");
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return t("routing.minutes", { count: rest });
  if (rest === 0) return t("routing.hours", { hours });
  return t("routing.hoursMinutes", { hours, minutes: rest });
}

function journeyDuration(journey: Journey): string | null {
  const start = journeyStart(journey);
  const end = journeyEnd(journey);
  if (!start || !end) return null;
  const minutes = Math.max(
    0,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000),
  );
  return formatDuration(minutes);
}

function legHasTimeInfo(leg: Leg): boolean {
  return (
    leg.departure !== leg.arrival ||
    (!!leg.line && (leg.departureDelay ?? 0) > 0)
  );
}

function transferCount(journey: Journey): number {
  return Math.max(0, transitLegs(journey).length - 1);
}

function journeyDelay(journey: Journey): number {
  return journey.legs.reduce(
    (max, leg) => Math.max(max, leg.departureDelay ?? 0, leg.arrivalDelay ?? 0),
    0,
  );
}

function updateQuery(updates: Record<string, string | null>) {
  const query = { ...route.query };
  let changed = false;
  for (const [key, value] of Object.entries(updates)) {
    if (value == null) {
      if (key in query) {
        delete query[key];
        changed = true;
      }
    } else if (queryValue(query[key]) !== value) {
      query[key] = value;
      changed = true;
    }
  }
  if (changed) router.replace({ query });
}

let routeSyncToken = 0;

watch(
  () =>
    [
      queryValue(route.query.from),
      queryValue(route.query.via),
      queryValue(route.query.to),
    ] as const,
  async ([fromId, viaId, toId]) => {
    const token = ++routeSyncToken;
    const [nextStart, nextVia, nextDestination] = await Promise.all([
      stationId(startStation.value) !== fromId ? loadStation(fromId) : startStation.value,
      stationId(viaStation.value) !== viaId ? loadStation(viaId) : viaStation.value,
      stationId(destinationStation.value) !== toId
        ? loadStation(toId)
        : destinationStation.value,
    ]);
    if (token !== routeSyncToken) return;

    if (nextStart !== startStation.value) startStation.value = nextStart;
    if (nextVia !== viaStation.value) viaStation.value = nextVia;
    if (nextDestination !== destinationStation.value) {
      destinationStation.value = nextDestination;
    }
    if (nextVia) showVia.value = true;
  },
  { immediate: true },
);

watch([startStation, viaStation, destinationStation], ([start, via, destination]) => {
  updateQuery({
    from: stationId(start),
    via: stationId(via),
    to: stationId(destination),
  });
});

watch(customTravelTime, (value) => {
  updateQuery({ when: value ? toISOLocal(value) : null });
});

watch(
  () => queryValue(route.query.when),
  (value) => {
    const next = parseWhen(value);
    if ((next?.getTime() ?? null) !== (customTravelTime.value?.getTime() ?? null)) {
      customTravelTime.value = next;
    }
  },
);

useHead({
  title: computed(() => {
    const from = startStation.value?.name;
    const to = destinationStation.value?.name;
    return from && to ? t("routing.resultsTitle", { from, to }) : "Travel Comp";
  }),
});

const startQuery = ref("");
const viaQuery = ref("");
const destinationQuery = ref("");
const debounceTime = 1000;
const debouncedStartQuery = refDebounced(startQuery, debounceTime);
const debouncedViaQuery = refDebounced(viaQuery, debounceTime);
const debouncedDestinationQuery = refDebounced(destinationQuery, debounceTime);

const {
  data: startStations,
  status: startSearchStatus,
  refresh,
} = useAsyncData(
  () => `start-stations-${debouncedStartQuery.value}`,
  () => {
    if (debouncedStartQuery.value == null || !debouncedStartQuery.value.trim()) return [];
    return $fetch(
      `https://v6.vbb.transport.rest/locations?poi=false&addresses=false&query=${encodeURIComponent(debouncedStartQuery.value)}`,
    );
  },
  { default: () => [], watch: [debouncedStartQuery], timeout: debounceTime + 10000 },
);

const {
  data: viaStations,
  status: viaSearchStatus,
  refresh: refreshVia,
} = useAsyncData(
  () => `via-stations-${debouncedViaQuery.value}`,
  () => {
    if (debouncedViaQuery.value == null || !debouncedViaQuery.value.trim()) return [];
    return $fetch(
      `https://v6.vbb.transport.rest/locations?poi=false&addresses=false&query=${encodeURIComponent(debouncedViaQuery.value)}`,
    );
  },
  { default: () => [], watch: [debouncedViaQuery], timeout: debounceTime + 10000 },
);

const {
  data: destinationStations,
  status: destinationSearchStatus,
  refresh: refreshDestination,
} = useAsyncData(
  () => `destination-stations-${debouncedDestinationQuery.value}`,
  () => {
    if (debouncedDestinationQuery.value == null || !debouncedDestinationQuery.value.trim()) return [];
    return $fetch(
      `https://v6.vbb.transport.rest/locations?poi=false&addresses=false&query=${encodeURIComponent(debouncedDestinationQuery.value)}`,
    );
  },
  { default: () => [], watch: [debouncedDestinationQuery], timeout: debounceTime + 10000 },
);

const {
  data: journeys,
  status: journeyStatus,
  refresh: refreshJourney,
} = useAsyncData(
  () =>
    `journey-${startStation.value?.id}-${viaStation.value?.id ?? ""}-${destinationStation.value?.id}-${customTravelTime.value?.getTime() ?? "now"}`,
  () => {
    if (!startStation.value?.id || !destinationStation.value?.id || sameStation.value) {
      return null;
    }
    const params = new URLSearchParams({
      from: String(startStation.value.id),
      to: String(destinationStation.value.id),
    });
    if (viaStation.value?.id) params.set("via", String(viaStation.value.id));
    const when = effectiveWhen.value;
    if (when) params.set("departure", when);
    return $fetch<Journeys>(`https://v6.vbb.transport.rest/journeys?${params.toString()}`);
  },
  {
    default: () => null,
    watch: [startStation, viaStation, destinationStation, customTravelTime],
    timeout: debounceTime + 10000,
  },
);

function onStartStationClear() {
  startQuery.value = "";
  startStations.value = [];
}

function onViaStationClear() {
  viaQuery.value = "";
  viaStations.value = [];
}

function onRemoveVia() {
  viaStation.value = null;
  onViaStationClear();
  showVia.value = false;
}

function onDestinationStationClear() {
  destinationQuery.value = "";
  destinationStations.value = [];
}
</script>
