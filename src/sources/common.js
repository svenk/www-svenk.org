import { DateTime } from "luxon"

export function dateFormat(value, format = "yyyy-LL-dd", zone = "utc") {
  let dt =
    value instanceof Date
      ? DateTime.fromJSDate(value, { zone })
      : typeof value === "number"
      ? DateTime.fromMillis(value, { zone })
      : typeof value === "string"
      ? DateTime.fromRFC2822(value, { zone })
      : null

  // fallback for string if RFC2822 failed
  if (typeof value === "string" && (!dt || !dt.isValid)) {
    dt = DateTime.fromISO(value, { zone })
  }

  return dt && dt.isValid ? dt.toFormat(format) : ""
}

// usage: liquidDate(this, value)
export function liquidDate(eleventyThis, value) {
  // liquids powerful date parser is the only one capable of parsing something like "Jun 2015".
  // luxon cannot do it.
  return eleventyThis.renderTemplate(`{{ '${value}' | date: "%Y-%m-%d" }}`, "liquid")
}
