import sys
import os
import argparse
import glob
import re
from db import migrate_if_needed, get_connection, release_connection
from transformers import load_excel_to_postgres, drop_indexes, recreate_indexes
from builders import build_companies, build_jobs

def main():
    parser = argparse.ArgumentParser(description="H1BFriend Python ETL Pipeline")
    parser.add_argument("--file", help="Path to a single LCA Excel file (e.g. LCA_FY2025.xlsx)")
    parser.add_argument("--year", type=int, help="The 4-digit fiscal year for the single file")
    parser.add_argument("--dir", help="Path to a directory containing multiple LCA Excel files. Year will be extracted from filename.")
    parser.add_argument("--skip-transform", action="store_true", help="Skip inserting into lca_raw and only rebuild tables")
    parser.add_argument("--skip-indexes", action="store_true", help="Skip dropping and recreating indexes")
    parser.add_argument("--skip-caches", action="store_true", help="Skip rebuilding derived caches (companies, jobs)")
    parser.add_argument("--prepare", action="store_true", help="Only drop indexes to prepare for bulk load")
    parser.add_argument("--finalize", action="store_true", help="Only recreate indexes and rebuild caches")
    args = parser.parse_args()

    if not any([args.skip_transform, args.prepare, args.finalize, args.file, args.dir]):
        parser.error("Must provide an action flag like --file, --dir, --prepare, or --finalize.")
    if args.file and not args.year:
        parser.error("--year is required when using --file.")

    print("---------------------------------------")
    print(f"Starting Python ETL Pipeline")
    print(f"Targeting Postgres: {os.getenv('DATABASE_URL', 'Default Localhost')}")
    print("---------------------------------------")

    # Step 1: Ensure tables exist
    print("[1/3] Checking schema migrations...")
    migrate_if_needed()

    # Step 2: Load Excel completely overriding intermediate CSVs
    if args.prepare:
        print("[2/3] Preparing: Dropping indexes only...")
        conn = get_connection()
        try:
            cur = conn.cursor()
            drop_indexes(cur)
            conn.commit()
        finally:
            cur.close()
            release_connection(conn)
        print("[3/3] Skipping caches (prepare mode).")
        return

    if args.finalize:
        print("[2/3] Finalizing: Recreating indexes...")
        conn = get_connection()
        try:
            cur = conn.cursor()
            recreate_indexes(cur)
            conn.commit()
        finally:
            cur.close()
            release_connection(conn)
        print("[3/3] Rebuilding derived caches (companies and jobs)...")
        build_companies()
        build_jobs()
        return

    if not args.skip_transform:
        conn = get_connection()
        try:
            cur = conn.cursor()
            if not args.skip_indexes:
                drop_indexes(cur)
            
            if args.file:
                print(f"[2/3] Streaming {args.file} straight into memory & Postgres...")
                load_excel_to_postgres(args.file, args.year, cur)
            elif args.dir:
                files = glob.glob(os.path.join(args.dir, "*.xlsx"))
                print(f"[2/3] Found {len(files)} Excel files in {args.dir}. Processing in batch...")
                for f in sorted(files):
                    # Extract year from filename like "LCA_FY2024.xlsx" or "LCA_Disclosure_Data_FY2025.xlsx"
                    match = re.search(r'20\d{2}', os.path.basename(f))
                    if not match:
                        print(f"  --> Skipping {f}, could not parse year (e.g. 2024) from filename.")
                        continue
                    yr = int(match.group(0))
                    print(f"\n---> Batch Processing: {f} for FY{yr}...")
                    load_excel_to_postgres(f, yr, cur)
            
            if not args.skip_indexes:
                recreate_indexes(cur)
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            release_connection(conn)
    else:
        print("[2/3] Skipping Extract & Transform because --skip-transform is set.")

    # Step 3: Rebuild caches
    if not args.skip_caches:
        print("[3/3] Rebuilding derived caches (companies and jobs)...")
        build_companies()
        build_jobs()
    else:
        print("[3/3] Skipping derived caches because --skip-caches is set.")
    
    print("---------------------------------------")
    print("Pipeline Complete! 🎉")
    print("---------------------------------------")

if __name__ == "__main__":
    main()
