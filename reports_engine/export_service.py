"""
Export Service — Formats reports to CSV, Excel (CSV/XLS), and HTML PDF formats.
100% Deterministic Python output formatting while preserving active filters.
"""

import io
import csv
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from reports_engine.employee_report_service import get_employee_progress_report
from reports_engine.role_coverage_service import get_role_coverage_report
from reports_engine.mandatory_training_service import get_mandatory_training_report
from reports_engine.assessment_report_service import get_assessment_report
from reports_engine.traceability_report_service import get_source_traceability_report
from reports_engine.hallucination_report_service import get_hallucination_report
from reports_engine.policy_report_service import get_policy_coverage_report
from reports_engine.comparison_service import get_genai_vs_python_comparison


def export_report_data(
    db: Session,
    report_type: str,
    export_format: str,
    search: str = None,
    department: str = None,
    role_code: str = None,
    status: str = None
) -> Tuple[bytes, str, str]:
    """
    Returns tuple of (file_bytes, media_type, filename)
    """
    fmt = export_format.lower()
    rep = report_type.lower().replace("-", "_")

    headers: List[str] = []
    rows: List[List[Any]] = []

    if rep in ["employee", "employee_progress"]:
        report_data = get_employee_progress_report(
            db, search=search, department=department, role_code=role_code, status=status, page=1, size=1000
        )
        headers = ["Employee ID", "Name", "Email", "Department", "Role Code", "Role Title", "Progress %", "Completed Modules", "Total Modules", "Status"]
        for item in report_data.items:
            rows.append([
                item.employee_id, item.employee_name, item.email, item.department,
                item.role_code, item.role_title, item.overall_progress_percentage,
                item.completed_modules, item.total_modules, item.current_status
            ])

    elif rep in ["role", "role_coverage"]:
        data = get_role_coverage_report(db, department=department, role_code=role_code)
        headers = ["Role Code", "Role Title", "Department", "Total RRM", "Mandatory", "Optional", "Covered", "Coverage %", "Status"]
        for item in data:
            rows.append([
                item.role_code, item.role_title, item.department, item.total_rrm_requirements,
                item.mandatory_requirements, item.optional_requirements, item.covered_requirements,
                item.coverage_percentage, item.outdated_status
            ])

    elif rep in ["mandatory", "mandatory_training"]:
        data = get_mandatory_training_report(db, department=department, role_code=role_code)
        headers = ["Req ID", "Req Title", "Role Code", "Employee", "Department", "Source Doc ID", "Source Version", "Completion Status", "Validation Status"]
        for item in data:
            rows.append([
                item.requirement_id, item.requirement_title, item.role_code, item.employee_name,
                item.department, item.source_document_id, item.source_document_version,
                item.completion_status, item.validation_status
            ])

    elif rep in ["assessment", "assessments"]:
        summary = get_assessment_report(db, department=department, role_code=role_code, status=status)
        headers = ["Employee ID", "Employee Name", "Role", "Module", "Topic", "Attempts", "Best Score", "Latest Score", "Result"]
        for item in summary.items:
            rows.append([
                item.employee_id, item.employee_name, item.role_title, item.module_title,
                item.assessment_topic, item.attempts_count, item.best_score, item.latest_score,
                item.pass_fail_result
            ])

    elif rep in ["traceability", "source_traceability"]:
        data = get_source_traceability_report(db, role_code=role_code)
        headers = ["Source Doc ID", "Doc Title", "Version", "Page", "Section", "Chunk ID", "Req ID", "Role Code", "Module Title", "Validation Status"]
        for item in data:
            rows.append([
                item.source_document_id, item.source_document_title, item.source_document_version,
                item.page_number or "", item.section_id, item.chunk_id, item.requirement_id,
                item.role_code, item.module_title, item.validation_status
            ])

    elif rep in ["hallucination", "unsupported"]:
        data = get_hallucination_report(db, severity=status)
        headers = ["Plan ID", "Employee", "Role", "Flag Type", "Statement", "Reason", "Severity", "Review Status", "Human Decision"]
        for item in data:
            rows.append([
                item.plan_id, item.employee_name, item.role_title, item.flag_type,
                item.flagged_statement, item.reason, item.severity, item.review_status,
                item.human_decision or "N/A"
            ])

    elif rep in ["policy", "policy_coverage"]:
        data = get_policy_coverage_report(db)
        headers = ["Doc ID", "Doc Title", "Version", "Effective Date", "Affected Roles", "Affected Reqs", "Affected Modules", "Affected Plans", "Coverage %", "Status"]
        for item in data:
            rows.append([
                item.document_id, item.document_title, item.policy_version, item.effective_date,
                item.affected_roles_count, item.affected_requirements_count, item.affected_modules_count,
                item.affected_plans_count, item.current_coverage_percentage, item.version_status
            ])

    else:
        # Default GenAI vs Python
        summary = get_genai_vs_python_comparison(db)
        headers = ["Plan ID", "Module ID", "Req ID", "GenAI Classification", "Python Classification", "Traceability Match", "Overall Match", "Validation Status"]
        for item in summary.items:
            rows.append([
                item.plan_id, item.module_id, item.requirement_id, item.genai_classification,
                item.python_classification, item.traceability_match, item.overall_match, item.validation_status
            ])

    # Format generation
    if fmt == "pdf":
        html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>OnBoardIQ Report — {report_type.title()}</title>
<style>
body {{ font-family: Arial, sans-serif; margin: 20px; }}
h1 {{ color: #1e3a8a; }}
table {{ border-collapse: collapse; width: 100%; margin-top: 15px; }}
th, td {{ border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 12px; }}
th {{ background-color: #f1f5f9; color: #0f172a; font-weight: bold; }}
tr:nth-child(even) {{ background-color: #f8fafc; }}
</style>
</head>
<body>
<h1>OnBoardIQ — {report_type.replace('_', ' ').title()} Report</h1>
<p>Generated deterministically from system data.</p>
<table>
<thead><tr>{"".join(f"<th>{h}</th>" for h in headers)}</tr></thead>
<tbody>
{"".join("<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>" for row in rows)}
</tbody>
</table>
</body>
</html>
"""
        return html_content.encode("utf-8"), "text/html", f"onboardiq_{rep}_report.html"

    elif fmt in ["excel", "xlsx", "xls"]:
        # Excel compatible tab-separated / CSV buffer
        stream = io.StringIO()
        writer = csv.writer(stream, dialect="excel")
        writer.writerow(headers)
        writer.writerows(rows)
        return stream.getvalue().encode("utf-8-sig"), "application/vnd.ms-excel", f"onboardiq_{rep}_report.csv"

    else:
        # Standard CSV
        stream = io.StringIO()
        writer = csv.writer(stream)
        writer.writerow(headers)
        writer.writerows(rows)
        return stream.getvalue().encode("utf-8"), "text/csv", f"onboardiq_{rep}_report.csv"
