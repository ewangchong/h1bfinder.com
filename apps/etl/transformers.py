import sys
import pandas as pd
from io import StringIO
from db import get_connection, release_connection

# Expected DB columns exactly matching the schema of `lca_raw`
# Total: 96 columns (excluding id, created_at)
LCA_COLUMNS = [
    "fiscal_year", "case_number", "case_status", "received_date", "decision_date", 
    "original_cert_date", "visa_class", "job_title", "soc_code", "soc_title", 
    "full_time_position", "begin_date", "end_date", "total_worker_positions", 
    "new_employment", "continued_employment", "change_previous_employment", 
    "new_concurrent_employment", "change_employer", "amended_petition", "employer_name", 
    "trade_name_dba", "employer_address1", "employer_address2", "employer_city", 
    "employer_state", "employer_postal_code", "employer_country", "employer_province", 
    "employer_phone", "employer_phone_ext", "naics_code", "employer_poc_last_name", 
    "employer_poc_first_name", "employer_poc_middle_name", "employer_poc_job_title", 
    "employer_poc_address1", "employer_poc_address2", "employer_poc_city", 
    "employer_poc_state", "employer_poc_postal_code", "employer_poc_country", 
    "employer_poc_province", "employer_poc_phone", "employer_poc_phone_ext", 
    "employer_poc_email", "agent_representing_employer", "agent_attorney_last_name", 
    "agent_attorney_first_name", "agent_attorney_middle_name", "agent_attorney_address1", 
    "agent_attorney_address2", "agent_attorney_city", "agent_attorney_state", 
    "agent_attorney_postal_code", "agent_attorney_country", "agent_attorney_province", 
    "agent_attorney_phone", "agent_attorney_phone_ext", "agent_attorney_email_address", 
    "lawfirm_name_business_name", "state_of_highest_court", "name_of_highest_state_court", 
    "worksite_workers", "secondary_entity", "secondary_entity_business_name", 
    "worksite_address1", "worksite_address2", "worksite_city", "worksite_county", 
    "worksite_state", "worksite_postal_code", "wage_rate_of_pay_from", "wage_rate_of_pay_to", 
    "wage_unit_of_pay", "prevailing_wage", "pw_unit_of_pay", "pw_tracking_number", 
    "pw_wage_level", "pw_oes_year", "pw_other_source", "pw_other_year", "pw_survey_publisher", 
    "pw_survey_name", "total_worksite_locations", "agree_to_lc_statement", "h_1b_dependent", 
    "willful_violator", "support_h1b", "statutory_basis", "appendix_a_attached", 
    "public_disclosure", "preparer_last_name", "preparer_first_name", "preparer_middle_initial", 
    "preparer_business_name", "preparer_email"
]

def drop_indexes(cur) -> None:
    print("Dropping indexes temporarily for bulk copy...")
    cur.execute("DROP INDEX IF EXISTS idx_lca_raw_year;")
    cur.execute("DROP INDEX IF EXISTS idx_lca_raw_employer;")
    cur.execute("DROP INDEX IF EXISTS idx_lca_raw_case_number;")

def recreate_indexes(cur) -> None:
    print("Recreating indexes...")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_lca_raw_year ON lca_raw (fiscal_year);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_lca_raw_employer ON lca_raw (employer_name);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_lca_raw_case_number ON lca_raw (case_number);")

def load_excel_to_postgres(file_path: str, fiscal_year: int, cur=None) -> None:
    """Read DOL LCA xlsx file, align headers, drop PI, and stream dynamically to Postgres."""
    print(f"Reading {file_path} for fiscal year {fiscal_year}...")
    
    # Read the first row to determine actual columns
    df_head = pd.read_excel(file_path, nrows=0)
    source_cols = list(df_head.columns)
    
    # Columns typically containing PI that should not be saved or might break 
    cols_to_drop = [c for c in source_cols if c.upper() in ["EMPLOYER_FEIN"]]
    
    use_cols = [c for c in source_cols if c not in cols_to_drop]

    print(f"Identified {len(use_cols)} columns to import.")

    # We read chunk by chunk
    conn = None
    own_cur = False
    
    if cur is None:
        conn = get_connection()
        cur = conn.cursor()
        own_cur = True
        
    try:
        
        # We need to map the incoming DataFrame columns exactly to our LCA_COLUMNS order.
        # Ensure we have fiscal_year mapped manually.
        with pd.ExcelFile(file_path) as xls:
            df = pd.read_excel(xls, usecols=use_cols, dtype=str)

            print(f"Loaded {len(df)} rows into memory. Processing...")
            
            # Map Excel columns dynamically to db columns by index matching since DOL CSVs vary wildly but order is often same after FEIN drop
            # Or by name matching. Since the order often breaks, let's map by mapping their index to our expected columns
            # But the safer way is to truncate it to the first N columns we care about.
            max_cols = min(len(df.columns), len(LCA_COLUMNS) - 1)
            mapped_df = df.iloc[:, :max_cols].copy()
            
            # Make sure we add the fiscal_year
            final_df = pd.DataFrame(columns=LCA_COLUMNS)
            final_df['fiscal_year'] = [fiscal_year] * len(mapped_df)
            
            # Assign remaining columns. Assumes sequential mapping matches mapping length.
            # E.g case_number is the first column from mapped_df, case_status is second...
            for i, col_name in enumerate(mapped_df.columns):
                target_col = LCA_COLUMNS[i + 1] # +1 because 0 is fiscal_year
                final_df[target_col] = mapped_df[col_name]
                
            # Clean completely NaN strings
            final_df = final_df.fillna("")

            # Generate CSV in memory for fast copy_expert streaming
            csv_buffer = StringIO()
            final_df.to_csv(csv_buffer, index=False, header=False, sep='\t')
            csv_buffer.seek(0)
            
            print("Writing to PostgreSQL using high-speed COPY...")
            cur.copy_expert(f"""
                COPY lca_raw ({",".join(LCA_COLUMNS)}) FROM STDIN WITH (FORMAT csv, DELIMITER '\t')
            """, csv_buffer)

        if own_cur and conn:
            conn.commit()
        print(f"Successfully processed {file_path}.")
    except Exception as e:
        if own_cur and conn:
            conn.rollback()
        print(f"Error during Postgres insertion: {e}")
        raise
    finally:
        if own_cur:
            if cur:
                cur.close()
            if conn:
                release_connection(conn)
