import { ref, computed } from "vue";
import type { ComputedRef } from "vue";

type HealthStatus = "unknown" | "healthy" | "unhealthy";

const status = ref<HealthStatus>("unknown");
let lastCheck = 0;
const CHECK_INTERVAL = 300_000;

export function useApiHealth(): {
  status: ComputedRef<HealthStatus>;
  checkHealth: () => Promise<HealthStatus>;
} {
  async function checkHealth(): Promise<HealthStatus> {
    const now = Date.now();
    if (now - lastCheck < CHECK_INTERVAL && status.value !== "unknown") {
      return status.value;
    }

    status.value = "unknown";
    try {
      const data = await $fetch<{ monitor: { statusClass: string } }>(
        `https://stats.uptimerobot.com/api/getMonitor/57wNLs39M?m=793274559&region=_default&_=${Date.now()}`,
        { timeout: 5000 },
      );
      status.value = data.monitor.statusClass === "success" ? "healthy" : "unhealthy";
    } catch {
      status.value = "unhealthy";
    }

    lastCheck = Date.now();
    return status.value;
  }

  return {
    status: computed(() => status.value),
    checkHealth,
  };
}
