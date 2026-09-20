# Stage 1: Dependencies
FROM oven/bun:alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Stage 2: Minimal Runtime
FROM oven/bun:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000 \
    DATABASE_URL=/app/.data/sqlite.db

COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY drizzle ./drizzle

VOLUME ["/app/.data"]
EXPOSE 5000

# exec ensures bun becomes PID 1 to gracefully handle SIGTERM on docker stop
ENTRYPOINT ["sh", "-c", "bun run src/db/migrate.ts && exec bun run src/index.ts"]
