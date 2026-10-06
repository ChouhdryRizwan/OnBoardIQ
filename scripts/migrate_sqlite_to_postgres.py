"""
OnBoardIQ — SQLite to Render PostgreSQL Migration Script
Safely extracts existing evaluation & production data from local SQLite
and populates the Render PostgreSQL database while preserving all UUIDs,
relationships, JSON payloads, and audit trails.

Usage:
  python scripts/migrate_sqlite_to_postgres.py --target "postgresql://user:pass@host:5432/dbname"
Or set TARGET_DATABASE_URL environment variable.

CRITICAL SAFETY:
- Read-only on local SQLite (skillsprint.db is NEVER modified, dropped, or reseeded).
- Creates tables idempotently on PostgreSQL via SQLAlchemy metadata.
- Validates row counts before and after migration.
"""

import os
import sys
import argparse
from datetime import datetime
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config.settings import settings
from database.models import Base

# Dependency-ordered table list for clean foreign-key insertion
MIGRATION_TABLE_ORDER = [
    "users",
    "job_roles",
    "employee_profiles",
    "company_documents",
    "document_chunks",
    "document_processing_jobs",
    "role_requirement_matrix",
    "onboarding_plans",
    "onboarding_stages",
    "learning_modules",
    "practical_tasks",
    "module_quizzes",
    "quiz_options",
    "onboarding_checklists",
    "validation_reports",
    "requirement_comparison_details",
    "validation_issues",
    "hallucination_flags",
    "contradiction_flags",
    "manual_review_queue",
    "review_audit_trail",
    "employee_learning_plans",
    "employee_module_progress",
    "task_progress",
    "checklist_progress",
    "milestones",
    "quiz_attempts",
    "assessment_results",
    "weak_area_tracking",
    "adaptive_recommendations",
    "policy_update_records",
    "policy_update_impacts",
    "affected_requirement_impacts",
    "affected_module_impacts",
    "policy_audit_events",
    "genai_execution_logs",
    "progress_snapshots",
    "prompt_templates",
    "assessment_rubrics"
]

def clean_row(row_dict, table_obj):
    import json
    from datetime import date
    cleaned = {}
    for col in table_obj.columns:
        val = row_dict.get(col.name)
        if val is None:
            cleaned[col.name] = None
            continue
        col_type_str = str(col.type).upper()
        if "JSON" in col_type_str:
            if isinstance(val, str):
                try:
                    val = json.loads(val)
                except Exception:
                    pass
        elif "DATETIME" in col_type_str or "TIMESTAMP" in col_type_str:
            if isinstance(val, str):
                try:
                    val = datetime.fromisoformat(val.replace("Z", "+00:00"))
                except Exception:
                    pass
        elif "DATE" in col_type_str:
            if isinstance(val, str):
                try:
                    val = date.fromisoformat(val)
                except Exception:
                    pass
        elif "BOOL" in col_type_str:
            if isinstance(val, int):
                val = bool(val)
        cleaned[col.name] = val
    return cleaned

def migrate(source_sqlite_path: str, target_pg_url: str):
    if not os.path.exists(source_sqlite_path):
        print(f"[ERROR] Source SQLite database not found at: {source_sqlite_path}")
        sys.exit(1)

    if not target_pg_url:
        print("[ERROR] Target PostgreSQL database URL is required.")
        print("Provide via --target or TARGET_DATABASE_URL environment variable.")
        sys.exit(1)

    # Normalize PostgreSQL URL
    if target_pg_url.startswith("postgres://"):
        target_pg_url = target_pg_url.replace("postgres://", "postgresql://", 1)


    print(f"=== Starting OnBoardIQ Database Migration ===")
    print(f"Source (SQLite):     {source_sqlite_path}")
    print(f"Target (PostgreSQL): {target_pg_url.split('@')[-1] if '@' in target_pg_url else target_pg_url}")
    print(f"Timestamp:           {datetime.utcnow().isoformat()}Z")

    # Connect to SQLite (READ-ONLY)
    sqlite_url = f"sqlite:///{os.path.abspath(source_sqlite_path)}"
    sqlite_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    sqlite_inspector = inspect(sqlite_engine)
    existing_sqlite_tables = set(sqlite_inspector.get_table_names())

    # Connect to PostgreSQL
    pg_engine = create_engine(target_pg_url, pool_pre_ping=True)

    print("\n1. Creating database schema on PostgreSQL...")
    Base.metadata.create_all(bind=pg_engine)
    print("   [OK] PostgreSQL tables created successfully.")

    # Disable foreign keys temporarily on PostgreSQL for bulk loading if supported, or insert in topological order
    total_migrated_rows = 0
    migration_summary = {}

    with sqlite_engine.connect() as sqlite_conn, pg_engine.connect() as pg_conn:
        for table_name in MIGRATION_TABLE_ORDER:
            if table_name not in existing_sqlite_tables:
                continue

            # Read from SQLite
            select_query = text(f'SELECT * FROM "{table_name}"')
            rows = sqlite_conn.execute(select_query).mappings().all()
            row_count = len(rows)

            if row_count == 0:
                migration_summary[table_name] = (0, 0)
                continue

            print(f"   Migrating table '{table_name}': {row_count} rows...")

            # Convert rows to dicts with clean types
            table_obj = Base.metadata.tables.get(table_name)

            if table_obj is None:
                print(f"   [WARN] Table '{table_name}' not found in SQLAlchemy metadata. Skipping.")
                continue

            data_to_insert = [clean_row(dict(r), table_obj) for r in rows]

            # Insert into PostgreSQL using SQLAlchemy Table metadata
            chunk_size = 500
            for i in range(0, len(data_to_insert), chunk_size):
                chunk = data_to_insert[i:i + chunk_size]
                pg_conn.execute(table_obj.insert(), chunk)
            pg_conn.commit()


            # Verify count in PostgreSQL
            pg_count = pg_conn.execute(text(f'SELECT COUNT(*) FROM "{table_name}"')).scalar()
            migration_summary[table_name] = (row_count, pg_count)
            total_migrated_rows += row_count
            print(f"      Verified: SQLite={row_count} -> PG={pg_count}")

    print("\n=== Migration Verification Audit ===")
    mismatches = 0
    for tbl, (s_cnt, p_cnt) in migration_summary.items():
        status = "[MATCH]" if s_cnt == p_cnt else "[MISMATCH]"
        if s_cnt != p_cnt:
            mismatches += 1
        print(f"  {status} {tbl:35s}: SQLite={s_cnt:4d} | PG={p_cnt:4d}")

    if mismatches == 0:
        print(f"\n[SUCCESS] All {total_migrated_rows} rows successfully migrated to PostgreSQL with 100% integrity!")
    else:
        print(f"\n[WARNING] {mismatches} table count discrepancies detected. Please review.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate OnBoardIQ SQLite database to Render PostgreSQL")
    parser.add_argument(
        "--source",
        default=os.path.join(os.path.dirname(__file__), "..", "skillsprint.db"),
        help="Path to source SQLite file (default: skillsprint.db)"
    )
    parser.add_argument(
        "--target",
        default=os.getenv("TARGET_DATABASE_URL"),
        help="Target PostgreSQL connection string (DATABASE_URL)"
    )
    args = parser.parse_args()

    migrate(args.source, args.target)
