/**
 * Safely execute a function that may throw or return null/undefined.
 * @template T
 * @param {() => T} func - Function to execute safely.
 * @param {T | null} [fallbackValue=null] - Value to return if `func` throws or returns null/undefined.
 * @returns {T | null} The result of `func` or the provided `fallbackValue`.
 */
export function nullSafe<T>(func: () => T, fallbackValue: T | null = null): T | null {
  try {
    const value = func();
    return value === null || value === undefined ? fallbackValue : value;
  } catch (e) {
    console.error('Error: ', e);
    return fallbackValue;
  }
}

/**
 * Normalize various rating formats into a numeric string.
 * Supports formats like "7/10", "85/100", "85%", and decimals using commas.
 * - "x/10" is converted to a value out of 100 (multiplied by 10).
 * - "x/100" returns the numeric part before the slash.
 * - "x%" removes the percent sign.
 * @param {string} rating - Rating string from external sources.
 * @returns {string} Normalized numeric string (e.g. "75", "7.5").
 */
export function formatRating(rating: string): string {
  let value = rating;
  const isPerTen = rating.includes("/10");
  const isPerCent = rating.includes("/100");

  if (isPerTen && !isPerCent) {
    const normalized = value.replace(',', '.');
    const num = parseFloat(normalized);
    if (!isNaN(num) && isFinite(num)) {
      const multiplied = num * 10;
      value = multiplied % 1 === 0 ? String(Math.trunc(multiplied)) : String(multiplied);
    }
  } else if (rating.includes("/") && isPerCent) {
    value = rating.split("/")[0].trim();
  } else if (rating.includes("%")) {
    value = rating.replace("%", "").trim();
  }

  return value;
}

/**
 * Extract year from publication date strings.
 * Supports various formats and always returns just the year.
 * - YYYY → YYYY
 * - YYYY-MM-DD → YYYY
 * - ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss...) → YYYY
 * @param {string} dateString - Date string from external sources.
 * @returns {string} Year as a string (e.g., "2023").
 */
export function formatPublishedDate(dateString: string): string {
  if (!dateString) return dateString;

  // Extract first 4 digits which represent the year
  const yearMatch = dateString.match(/\d{4}/);

  return yearMatch ? yearMatch[0] : dateString;
}
