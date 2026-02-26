#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${DATA_DIR:-/srv/h1b-data}"
OUT_DIR="$ROOT/data/lca_import"

YEAR=""
QUARTERS=""

usage() {
  cat <<EOF
Usage:
  $(basename "$0") --year <YYYY> [--quarters <q1,q2,...>] [--data-dir <path>]

Examples:
  $(basename "$0") --year 2025
  $(basename "$0") --year 2025 --quarters 1,2,4
  DATA_DIR=/srv/h1b-data $(basename "$0") --year 2024 --quarters 3
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --year)
      YEAR="${2:-}"
      shift 2
      ;;
    --quarters)
      QUARTERS="${2:-}"
      shift 2
      ;;
    --data-dir)
      DATA_DIR="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1
      ;;
  esac
done

[[ -n "$YEAR" ]] || { echo "--year is required" >&2; usage; exit 1; }
[[ "$YEAR" =~ ^20[0-9]{2}$ ]] || { echo "Invalid --year: $YEAR" >&2; exit 1; }

cd "$ROOT"
mkdir -p "$OUT_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

command -v python3 >/dev/null || die "python3 not found"
command -v npm >/dev/null || die "npm not found"
command -v xlsx2csv >/dev/null || die "xlsx2csv not found (pip install xlsx2csv)"

XLSX_FILES=()
if [[ -n "$QUARTERS" ]]; then
  IFS=',' read -r -a Q_ARR <<< "$QUARTERS"
  for q in "${Q_ARR[@]}"; do
    q="${q// /}"
    [[ "$q" =~ ^[1-4]$ ]] || die "Invalid quarter in --quarters: $q"
    f="$DATA_DIR/LCA_Disclosure_Data_FY${YEAR}_Q${q}.xlsx"
    [[ -f "$f" ]] || die "Missing file: $f"
    XLSX_FILES+=("$f")
  done
else
  mapfile -t XLSX_FILES < <(find "$DATA_DIR" -maxdepth 1 -type f -name "LCA_Disclosure_Data_FY${YEAR}_Q*.xlsx" | sort)
fi

[[ ${#XLSX_FILES[@]} -gt 0 ]] || die "No files found for FY${YEAR} in $DATA_DIR"
log "Found ${#XLSX_FILES[@]} file(s) for FY${YEAR}"

log "Deleting existing rows for FY${YEAR}"
YEAR="$YEAR" node - <<'NODE'
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const year = Number(process.env.YEAR);
await pool.query('DELETE FROM lca_raw WHERE fiscal_year = $1', [year]);
await pool.end();
NODE

for xlsx in "${XLSX_FILES[@]}"; do
  base="$(basename "$xlsx")"
  q="$(echo "$base" | sed -nE 's/.*_FY20[0-9]{2}_Q([0-9]+)\.xlsx/\1/p')"
  [[ -n "$q" ]] || { log "Skip unmatched filename: $base"; continue; }

  raw="$OUT_DIR/FY${YEAR}_Q${q}_raw.csv"
  clean="$OUT_DIR/FY${YEAR}_Q${q}.csv"

  log "FY$YEAR Q$q: xlsx2csv"
  xlsx2csv "$xlsx" "$raw"

  log "FY$YEAR Q$q: cleaning columns"
  python3 - <<PY
import csv
DROP={"EMPLOYER_FEIN","LAWFIRM_BUSINESS_FEIN"}
inp=r"$raw"; out=r"$clean"
with open(inp,newline="",encoding="utf-8",errors="replace") as f:
    r=csv.reader(f); header=next(r)
drop_idxs=[i for i,h in enumerate(header) if h in DROP]
with open(inp,newline="",encoding="utf-8",errors="replace") as f, open(out,"w",newline="",encoding="utf-8") as g:
    r=csv.reader(f); w=csv.writer(g)
    for row in r:
        for i in reversed(drop_idxs):
            if len(row)>i: row=row[:i]+row[i+1:]
        w.writerow(row)
print("Dropped columns:", [header[i] for i in drop_idxs])
PY

  log "FY$YEAR Q$q: importing"
  npm run -s import:lca -- "$clean" "$YEAR"
done

log "Rebuilding derived tables"
npm run -s build:companies
npm run -s build:jobs

log "Sanity check"
YEAR="$YEAR" node - <<'NODE'
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const year = Number(process.env.YEAR);
const fy = await pool.query('select fiscal_year, count(*)::bigint c from lca_raw where fiscal_year = $1 group by fiscal_year order by fiscal_year', [year]);
const c  = await pool.query('select count(*)::bigint c from companies');
const j  = await pool.query('select count(*)::bigint c from jobs');
console.log('lca_raw year result:', fy.rows);
console.log('companies:', c.rows[0].c.toString());
console.log('jobs:', j.rows[0].c.toString());
await pool.end();
NODE

log "Done."
