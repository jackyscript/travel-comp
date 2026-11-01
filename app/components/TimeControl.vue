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
import { toHHMM } from "~/utils/time";

interface Props {
  modelValue: Date | null;
  /** Text to show instead of the current time when a custom time is selected. */
  customLabel?: string;
  /** Re-emits `refresh` every 60 seconds while no custom time is selected. */
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

const countdown = ref(60);
let countdownInterval: ReturnType<typeof setInterval> | null = null;

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function startCountdown() {
  stopCountdown();
  countdown.value = 60;
  countdownInterval = setInterval(() => {
    currentTime.value = new Date();
    countdown.value--;
    if (countdown.value <= 0) {
      emit("refresh");
      startCountdown();
    }
  }, 1000);
}

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

onUnmounted(stopCountdown);
</script>
