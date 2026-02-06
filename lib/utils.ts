export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function getUserId(): string {
  let userId = localStorage.getItem("meme_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("meme_user_id", userId);
  }
  return userId;
}

export function getCurrentUserId(): string {
  return getUserId();
}

export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
): string {
  if (!timestamp) return "Unknown time";

  const diffMs = timestamp - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const oneMinute = 60;
  const oneHour = oneMinute * 60;
  const oneDay = oneHour * 24;
  const oneWeek = oneDay * 7;
  const oneMonth = oneDay * 30;

  if (absSeconds < 45) return "Just now";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });

  if (absSeconds < oneHour) {
    return rtf.format(Math.round(diffSeconds / oneMinute), "minute");
  }

  if (absSeconds < oneDay) {
    return rtf.format(Math.round(diffSeconds / oneHour), "hour");
  }

  const dayDiff = Math.round(diffSeconds / oneDay);
  if (dayDiff === 0) return "Today";
  if (dayDiff === -1) return "Yesterday";
  if (dayDiff === 1) return "Tomorrow";
  if (Math.abs(dayDiff) < 7) {
    return rtf.format(dayDiff, "day");
  }

  if (absSeconds < oneMonth) {
    return rtf.format(Math.round(diffSeconds / oneWeek), "week");
  }

  const absoluteDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
  return absoluteDate;
}
