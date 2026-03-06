CREATE INDEX IF NOT EXISTS idx_lca_raw_job_title_year_case_status
ON lca_raw (job_title, fiscal_year) INCLUDE (case_status);
