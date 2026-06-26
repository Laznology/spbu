export function normalizePrice(price: string | number): number {
  if (typeof price === "number") {
    return price;
  }

  const cleaned = price.replace(/[^0-9]/g, "");

  const parsed = parseInt(cleaned, 10);

  return isNaN(parsed) ? 0 : parsed;
}
