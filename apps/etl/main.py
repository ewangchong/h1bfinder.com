import sys
import os
import argparse
from db import migrate_if_needed
from transformers import load_excel_to_postgres
from builders import build_companies, build_jobs

def main():
    parser = argparse.ArgumentParser(description="H1BFriend Python ETL Pipeline")
    parser.add_argument("file_path", help="Path to the LCA Excel file (e.g. LCA_Disclosure_Data_FY2025.xlsx)")
    parser.add_argument("fiscal_year", type=int, help="The 4-digit fiscal year for the data")
    parser.add_argument("--skip-transform", action="store_true", help="Skip inserting into lca_raw and only rebuild tables")
    args = parser.parse_args()

    print("---------------------------------------")
    print(f"Starting Python ETL Pipeline")
    print(f"Targeting Postgres: {os.getenv('DATABASE_URL', 'Default Localhost')}")
    print("---------------------------------------")

    # Step 1: Ensure tables exist
    print("[1/3] Checking schema migrations...")
    migrate_if_needed()

    # Step 2: Load Excel completely overriding intermediate CSVs
    if not args.skip_transform:
        print(f"[2/3] Streaming Excel straight into memory & Postgres...")
        load_excel_to_postgres(args.file_path, args.fiscal_year)
    else:
        print("[2/3] Skipping Extract & Transform because --skip-transform is set.")

    # Step 3: Rebuild caches
    print("[3/3] Rebuilding derived caches (companies and jobs)...")
    build_companies()
    build_jobs()
    
    print("---------------------------------------")
    print("Pipeline Complete! 🎉")
    print("---------------------------------------")

if __name__ == "__main__":
    main()
