const MINUTES_PER_DAY = 24 * 60;
const DEFAULT_START_HOUR = 9;
const DEFAULT_TRANSFER_MINUTES = 30;

export type TimedStop<T extends { durationHours: number }> = {
  item: T;
  startMinutes: number;
  endMinutes: number;
};

export function estimateDaySchedule<T extends { durationHours: number }>(
  items: T[],
  options?: { startHour?: number; transferMinutes?: number },
): TimedStop<T>[] {
  const startHour = options?.startHour ?? DEFAULT_START_HOUR;
  const transferMinutes = options?.transferMinutes ?? DEFAULT_TRANSFER_MINUTES;
  let cursor = startHour * 60;

  return items.map((item, index) => {
    if (index > 0) cursor += transferMinutes;
    const durationMinutes = Math.max(0, item.durationHours) * 60;
    const startMinutes = cursor;
    const endMinutes = cursor + durationMinutes;
    cursor = endMinutes;
    return { item, startMinutes, endMinutes };
  });
}

export function formatClock(totalMinutes: number): string {
  const normalized =
    ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
