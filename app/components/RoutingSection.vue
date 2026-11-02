<template>
  <ClientOnly fallback-tag="div">
    <div class="d-flex flex-column ga-3">
      ...
    </div>

    <template #fallback>
      <v-skeleton-loader type="chip, text"></v-skeleton-loader>
    </template>
  </ClientOnly>
</template>
