const PROVINCE_PREFIX = /^prov\.\s*/i;
const NON_WORD_CHARS = /[^\w\s-]/g;
const SEPARATORS = /[\s_-]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const NON_DIGITS = /[^0-9]/g;

export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(PROVINCE_PREFIX, "")
    .trim()
    .replace(NON_WORD_CHARS, "")
    .replace(SEPARATORS, "-")
    .replace(EDGE_DASHES, "");
}

export function isFtz(regionName: string) {
  const lower = regionName.toLowerCase();
  return (
    lower.includes("ftz") ||
    lower.includes("free trade zone") ||
    lower.includes("batam") ||
    lower.includes("sabang")
  );
}
export function isSubsidizedFuel(fuelName: string) {
  const lower = fuelName.toLowerCase();
  if (lower.includes("non subsidi") || lower.includes("non-subsidi")) {
    return false;
  }
  return lower.includes("subsidi") || lower.includes("pertalite");
}

export function normalizePrice(raw: string | number): number {
  if (typeof raw === "number") {
    return raw;
  }
  const cleaned = raw.replace(NON_DIGITS, "");
  return cleaned ? Number.parseInt(cleaned, 10) : 0;
}
