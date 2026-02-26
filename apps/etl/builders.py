import time
from db import get_connection, release_connection

def build_companies():
    """Builds the companies table and normalizes the employers."""
    print("Building companies from lca_raw... (this can take a bit)")
    t0 = time.time()
    
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
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
            """)
            
            cur.execute("SELECT COUNT(*)::bigint AS c FROM companies")
            count = cur.fetchone()[0]
            
        conn.commit()
        t1 = time.time()
        print(f"Done in {round(t1 - t0)}s. companies={count}")
    except Exception as e:
        conn.rollback()
        print(f"Failed to build companies: {e}")
        raise
    finally:
        release_connection(conn)

def build_jobs():
    """Populates the jobs table deterministically."""
    print("Building jobs from lca_raw... (up to 50k rows)")
    t0 = time.time()
    
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("TRUNCATE jobs")
            cur.execute("""
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
                  make_date(last_year, 10, 1) AS posted_date,
                  true AS h1b_sponsorship_available,
                  NOW(),
                  NOW()
                FROM joined;
            """)
            
            cur.execute("SELECT COUNT(*)::bigint AS c FROM jobs")
            count = cur.fetchone()[0]
            
        conn.commit()
        t1 = time.time()
        print(f"Done in {round(t1 - t0)}s. jobs={count}")
    except Exception as e:
        conn.rollback()
        print(f"Failed to build jobs: {e}")
        raise
    finally:
        release_connection(conn)
