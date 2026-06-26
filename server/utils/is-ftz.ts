export function isFtz(regionName: string): boolean {
  if (!regionName) return false;
  return regionName.toLowerCase().includes("ftz");
}
