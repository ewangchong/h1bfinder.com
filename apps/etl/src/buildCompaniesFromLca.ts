import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://h1b:h1bpass@localhost:5433/h1bfriend',
});

/**
 * Build `companies` table from DOL LCA disclosure data.
 *
 * Strategy (B): normalize employer name, group by normalized name, pick a display name,
 * and upsert into companies.
 */
async function main() {
  // Ensure required columns exist
  await pool.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS employer_name_normalized TEXT');
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_employer_norm ON companies (employer_name_normalized)');
  await pool.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT');
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_slug ON companies (slug)');

  // Normalize: uppercase, keep alnum, collapse spaces
  // slug: lowercase, keep alnum, dash separators
  const sql = `
    WITH base AS (
      SELECT
        employer_name,
        TRIM(REGEXP_REPLACE(UPPER(employer_name), '[^A-Z0-9]+', ' ', 'g')) AS employer_norm,
        case_status,
        fiscal_year
      FROM lca_raw
      WHERE employer_name IS NOT NULL AND employer_name <> ''
    ), agg AS (
      SELECT
        employer_norm,
        MAX(employer_name) AS display_name,
        COUNT(*)::int AS filed_count,
        SUM(CASE WHEN case_status ILIKE 'CERTIFIED%' THEN 1 ELSE 0 END)::int AS approved_count,
        MAX(fiscal_year)::int AS last_year
      FROM base
      GROUP BY employer_norm
    ), prepared AS (
      SELECT
        employer_norm,
        display_name,
        filed_count,
        approved_count,
        last_year,
        LOWER(TRIM(BOTH '-' FROM REGEXP_REPLACE(REGEXP_REPLACE(display_name, '[^A-Za-z0-9]+', '-', 'g'), '-+', '-', 'g'))) AS slug,
        CASE
          WHEN filed_count >= 10000 THEN 0.95
          WHEN filed_count >= 2000 THEN 0.90
          WHEN filed_count >= 500 THEN 0.80
          WHEN filed_count >= 100 THEN 0.65
          ELSE 0.50
        END AS confidence
      FROM agg
    )
    INSERT INTO companies (
      employer_name_normalized,
      slug,
      name,
      h1b_sponsorship_status,
      h1b_sponsorship_confidence,
      h1b_applications_filed,
      h1b_applications_approved,
      last_h1b_filing_year,
      updated_at
    )
    SELECT
      employer_norm,
      slug,
      display_name,
      'active',
      confidence,
      filed_count,
      approved_count,
      last_year,
      NOW()
    FROM prepared
    ON CONFLICT (employer_name_normalized) DO UPDATE SET
      slug = EXCLUDED.slug,
      name = EXCLUDED.name,
      h1b_sponsorship_status = EXCLUDED.h1b_sponsorship_status,
      h1b_sponsorship_confidence = EXCLUDED.h1b_sponsorship_confidence,
      h1b_applications_filed = EXCLUDED.h1b_applications_filed,
      h1b_applications_approved = EXCLUDED.h1b_applications_approved,
      last_h1b_filing_year = EXCLUDED.last_h1b_filing_year,
      updated_at = NOW();
  `;

  console.log('Building companies from lca_raw... (this can take a bit)');
  const t0 = Date.now();
  await pool.query(sql);
  const t1 = Date.now();

  const count = await pool.query('SELECT COUNT(*)::bigint AS c FROM companies');
  console.log(`Done in ${Math.round((t1 - t0) / 1000)}s. companies=${count.rows[0].c.toString()}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
