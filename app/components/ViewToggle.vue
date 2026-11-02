<template>
  <v-switch
    v-model="view"
    :label="view === 'search' ? t('nav.departures') : t('nav.connections')"
    inset="material"
    true-icon="mdi-transit-connection-variant"
    false-value="search"
    true-value="routing"
    false-icon="mdi-bus-clock"
    size="x-large"
    color="secondary"
    base-color="secondary"
  />
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const view = computed({
  get: () => (route.path.startsWith("/routing") ? "routing" : "search"),
  set: (value: string) => router.push(value === "routing" ? "/routing" : "/"),
});
</script>
