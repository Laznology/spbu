# Espebu - Pertamina Fuel Price API

High-performance modular fuel price historical tracking service powered by Bun, Hono, Drizzle ORM (SQLite), and Scalar OpenAPI.

---

## 🛠️ Development

### 1. Prerequisites & Installation

Make sure [Bun](https://bun.sh) is installed.

```sh
bun install
```

### 2. Environment Variables

Create `.env` file in the root directory:

```env
API_KEY=your_secure_api_key_here
DATABASE_URL=.data/sqlite.db
PORT=5000
```

### 3. Database Migration

Run Drizzle migrations to setup SQLite tables:

```sh
bun run db:migrate
```

### 4. Run Development Server

```sh
bun run dev
```

- Server: `http://localhost:5000`
- API Reference & Interactive Docs (Scalar): `http://localhost:5000/docs`
- OpenAPI Specification: `http://localhost:5000/openapi`

---

## 🐳 Deployment (Docker & GHCR)

### Urusan Database di Docker

Aplikasi menggunakan database SQLite (`sqlite.db`). Karena container Docker bersifat _ephemeral_ (data hilang saat container dihapus), **database wajib dimount menggunakan Docker Volume** ke folder `/app/.data`.

Setiap container dijalankan:

1. `ENTRYPOINT` di Dockerfile otomatis mengeksekusi migrasi database (`bun run src/db/migrate.ts`) sebelum menjalankan server Hono.
2. Port default production adalah `5000`.

### 1. Run Menggunakan Docker CLI

```sh
docker run -d \
  --name espebu \
  --restart unless-stopped \
  -p 5000:5000 \
  -v espebu_data:/app/.data \
  -e API_KEY=ganti_dengan_api_key_rahasia \
  ghcr.io/<username>/espebu:latest
```

### 2. Run Menggunakan Docker Compose

Buat file `docker-compose.yml`:

```yaml
services:
  espebu:
    image: ghcr.io/<username>/espebu:latest
    container_name: espebu
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - API_KEY=ganti_dengan_api_key_rahasia
      - DATABASE_URL=/app/.data/sqlite.db
    volumes:
      - espebu_data:/app/.data

volumes:
  espebu_data:
```

Jalankan:

```sh
docker compose up -d
```

---

## 🚀 CI/CD (GitHub Container Registry)

Workflow otomatis di `.github/workflows/deploy.yml` akan melakukan build multi-stage image ultra-ringan (`oven/bun:alpine`) dan mem-push ke GitHub Container Registry (`ghcr.io/<username>/espebu:latest`) setiap ada push ke branch `main` atau pembuatan git tag versi (`v*.*.*`).
