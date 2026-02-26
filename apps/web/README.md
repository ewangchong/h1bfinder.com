# H1B Friend (Next.js)

Local dev for the SEO-first web app.

## Prerequisites

- Node.js 18+
- Docker Desktop (for Postgres)

This repo expects the backend repo to live next to it:

```
.../h1bfriend-web
.../h1bfriend-backend
```

## One command to start frontend + backend + DB

From this repo:

```bash
npm run dev:all
```

- Frontend: http://localhost:3007 (or the default Next port if you changed it)
- Backend API: http://localhost:8089
- Postgres: localhost:5433 (db: `h1bfriend`, user: `h1b`, pass: `h1bpass`)

## Config

Copy and edit env:

```bash
cp .env.example .env
```

Key values:

- `H1B_API_BASE_URL=http://localhost:8089`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3007`

## Notes

- `npm run dev:all` will run `docker compose up -d` for the backend database.
- It also force-frees port `8089` before starting the backend (prevents `EADDRINUSE`).
- To stop everything, stop the backend/frontend terminal processes and run:

```bash
docker compose -f ../h1bfriend-backend/docker-compose.yml down
```
