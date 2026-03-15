<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <v-app-bar :elevation="2">
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Travel Comp</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
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
                  :src="'/images/BUS-Logo-BVG.svg'"
                  :width="logoWidth"
                ></v-img>
                <v-img
                  v-if="station.products?.tram"
                  :src="'/images/Tram-Logo.svg'"
                  :width="logoWidth"
                ></v-img>
                <v-img
                  v-if="station.products?.subway"
                  :src="'/images/U-Bahn.svg'"
                  :width="logoWidth"
                ></v-img>
                <v-img
                  v-if="station.products?.suburban"
                  :src="'/images/S-Bahn-Logo.svg'"
                  :width="logoWidth"
                ></v-img>
                <v-img
                  v-if="station.products?.regional"
                  :src="'/images/VBB_Bahn-Regionalverkehr.svg'"
                  :width="logoWidth"
                ></v-img>
                <v-img
                  v-if="station.products?.express"
                  :src="'/images/haf_prod_ic.svg'"
                  :width="logoWidth"
                ></v-img>
                <v-img
                  v-if="station.products?.ferry"
                  :src="'/images/Fähre-Logo-BVG.svg'"
                  :width="logoWidth"
                ></v-img>
              </div>
            </template>
          </v-list-item>
        </v-list>

        <template v-else-if="searchStatus === 'pending'"
          ><v-skeleton-loader type="table"
        /></template>
        <p v-else-if="query">No stations found</p>

        <v-card v-if="selectedStation" class="mt-4">
          <v-card-title
            >Departures from {{ selectedStation.name }}</v-card-title
          >
          <v-card-text>
            <template v-if="departuresStatus === 'pending'"
              ><v-skeleton-loader type="card"
            /></template>
            <template v-else-if="response && response.departures.length > 0">
              <v-list>
                <v-list-item
                  v-for="dep in response.departures"
                  :key="dep.tripId"
                >
                  <v-list-item-title class="ml-2"
                    >{{ dep.line.name }} to
                    {{ dep.direction }}</v-list-item-title
                  >
                  <template #prepend>
                    <v-img
                      v-if="dep.line.product === 'bus'"
                      :src="'/images/BUS-Logo-BVG.svg'"
                      :width="logoWidth"
                    ></v-img>
                    <v-img
                      v-else-if="dep.line.product === 'tram'"
                      :src="'/images/Tram-Logo.svg'"
                      :width="logoWidth"
                    ></v-img>
                    <v-img
                      v-else-if="dep.line.product === 'subway'"
                      :src="'/images/U-Bahn.svg'"
                      :width="logoWidth"
                    ></v-img>
                    <v-img
                      v-else-if="dep.line.product === 'suburban'"
                      :src="'/images/S-Bahn-Logo.svg'"
                      :width="logoWidth"
                    ></v-img>
                    <v-img
                      v-else-if="dep.line.product === 'regional'"
                      :src="'/images/VBB_Bahn-Regionalverkehr.svg'"
                      :width="logoWidth"
                    ></v-img>
                    <v-img
                      v-else-if="dep.line.product === 'ferry'"
                      :src="'/images/Fähre-Logo-BVG.svg'"
                      :width="logoWidth"
                    ></v-img>
                    <v-img
                      v-else
                      :src="'/images/haf_prod_ic.svg'"
                      :width="logoWidth"
                    ></v-img>
                  </template>
                  <template #append>
                    <v-chip
                      variant="flat"
                      class="ml-2 font-weight-bold"
                      v-if="dep.when"
                    >
                      {{
                        Math.floor((new Date(dep.when) - new Date()) / 60000)
                      }}
                      min
                    </v-chip>
                    <v-chip
                      class="ml-2"
                      :color="dep.delay > 1 * 60 ? 'red' : 'green'"
                      v-if="dep.delay > 0"
                    >
                      {{ dep.delay > 0 ? "+" : "-" }}{{ dep.delay / 60 }} min
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </template>
            <template v-else><p>No departures found</p></template>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
const query = ref("");
const selectedStation = ref(null);
const logoWidth = "30px";

const { data: stations, refresh, status: searchStatus } = useAsyncData(
  () => `stations-${query.value}`,
  () => {
    if (!query.value.trim()) return [];
    return $fetch(
      `https://v6.vbb.transport.rest/locations?poi=false&addresses=false&query=${encodeURIComponent(query.value)}`,
    );
  },
  { default: () => [] },
);

const { data: response, status: departuresStatus } = useAsyncData(
  () => `departures-${selectedStation.value?.id}`,
  () => {
    if (!selectedStation.value) return [];
    return $fetch(
      `https://v6.vbb.transport.rest/stops/${selectedStation.value.id}/departures?results=5&duration=60`,
    );
  },
  { default: () => [] },
);

function selectStation(station) {
  selectedStation.value = station;
  query.value = "";
  stations.value = [];
}

watch(query, () => {
  refresh();
});
</script>
