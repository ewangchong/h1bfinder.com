import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://h1b:h1bpass@localhost:5433/h1bfriend',
});

/**
 * Populate `jobs` table with realistic data derived from LCA filings.
 *
 * We generate deterministic UUIDs via uuid_generate_v5(namespace, name)
 * so the same (employer_norm + title + state + city) yields a stable id.
 */
async function main() {
  // Ensure extension is present
  await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Keep the demo jobs? For now: replace entirely to show real data.
  await pool.query('TRUNCATE jobs');

  const sql = `
    WITH base AS (
      SELECT
        TRIM(job_title) AS title,
        TRIM(worksite_city) AS city,
        TRIM(worksite_state) AS state,
        TRIM(REGEXP_REPLACE(UPPER(employer_name), '[^A-Z0-9]+', ' ', 'g')) AS employer_norm,
        MAX(fiscal_year)::int AS last_year,
        COUNT(*)::int AS filings
      FROM lca_raw
      WHERE job_title IS NOT NULL AND job_title <> ''
        AND employer_name IS NOT NULL AND employer_name <> ''
      GROUP BY 1,2,3,4
    ), ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (ORDER BY filings DESC) AS rn
      FROM base
    ), chosen AS (
      SELECT * FROM ranked WHERE rn <= 50000
    ), joined AS (
      SELECT
        c.id AS company_id,
        c.name AS company_name,
        ch.title,
        ch.city,
        ch.state,
        ch.last_year,
        ch.filings
      FROM chosen ch
      LEFT JOIN companies c ON c.employer_name_normalized = ch.employer_norm
    )
    INSERT INTO jobs (
      id,
      company_id,
      company_name,
      title,
      location,
      city,
      state,
      country,
      posted_date,
      h1b_sponsorship_available,
      created_at,
      updated_at
    )
    SELECT
      uuid_generate_v5(
        '00000000-0000-0000-0000-000000000000'::uuid,
        COALESCE(company_name, '') || '|' || title || '|' || COALESCE(state,'') || '|' || COALESCE(city,'')
      ) AS id,
      company_id,
      company_name,
      title,
      CASE
        WHEN city IS NOT NULL AND city <> '' AND state IS NOT NULL AND state <> '' THEN city || ', ' || state
        WHEN state IS NOT NULL AND state <> '' THEN state
        ELSE NULL
      END AS location,
      NULLIF(city,'') AS city,
      NULLIF(state,'') AS state,
      'US' AS country,
      -- We don't have a true posted date; use a synthetic date based on last_year.
      make_date(last_year, 10, 1) AS posted_date,
      true AS h1b_sponsorship_available,
      NOW(),
      NOW()
    FROM joined;
  `;

  console.log('Building jobs from lca_raw... (up to 50k rows)');
  const t0 = Date.now();
  await pool.query(sql);
  const t1 = Date.now();

  const count = await pool.query('SELECT COUNT(*)::bigint AS c FROM jobs');
  console.log(`Done in ${Math.round((t1 - t0) / 1000)}s. jobs=${count.rows[0].c.toString()}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
