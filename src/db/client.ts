import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";

const url = process.env.DATABASE_URL || ".data/sqlite.db";
mkdirSync(dirname(url), { recursive: true });

export const sqlite = new Database(url);
export const db = drizzle({ client: sqlite });
