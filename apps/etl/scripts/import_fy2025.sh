#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${H1B_DATA_DIR:-/h1b-data}"
OUT_DIR="$ROOT/data/lca2025"

cd "$ROOT"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

die() { echo "ERROR: $*" >&2; exit 1; }

export DATABASE_URL="postgres://h1b:h1bpass@localhost:5433/h1bfriend"

command -v node >/dev/null || die "node not found"
command -v npm >/dev/null || die "npm not found"
command -v python3 >/dev/null || die "python3 not found"

log "[1/8] (Skipped: DB is already via docker-compose)"
log "[2/8] Ensure python venv + deps (xlsx2csv, openpyxl)"
python3 -m venv .venv >/dev/null 2>&1 || true
# shellcheck disable=SC1091
source .venv/bin/activate
pip -q install --upgrade pip >/dev/null
pip -q install xlsx2csv openpyxl >/dev/null

mkdir -p "$OUT_DIR"

log "[3/8] Convert FY2025 Q1-Q4 XLSX -> CSV (raw)"
for q in 1 2 3 4; do
  xlsx="$DATA_DIR/LCA_Disclosure_Data_FY2025_Q${q}.xlsx"
  raw="$OUT_DIR/FY2025_Q${q}_raw.csv"
  clean="$OUT_DIR/FY2025_Q${q}.csv"

  [[ -f "$xlsx" ]] || die "missing file: $xlsx"

  log "  - Q${q}: xlsx2csv -> raw"
  xlsx2csv "$xlsx" "$raw"

  log "  - Q${q}: drop extra columns (EMPLOYER_FEIN, LAWFIRM_BUSINESS_FEIN)"
  python - <<PY
import csv
DROP = {"EMPLOYER_FEIN","LAWFIRM_BUSINESS_FEIN"}
inp = r"$raw"
out = r"$clean"

with open(inp, newline="", encoding="utf-8", errors="replace") as f:
    r = csv.reader(f)
    header = next(r)

drop_idxs = [i for i,h in enumerate(header) if h in DROP]
drop_idxs.sort()

with open(inp, newline="", encoding="utf-8", errors="replace") as f, open(out, "w", newline="", encoding="utf-8") as g:
    r = csv.reader(f)
    w = csv.writer(g)
    for row in r:
        for i in reversed(drop_idxs):
            if len(row) > i:
                row = row[:i] + row[i+1:]
        w.writerow(row)

print("dropped idx", drop_idxs, "cols", len(header), "->", len(header) - len(drop_idxs))
PY

done

log "[4/8] Delete existing FY2025 rows from lca_raw (idempotent)"
node - <<'NODE'
import pg from 'pg';
const {Pool}=pg;
const pool=new Pool({connectionString:process.env.DATABASE_URL||'postgres://h1b:h1bpass@localhost:5433/h1bfriend'});
await pool.query('DELETE FROM lca_raw WHERE fiscal_year=2025');
const r=await pool.query('select count(*)::bigint c from lca_raw where fiscal_year=2025');
console.log('FY2025 remaining', r.rows[0].c.toString());
await pool.end();
NODE

log "[5/8] Import FY2025 Q1-Q4 into lca_raw"
for q in 1 2 3 4; do
  log "  - importing Q${q}"
  npm run -s import:lca -- "$OUT_DIR/FY2025_Q${q}.csv" 2025
  node - <<NODE
import pg from 'pg';
const {Pool}=pg;
const pool=new Pool({connectionString:process.env.DATABASE_URL||'postgres://h1b:h1bpass@localhost:5433/h1bfriend'});
const r=await pool.query('select count(*)::bigint c from lca_raw where fiscal_year=2025');
console.log('FY2025 cumulative', r.rows[0].c.toString());
await pool.end();
NODE

done

log "[6/8] Rebuild derived tables"
log "  - build:companies"
npm run -s build:companies
log "  - build:jobs"
npm run -s build:jobs

log "[7/8] Sanity checks"
node - <<'NODE'
import pg from 'pg';
const {Pool}=pg;
const pool=new Pool({connectionString:process.env.DATABASE_URL||'postgres://h1b:h1bpass@localhost:5433/h1bfriend'});
const r=await pool.query('select count(*)::bigint c from lca_raw where fiscal_year=2025');
const c=await pool.query('select count(*)::bigint c from companies');
const j=await pool.query('select count(*)::bigint c from jobs');
console.log('FY2025 rows', r.rows[0].c.toString());
console.log('companies', c.rows[0].c.toString());
console.log('jobs', j.rows[0].c.toString());
await pool.end();
NODE

log "[8/8] Done"
