const relativeTimeFormatter = new Intl.RelativeTimeFormat("id", {
  numeric: "auto",
});

export function formatRelativeTime(value) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1_000);
  const absoluteSeconds = Math.abs(seconds);

  if (absoluteSeconds < 60) return relativeTimeFormatter.format(seconds, "second");

  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) {
    return relativeTimeFormatter.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeTimeFormatter.format(hours, "hour");

  const days = Math.round(hours / 24);
  return relativeTimeFormatter.format(days, "day");
}
