<template>
  <ClientOnly fallback-tag="div">
    <v-text-field label="Start" clearable />

    <v-list>
      <v-list-item v-for="(item, index) in transits">{{index + 1}}. Zwischenhalt: {{ item }}</v-list-item>
    </v-list>

    <v-text-field label="Ziel" clearable />


    <v-dialog v-model="dialog" max-width="500">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" color="secondary" icon="mdi-plus" text="Zwischenhaltestelle angeben"
          variant="flat"></v-btn>
      </template>

      <v-card title="Zwischenhaltestelle">
        <v-card-text>
          Bitte Zwischenhalt angeben

          <v-text-field v-model="transit" label="Zwischenhalt" clearable />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="Abbrechen" @click="dialog = false"></v-btn>
          <v-btn color="secondary" text="Hinzufügen" variant="tonal" @click="onAdd"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <template #fallback>
      <v-skeleton-loader type="chip, text"></v-skeleton-loader>
    </template>
  </ClientOnly>
</template>


<script setup lang="ts">
const transits = ref<string[]>([])
const transit = ref('')
const dialog = shallowRef(false)

function onAdd() {
  dialog.value = false
  transits.value.push(transit.value)
  transit.value = ''
}
</script>
