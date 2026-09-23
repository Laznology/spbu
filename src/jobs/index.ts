import { startPriceSyncJob } from "./price-sync";

export function startJobs() {
  startPriceSyncJob();
  console.log("[jobs] cron registered");
}
