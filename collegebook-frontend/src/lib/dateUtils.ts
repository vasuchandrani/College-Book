/**
 * Smart date & relative time formatter for CollegeBook posts and comments.
 *
 * Requirements:
 * - Up to 1 - 1.5 days (<= 36 hours): Relative time ("Just now", "5m ago", "2h ago", "1d ago")
 * - After 1.5 days (> 36 hours): Absolute date like "12 Apr '26" or "24 Aug '26"
 */
export function formatSmartDate(input?: string | number | Date | null): string {
  if (!input) return "Just now";

  // If already formatted like "12 Apr '26", return as is
  if (typeof input === "string" && /^\d{1,2}\s+[A-Za-z]{3}\s+'\d{2}$/.test(input.trim())) {
    return input.trim();
  }

  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) {
    // If not a parseable ISO date, return the original string safely
    return String(input);
  }

  const now = Date.now();
  const diffMs = now - date.getTime();

  // If date is in future or within 45 seconds
  if (diffMs < 45 * 1000) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)}m ago`;
  }

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffHours <= 36) {
    return "1d ago";
  }

  // After 1 - 1.5 days (> 36 hours), show format like "12 Apr '26"
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const yearTwoDigits = String(date.getFullYear()).slice(-2);

  return `${day} ${month} '${yearTwoDigits}`;
}

export default formatSmartDate;
