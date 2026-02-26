import 'dotenv/config';
import fs from 'node:fs';
import pg from 'pg';
import { z } from 'zod';
import { slugify } from '../slug.js';

const { Pool } = pg;

const companySchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  website_url: z.string().url().optional(),
  industry: z.string().optional(),
  headquarters_city: z.string().optional(),
  headquarters_state: z.string().optional(),
  headquarters_country: z.string().optional(),
  h1b_sponsorship_status: z.string().optional(),
  h1b_sponsorship_confidence: z.number().min(0).max(1).optional(),
  h1b_applications_filed: z.number().int().nonnegative().optional(),
  h1b_applications_approved: z.number().int().nonnegative().optional(),
  last_h1b_filing_year: z.number().int().optional(),
  active_job_count: z.number().int().optional(),
});

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: npm run import:companies -- <path/to/companies.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
const companies = z.array(companySchema).parse(data);

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://h1b:h1bpass@localhost:5433/h1bfriend',
});

async function main() {
  let inserted = 0;
  for (const c of companies) {
    const slug = slugify(c.name);
    await pool.query(
      `INSERT INTO companies (
        slug, name, domain, website_url, industry,
        headquarters_city, headquarters_state, headquarters_country,
        h1b_sponsorship_status, h1b_sponsorship_confidence,
        h1b_applications_filed, h1b_applications_approved, last_h1b_filing_year, active_job_count
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,
        $9,$10,
        $11,$12,$13,$14
      )
      ON CONFLICT (slug) DO UPDATE SET
        name=EXCLUDED.name,
        domain=EXCLUDED.domain,
        website_url=EXCLUDED.website_url,
        industry=EXCLUDED.industry,
        headquarters_city=EXCLUDED.headquarters_city,
        headquarters_state=EXCLUDED.headquarters_state,
        headquarters_country=EXCLUDED.headquarters_country,
        h1b_sponsorship_status=EXCLUDED.h1b_sponsorship_status,
        h1b_sponsorship_confidence=EXCLUDED.h1b_sponsorship_confidence,
        h1b_applications_filed=EXCLUDED.h1b_applications_filed,
        h1b_applications_approved=EXCLUDED.h1b_applications_approved,
        last_h1b_filing_year=EXCLUDED.last_h1b_filing_year,
        active_job_count=EXCLUDED.active_job_count,
        updated_at=NOW();
      `,
      [
        slug,
        c.name,
        c.domain || null,
        c.website_url || null,
        c.industry || null,
        c.headquarters_city || null,
        c.headquarters_state || null,
        c.headquarters_country || null,
        c.h1b_sponsorship_status || null,
        c.h1b_sponsorship_confidence ?? null,
        c.h1b_applications_filed ?? null,
        c.h1b_applications_approved ?? null,
        c.last_h1b_filing_year ?? null,
        c.active_job_count ?? null,
      ]
    );
    inserted++;
  }

  console.log(`Imported ${inserted} companies`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
