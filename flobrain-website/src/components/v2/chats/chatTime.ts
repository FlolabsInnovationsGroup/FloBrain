const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Message time label from "Features and Requirements - V2", feature 3:
 * under 1 minute shows "just now", within 24 hours shows "X hours ago",
 * and anything older uses the device's date format.
 */
export function formatMessageTime(sentAt: string | Date, now: Date = new Date()): string {
  const sent = typeof sentAt === "string" ? new Date(sentAt) : sentAt;
  const elapsed = now.getTime() - sent.getTime();

  if (Number.isNaN(elapsed)) return "";
  if (elapsed < MINUTE) return "just now";
  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);
    if (hours < 1) {
      const minutes = Math.floor(elapsed / MINUTE);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  return sent.toLocaleDateString();
}
