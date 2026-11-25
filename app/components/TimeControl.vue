<template>
  <div class="d-flex align-center mb-4 ga-1">
    <span
      class="text-body-1 text-medium-emphasis"
      style="cursor: pointer"
      @click="openPickerDialog"
    >
      <template v-if="modelValue">{{ customLabel }}</template>
      <template v-else>
        {{ formattedTime }} | {{ formattedDate }}
        <template v-if="autoRefresh">
          | {{ t("common.nextUpdateIn", { count: countdown }) }}
        </template>
      </template>
    </span>
    <v-btn
      v-if="modelValue"
      @click="resetToNow"
      variant="text"
      color="primary"
      size="small"
      class="text-body-2"
    >
      {{ t("common.now") }}
    </v-btn>
  </div>
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
        <v-btn variant="text" color="primary" @click="resetToNow">
          {{ t("common.now") }}
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="dialogVisible = false">{{ t("common.cancel") }}</v-btn>
        <v-btn variant="text" color="primary" @click="applyDateTime">
          {{ t("common.apply") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { useDocumentVisibility, useIntervalFn } from "@vueuse/core";
import { toHHMM } from "~/utils/time";

interface Props {
  modelValue: Date | null;
  /** Text to show instead of the current time when a custom time is selected. */
  customLabel?: string;
  /**
   * Re-emits `refresh` every 60 seconds while no custom time is selected and
   * the page is visible. Paused in the background, refreshed on return.
   */
  autoRefresh?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  customLabel: "",
  autoRefresh: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: Date | null];
  refresh: [];
}>();

const { t, d } = useI18n();

const currentTime = ref(new Date());

const datePickerValue = ref<Date | null>(null);
const timePickerValue = ref("");
const dialogVisible = ref(false);

function toLocalDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const dayMs = 86400000;
const minDate = toLocalDate(new Date(Date.now() - 5 * dayMs));
const maxDate = toLocalDate(new Date(Date.now() + 5 * dayMs));

const formattedTime = computed(() => d(currentTime.value, "time"));
const formattedDate = computed(() => d(currentTime.value, "date"));

function openPickerDialog() {
  const value = props.modelValue ?? new Date();
  datePickerValue.value = toLocalDate(value);
  timePickerValue.value = toHHMM(value);
  dialogVisible.value = true;
}

function applyDateTime() {
  if (!datePickerValue.value || !timePickerValue.value) return;
  const [h, min] = timePickerValue.value.split(":").map(Number);
  const { value: date } = datePickerValue;
  emit(
    "update:modelValue",
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, min),
  );
  dialogVisible.value = false;
}

function resetToNow() {
  emit("update:modelValue", null);
  dialogVisible.value = false;
}

const visibility = useDocumentVisibility();
const refreshIntervalMs = 60_000;
const countdown = ref(refreshIntervalMs / 1000);
let lastRefreshAt = Date.now();

const { pause: pauseCountdown, resume: resumeCountdown } = useIntervalFn(tick, 1000, {
  immediate: false,
});

function stopCountdown() {
  pauseCountdown();
}

function secondsRemaining(): number {
  const elapsed = Date.now() - lastRefreshAt;
  return Math.max(0, Math.ceil((refreshIntervalMs - elapsed) / 1000));
}

function startCountdown() {
  stopCountdown();
  lastRefreshAt = Date.now();
  countdown.value = refreshIntervalMs / 1000;
  // No ticking (or fetching) while the tab/app is in the background.
  if (props.autoRefresh && !props.modelValue && visibility.value !== "hidden") {
    resumeCountdown();
  }
}

function tick() {
  currentTime.value = new Date();
  const remaining = secondsRemaining();
  countdown.value = remaining;
  if (remaining === 0) {
    lastRefreshAt = Date.now();
    countdown.value = refreshIntervalMs / 1000;
    emit("refresh");
  }
}

watch(visibility, (state) => {
  if (state === "hidden") {
    stopCountdown();
    return;
  }
  currentTime.value = new Date();
  if (!props.autoRefresh || props.modelValue) return;

  // Background time must not count towards the refresh interval, but data
  // older than 60s is stale as soon as the user comes back.
  if (Date.now() - lastRefreshAt >= refreshIntervalMs) {
    lastRefreshAt = Date.now();
    emit("refresh");
  }
  countdown.value = Math.max(1, secondsRemaining());
  resumeCountdown();
});

watch(
  () => props.modelValue,
  (value) => {
    if (!props.autoRefresh) return;
    if (value) {
      stopCountdown();
    } else {
      startCountdown();
    }
  },
);

onMounted(() => {
  currentTime.value = new Date();
  if (props.autoRefresh && !props.modelValue) {
    startCountdown();
  }
});
</script>
