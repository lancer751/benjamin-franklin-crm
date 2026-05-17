/** Generates a 7-char course code like "LP-0001" */
export function courseCode(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

/** Generates a 13-char edition code like "LP-0001-24-01" */

export function editionCode(courseCode: string, year: number, edition: number) {
  return `${courseCode}-${String(year).slice(-2)}-${String(edition).padStart(2, "0")}`;
}
