import 'dotenv/config';
import pg from 'pg';
import { slugify } from './slug.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://h1b:h1bpass@localhost:5433/h1bfriend',
});

async function main() {
  // 0) LCA raw table (for DOL Combined LCA Disclosure CSV)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lca_raw (
      id BIGSERIAL PRIMARY KEY,
      fiscal_year INTEGER NOT NULL,
      case_number TEXT,
      case_status TEXT,
      received_date TEXT,
      decision_date TEXT,
      original_cert_date TEXT,
      visa_class TEXT,
      job_title TEXT,
      soc_code TEXT,
      soc_title TEXT,
      full_time_position TEXT,
      begin_date TEXT,
      end_date TEXT,
      total_worker_positions TEXT,
      new_employment TEXT,
      continued_employment TEXT,
      change_previous_employment TEXT,
      new_concurrent_employment TEXT,
      change_employer TEXT,
      amended_petition TEXT,
      employer_name TEXT,
      trade_name_dba TEXT,
      employer_address1 TEXT,
      employer_address2 TEXT,
      employer_city TEXT,
      employer_state TEXT,
      employer_postal_code TEXT,
      employer_country TEXT,
      employer_province TEXT,
      employer_phone TEXT,
      employer_phone_ext TEXT,
      naics_code TEXT,
      employer_poc_last_name TEXT,
      employer_poc_first_name TEXT,
      employer_poc_middle_name TEXT,
      employer_poc_job_title TEXT,
      employer_poc_address1 TEXT,
      employer_poc_address2 TEXT,
      employer_poc_city TEXT,
      employer_poc_state TEXT,
      employer_poc_postal_code TEXT,
      employer_poc_country TEXT,
      employer_poc_province TEXT,
      employer_poc_phone TEXT,
      employer_poc_phone_ext TEXT,
      employer_poc_email TEXT,
      agent_representing_employer TEXT,
      agent_attorney_last_name TEXT,
      agent_attorney_first_name TEXT,
      agent_attorney_middle_name TEXT,
      agent_attorney_address1 TEXT,
      agent_attorney_address2 TEXT,
      agent_attorney_city TEXT,
      agent_attorney_state TEXT,
      agent_attorney_postal_code TEXT,
      agent_attorney_country TEXT,
      agent_attorney_province TEXT,
      agent_attorney_phone TEXT,
      agent_attorney_phone_ext TEXT,
      agent_attorney_email_address TEXT,
      lawfirm_name_business_name TEXT,
      state_of_highest_court TEXT,
      name_of_highest_state_court TEXT,
      worksite_workers TEXT,
      secondary_entity TEXT,
      secondary_entity_business_name TEXT,
      worksite_address1 TEXT,
      worksite_address2 TEXT,
      worksite_city TEXT,
      worksite_county TEXT,
      worksite_state TEXT,
      worksite_postal_code TEXT,
      wage_rate_of_pay_from TEXT,
      wage_rate_of_pay_to TEXT,
      wage_unit_of_pay TEXT,
      prevailing_wage TEXT,
      pw_unit_of_pay TEXT,
      pw_tracking_number TEXT,
      pw_wage_level TEXT,
      pw_oes_year TEXT,
      pw_other_source TEXT,
      pw_other_year TEXT,
      pw_survey_publisher TEXT,
      pw_survey_name TEXT,
      total_worksite_locations TEXT,
      agree_to_lc_statement TEXT,
      h_1b_dependent TEXT,
      willful_violator TEXT,
      support_h1b TEXT,
      statutory_basis TEXT,
      appendix_a_attached TEXT,
      public_disclosure TEXT,
      preparer_last_name TEXT,
      preparer_first_name TEXT,
      preparer_middle_initial TEXT,
      preparer_business_name TEXT,
      preparer_email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_lca_raw_year ON lca_raw (fiscal_year);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_lca_raw_employer ON lca_raw (employer_name);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_lca_raw_case_number ON lca_raw (case_number);`);

  // 1) add slug column if missing
  await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT;`);
  // 1b) store normalized employer name for stable dedupe
  await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS employer_name_normalized TEXT;`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_employer_norm ON companies (employer_name_normalized);`);

  // 2) backfill slugs for rows missing
  const res = await pool.query(`SELECT id, name FROM companies WHERE slug IS NULL OR slug = ''`);
  for (const row of res.rows) {
    const slug = slugify(row.name);
    await pool.query(`UPDATE companies SET slug=$1 WHERE id=$2`, [slug, row.id]);
  }
  // 3) unique index (best-effort)
  await pool.query(`DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_companies_slug'
    ) THEN
      CREATE UNIQUE INDEX idx_companies_slug ON companies (slug);
    END IF;
  END $$;`);

  console.log('Migration complete');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
