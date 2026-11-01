<template>
  <v-tabs
    :model-value="activeTab"
    color="secondary"
    grow
    class="mb-4"
    @update:model-value="onChange"
  >
    <v-tab value="departures" prepend-icon="mdi-bus-clock">{{ t("nav.departures") }}</v-tab>
    <v-tab value="connections" prepend-icon="mdi-transit-connection-variant">{{
      t("nav.connections")
    }}</v-tab>
  </v-tabs>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const activeTab = computed<"departures" | "connections">(() =>
  route.path.startsWith("/routing") ? "connections" : "departures",
);

function onChange(value: unknown) {
  router.push(value === "connections" ? "/routing" : "/");
}
</script>
