import 'dotenv/config';
import fs from 'node:fs';
import pg from 'pg';
import { from as copyFrom } from 'pg-copy-streams';

// NOTE: This importer streams the CSV into Postgres using COPY FROM STDIN.
// It assumes the DOL Combined LCA Disclosure CSV header matches the table columns.

const { Pool } = pg;

function inferFiscalYearFromFilename(path: string): number | null {
  const m = path.match(/FY(20\d{2})/i);
  if (m) return Number(m[1]);
  const m2 = path.match(/(20\d{2})/);
  if (m2) return Number(m2[1]);
  return null;
}

async function main() {
  const filePath = process.argv[2];
  const yearArg = process.argv[3];
  if (!filePath) {
    console.error('Usage: npm run import:lca -- <path/to/Combined_LCA_Disclosure_Data_FY2024.csv> [fiscalYear]');
    process.exit(1);
  }

  const fiscalYear = yearArg ? Number(yearArg) : inferFiscalYearFromFilename(filePath);
  if (!fiscalYear || Number.isNaN(fiscalYear)) {
    console.error('Could not infer fiscal year. Provide it as the 2nd argument.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL || 'postgres://h1b:h1bpass@localhost:5433/h1bfriend',
  });

  const client = await pool.connect();
  try {
    // Check header
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(64 * 1024);
    const bytes = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    const firstChunk = buf.subarray(0, bytes).toString('utf8');
    const headerLine = firstChunk.split(/\r?\n/)[0];
    const headers = headerLine.split(',');
    if (headers.length < 80) {
      console.warn(`Header columns look suspiciously low (${headers.length}). Is this the Combined LCA CSV?`);
    }

    // IMPORTANT: don't rewrite CSV lines (cells can contain newlines).
    // We instead temporarily set a DEFAULT on fiscal_year and omit it from COPY.
    await client.query(`ALTER TABLE lca_raw ALTER COLUMN fiscal_year SET DEFAULT ${fiscalYear};`);

    console.log('Starting COPY into lca_raw...');
    const stream = client.query(
      copyFrom(
        `COPY lca_raw (
          case_number, case_status, received_date, decision_date, original_cert_date, visa_class,
          job_title, soc_code, soc_title, full_time_position, begin_date, end_date,
          total_worker_positions, new_employment, continued_employment, change_previous_employment,
          new_concurrent_employment, change_employer, amended_petition,
          employer_name, trade_name_dba, employer_address1, employer_address2, employer_city,
          employer_state, employer_postal_code, employer_country, employer_province, employer_phone,
          employer_phone_ext, naics_code,
          employer_poc_last_name, employer_poc_first_name, employer_poc_middle_name, employer_poc_job_title,
          employer_poc_address1, employer_poc_address2, employer_poc_city, employer_poc_state,
          employer_poc_postal_code, employer_poc_country, employer_poc_province, employer_poc_phone,
          employer_poc_phone_ext, employer_poc_email,
          agent_representing_employer, agent_attorney_last_name, agent_attorney_first_name, agent_attorney_middle_name,
          agent_attorney_address1, agent_attorney_address2, agent_attorney_city, agent_attorney_state,
          agent_attorney_postal_code, agent_attorney_country, agent_attorney_province, agent_attorney_phone,
          agent_attorney_phone_ext, agent_attorney_email_address, lawfirm_name_business_name,
          state_of_highest_court, name_of_highest_state_court, worksite_workers, secondary_entity,
          secondary_entity_business_name, worksite_address1, worksite_address2, worksite_city,
          worksite_county, worksite_state, worksite_postal_code, wage_rate_of_pay_from,
          wage_rate_of_pay_to, wage_unit_of_pay, prevailing_wage, pw_unit_of_pay, pw_tracking_number,
          pw_wage_level, pw_oes_year, pw_other_source, pw_other_year, pw_survey_publisher,
          pw_survey_name, total_worksite_locations, agree_to_lc_statement, h_1b_dependent,
          willful_violator, support_h1b, statutory_basis, appendix_a_attached, public_disclosure,
          preparer_last_name, preparer_first_name, preparer_middle_initial, preparer_business_name, preparer_email
        ) FROM STDIN WITH (FORMAT csv, HEADER true)`
      )
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(stream);

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
      fileStream.on('error', reject);
    });

    await client.query('ALTER TABLE lca_raw ALTER COLUMN fiscal_year DROP DEFAULT');

    console.log('COPY complete');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
