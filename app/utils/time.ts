export function formatRelativeTime(when: string): string {
    const { t } = useI18n();
    const diffMs = new Date(when).getTime() - Date.now();
    const isPast = diffMs < 0;
    const totalMin = Math.floor(Math.abs(diffMs) / 60000);
    let duration: string;
    if (totalMin < 60) {
        duration = t("departures.relative.minutes", totalMin);
    } else if (totalMin < 1440) {
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        duration =
            m > 0
                ? t("departures.relative.hoursMinutes", { hours: h, minutes: m })
                : t("departures.relative.hours", { hours: h });
    } else {
        const days = Math.floor(totalMin / 1440);
        const rem = totalMin % 1440;
        const h = Math.floor(rem / 60);
        const m = rem % 60;
        duration = t("departures.relative.days", days);
        if (h > 0) duration += ` ${t("departures.relative.hours", { hours: h })}`;
        if (m > 0) duration += ` ${t("departures.relative.minutes", m)}`;
    }
    return isPast ? t("departures.relative.ago", { duration }) : duration;
}

export function toHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Formats a date as an ISO 8601 string in the local timezone, including the
 * UTC offset, e.g. `2026-11-01T14:30:00+01:00`. The VBB API expects this shape
 * for `when` parameters, and it can be parsed back losslessly.
 */
export function toISOLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const zh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const zm = String(Math.abs(offset) % 60).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}:00${sign}${zh}:${zm}`;
}