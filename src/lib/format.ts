const jobTypes: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

export function jobTypeLabel(type: string) {
  return jobTypes[type] ?? type;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Dhaka",
});

export function formatDate(value: Date | string) {
  // Date-only strings are parsed at noon UTC so the calendar day never shifts with the time zone.
  const date = typeof value === "string" ? new Date(`${value}T12:00:00Z`) : value;
  return dateFormat.format(date);
}

export function formatDateTime(value: Date) {
  return dateTimeFormat.format(value);
}

export function paragraphs(text: string) {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function lines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}
