export const timeAgo = (timestamp) => {
  if (!timestamp) return "";

  const now = new Date();
  const past = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  const diff = Math.floor((now - past) / 1000); // seconds

  const format = (value, unit) => {
    return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
  };

  if (diff < 60) return format(diff, "sec");

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return format(minutes, "min");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return format(hours, "hour");

  const days = Math.floor(hours / 24);
  if (days < 7) return format(days, "day");

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return format(weeks, "week");

  const months = Math.floor(days / 30);
  if (months < 12) return format(months, "month");

  const years = Math.floor(days / 365);
  return format(years, "year");
};
