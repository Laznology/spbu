import { executePriceSync } from "../utils/pertamina";

const CRON = "0 1 * * *";
let task: Bun.CronJob | null = null;

export function startPriceSyncJob(): void {
  if (task) {
    return;
  }

  task = Bun.cron(CRON, async () => {
    try {
      const response = await executePriceSync();
      console.log("[cron] price sync:", response);
    } catch {
      console.error("[cron] price-sync error");
    }
  });
}
