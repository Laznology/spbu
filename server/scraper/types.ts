export interface FuelPriceData {
  fuelName: string;
  providerName: string;
  regionName: string;
  price: number;
}

export interface FuelScraper {
  provider: string;
  scrape(): Promise<FuelPriceData[]>;
}

export interface ScraperConfig {
  maxRetries?: number;
  retryDelayMs?: number;
}
