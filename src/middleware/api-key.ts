import { timingSafeEqual } from "node:crypto";
import type { MiddlewareHandler } from "hono";

const encoder = new TextEncoder();
const BEARER_PREFIX = /^Bearer\s+/i;

/** Constant-time compare so we don't leak key length / content via timing. */
function safeEqual(a: string, b: string): boolean {
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  if (aBuf.byteLength !== bBuf.byteLength) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export interface ApiKeyOptions {
  /** Name of the env var that holds the expected key. */
  envKey?: string;
  /** Header the client sends the key in. */
  headerName?: string;
}

/**
 * Simple API key middleware.
 *
 * Generate a key with:
 *   openssl rand -base64 32
 *
 * Then put it in `.env` (Bun loads it automatically):
 *   API_KEY=<paste the generated value>
 */
export function apiKeyAuth({
  envKey = "API_KEY",
  headerName = "x-api-key",
}: ApiKeyOptions = {}): MiddlewareHandler {
  return async (c, next) => {
    const expected = process.env[envKey];
    if (!expected) {
      return c.json({ error: "Server misconfigured: API key not set" }, 500);
    }

    const provided =
      c.req.header(headerName) ??
      c.req.header("authorization")?.replace(BEARER_PREFIX, "");

    if (!(provided && safeEqual(provided, expected))) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
  };
}
