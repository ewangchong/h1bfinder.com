# h1bfriend-backend

Fastify + Postgres backend for H1B Friendly.

## One-time setup

```bash
npm install
```

## Local DB

```bash
docker compose up -d
```

## Sync FY2025 (from local XLSX files)

This will:
- convert FY2025 Q1-Q4 `*.xlsx` to CSV
- drop extra columns that don't exist in `lca_raw` (e.g. `EMPLOYER_FEIN`, `LAWFIRM_BUSINESS_FEIN`)
- delete existing FY2025 rows from `lca_raw` (idempotent)
- import FY2025 into `lca_raw`
- rebuild derived tables (`companies`, `jobs`)

Run:

```bash
npm run sync:fy2025
```

Expected input files:

```
/Users/chongwang/Documents/openclaw-workspace/h1b-data/LCA_Disclosure_Data_FY2025_Q1.xlsx
/Users/chongwang/Documents/openclaw-workspace/h1b-data/LCA_Disclosure_Data_FY2025_Q2.xlsx
/Users/chongwang/Documents/openclaw-workspace/h1b-data/LCA_Disclosure_Data_FY2025_Q3.xlsx
/Users/chongwang/Documents/openclaw-workspace/h1b-data/LCA_Disclosure_Data_FY2025_Q4.xlsx
```

## API

- Health: `GET /health`
- Companies: `GET /api/v1/companies`
- Titles: `GET /api/v1/titles`
