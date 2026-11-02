<template>
  <v-switch
    v-model="view"
    class="view-toggle"
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

<style scoped>
/* Vuetify draws a 2px border on the unselected `inset="material"` track
   ($switch-inset-unselected-thumb-color). The checked state uses a transparent
   border, so make the unselected state match instead of showing a ring. */
.view-toggle :deep(.v-switch__track) {
  border-color: transparent;
}
</style>
