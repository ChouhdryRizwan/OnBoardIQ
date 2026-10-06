from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from database.models import (
    OnboardingPlan, EmployeeProfile, JobRole, RoleRequirementMatrix,
    CompanyDocument, DocumentChunk, OnboardingStage, LearningModule,
    PracticalTask, ModuleQuiz, OnboardingChecklist, ValidationReport,
    ValidationIssue, RequirementComparisonDetail, HallucinationFlag, ContradictionFlag,
    ManualReviewQueue, VerificationStatusEnum, MatchResultEnum, DocumentStatusEnum
)
from role_matrix.matrix_manager import matrix_manager
from genai_pipeline.schema_validator import schema_validator

from python_validation.schemas import ValidationIssueSchema, RequirementComparisonItem, ValidationMetricsSchema
from python_validation.coverage import coverage_validator
from python_validation.traceability import traceability_validator
from python_validation.role_relevance import role_relevance_validator
from python_validation.contradiction import contradiction_validator
from python_validation.duplicate import duplicate_validator
from python_validation.version_check import version_check_validator
from python_validation.sequencing import sequencing_validator
from python_validation.assessment import assessment_validator
from python_validation.business_rules import business_rules_engine


class Pipeline2Validator:
    """
    Pipeline 2 — Python Ground-Truth Validation Engine (100% Deterministic Python).
    Strictly refrains from calling GenAI APIs.
    Performs comprehensive verification of Pipeline 1 plans against Ground-Truth RRM and Document Metadata.
    """

    @staticmethod
    def validate_plan(db: Session, plan_id: str) -> ValidationReport:
        """
        Executes full Pipeline 2 deterministic validation workflow for an OnboardingPlan.
        """
        # 1. Fetch Onboarding Plan & Role
        plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == plan_id).first()
        if not plan:
            raise ValueError(f"Onboarding plan '{plan_id}' not found.")

        role = db.query(JobRole).filter(JobRole.role_id == plan.job_role_id).first()
        if not role:
            raise ValueError(f"Job role for plan '{plan_id}' not found.")

        # 2. Retrieve Ground-Truth Matrix Requirements for Target Role
        ground_truth_matrix = matrix_manager.get_ground_truth_matrix_for_role(db, role.role_code)
        ground_truth_map = {req.requirement_id: req for req in ground_truth_matrix}
        mandatory_matrix_items = [req for req in ground_truth_matrix if req.is_mandatory]

        # 3. Retrieve Generated Plan Child Entities
        stages = db.query(OnboardingStage).filter(OnboardingStage.plan_id == plan_id).order_by(OnboardingStage.stage_order).all()
        stage_ids = [s.stage_id for s in stages]

        modules = db.query(LearningModule).filter(LearningModule.stage_id.in_(stage_ids)).all() if stage_ids else []
        module_ids = [m.module_id for m in modules]

        tasks = db.query(PracticalTask).filter(PracticalTask.module_id.in_(module_ids)).all() if module_ids else []
        quizzes = db.query(ModuleQuiz).filter(ModuleQuiz.module_id.in_(module_ids)).all() if module_ids else []
        checklists = db.query(OnboardingChecklist).filter(OnboardingChecklist.plan_id == plan_id).all()

        all_issues: List[ValidationIssueSchema] = []

        # 4. Step 2: Schema Validation (Pydantic structural check)
        json_payload = {
            "employee_id": plan.employee_id,
            "role_id": role.role_id,
            "role_name": role.title,
            "department": role.department,
            "plan_version": plan.prompt_version,
            "stages": [
                {
                    "stage": s.stage_name.value if hasattr(s.stage_name, "value") else str(s.stage_name),
                    "modules": [
                        {
                            "module_id": m.module_code,
                            "module_code": m.module_code,
                            "title": m.title,
                            "description": m.purpose,
                            "requirement_id": m.requirement_id,
                            "mandatory": m.is_mandatory,
                            "source_document_id": m.source_document_id,
                            "source_section_id": m.source_section_id
                        } for m in s.modules
                    ]
                } for s in stages
            ]
        }

        is_schema_valid, schema_errors, _ = schema_validator.validate_plan_json(json_payload)
        if not is_schema_valid:
            for s_err in schema_errors:
                all_issues.append(ValidationIssueSchema(
                    issue_type="schema_error",
                    severity="critical",
                    explanation=f"Schema Validation Error: {s_err}",
                    expected_value="Valid Pydantic JSON structure",
                    generated_value="Invalid or malformed JSON structure"
                ))

        # 5. Step 4: Mandatory Coverage Validation
        coverage_score, total_mandatory, covered_mandatory, missing_list, cov_issues = coverage_validator.evaluate_mandatory_coverage(
            mandatory_matrix_items, modules
        )
        all_issues.extend(cov_issues)

        # 6. Step 5: Source Traceability Validation
        cited_items = []
        for m in modules:
            cited_items.append({
                "source_document_id": m.source_document_id,
                "source_section_id": m.source_section_id,
                "source_document_version": getattr(m, "source_document_version", 1),
                "requirement_id": m.requirement_id,
                "item_type": "module",
                "title": m.title
            })
        for t in tasks:
            cited_items.append({
                "source_document_id": t.source_document_id,
                "source_section_id": t.source_section_id,
                "requirement_id": None,
                "item_type": "task",
                "title": t.description[:40]
            })
        for q in quizzes:
            cited_items.append({
                "source_document_id": q.source_document_id,
                "source_section_id": q.source_section_id,
                "requirement_id": None,
                "item_type": "quiz",
                "title": q.question_text[:40]
            })

        traceability_score, valid_source_count, unsupported_req_count, trace_issues = traceability_validator.evaluate_source_traceability(
            db, cited_items, ground_truth_map
        )
        all_issues.extend(trace_issues)

        # 7. Step 6: Role Relevance Validation
        relevance_score, role_issues = role_relevance_validator.evaluate_role_relevance(
            role, ground_truth_map, modules
        )
        all_issues.extend(role_issues)

        # 8. Step 7-9 & 12: Contradictions & Mismatches Validation
        contradiction_count, contra_issues = contradiction_validator.evaluate_contradictions_and_mismatches(
            ground_truth_map, modules
        )
        all_issues.extend(contra_issues)

        # 9. Step 10: Duplicate Detection
        duplicate_count, dup_issues = duplicate_validator.evaluate_duplicates(
            modules, tasks, quizzes, checklists
        )
        all_issues.extend(dup_issues)

        # 10. Step 13: Policy Version Check
        outdated_count, ver_issues = version_check_validator.evaluate_document_versions(
            db, modules
        )
        all_issues.extend(ver_issues)

        # 11. Step 16: Sequencing & Prerequisite Validation
        sequence_issue_count, seq_issues = sequencing_validator.evaluate_stage_sequencing(
            ground_truth_map, stages, modules
        )
        all_issues.extend(seq_issues)

        # 12. Step 14-15: Assessment & Quiz Validation
        missing_assessment_count, assess_issues = assessment_validator.evaluate_assessments_and_activities(
            mandatory_matrix_items, modules, tasks, quizzes, checklists
        )
        all_issues.extend(assess_issues)

        # 13. Step 17: Configurable Business Rules Layer
        rule_issues = business_rules_engine.evaluate_business_rules(
            coverage_score, traceability_score, duplicate_count, outdated_count
        )
        all_issues.extend(rule_issues)

        # 14. Step 18: Deterministic Status Calculation
        critical_count = sum(1 for i in all_issues if i.severity == "critical")
        missing_count = len(missing_list)

        if missing_count > 0:
            overall_status = VerificationStatusEnum.REQUIREMENT_MISSING
        elif unsupported_req_count > 0:
            overall_status = VerificationStatusEnum.SOURCE_SUPPORT_MISSING
        elif outdated_count > 0:
            overall_status = VerificationStatusEnum.OUTDATED_SOURCE
        elif contradiction_count > 0:
            overall_status = VerificationStatusEnum.CONTRADICTION_DETECTED
        elif (
            coverage_score == 100.0 and
            traceability_score == 100.0 and
            relevance_score == 100.0 and
            contradiction_count == 0 and
            unsupported_req_count == 0 and
            outdated_count == 0 and
            duplicate_count == 0 and
            critical_count == 0
        ):
            overall_status = VerificationStatusEnum.VERIFIED
        elif coverage_score >= 90.0 and traceability_score >= 90.0:
            overall_status = VerificationStatusEnum.VERIFIED_WITH_WARNING
        elif coverage_score >= 70.0:
            overall_status = VerificationStatusEnum.PARTIALLY_VERIFIED
        else:
            overall_status = VerificationStatusEnum.MANUAL_REVIEW_REQUIRED

        # 15. Step 20: GenAI / Python Comparison Breakdown
        module_req_map = {m.requirement_id: m for m in modules if m.requirement_id}
        comparison_details_to_create = []

        for req_id, ground_req in ground_truth_map.items():
            gen_mod = module_req_map.get(req_id)
            if not gen_mod:
                match_res = MatchResultEnum.MISSING
                val_status = VerificationStatusEnum.REQUIREMENT_MISSING if ground_req.is_mandatory else VerificationStatusEnum.PARTIALLY_VERIFIED
                explanation = f"Ground-truth requirement '{req_id}' is missing from generated plan."
            else:
                doc_match = (gen_mod.source_document_id == ground_req.source_document_id)
                sec_match = (gen_mod.source_section_id == ground_req.source_section_id)

                if doc_match and sec_match:
                    match_res = MatchResultEnum.MATCH
                    val_status = VerificationStatusEnum.VERIFIED
                    explanation = f"Exact match with ground-truth matrix for requirement '{req_id}'."
                else:
                    match_res = MatchResultEnum.MISMATCH
                    val_status = VerificationStatusEnum.PARTIALLY_VERIFIED
                    explanation = f"Cited source ({gen_mod.source_document_id}, {gen_mod.source_section_id}) differs from expected RRM ground truth ({ground_req.source_document_id}, {ground_req.source_section_id})."

            comparison_details_to_create.append(
                RequirementComparisonDetail(
                    requirement_id=req_id,
                    job_role_code=role.role_code,
                    python_expected_source_doc=ground_req.source_document_id,
                    python_expected_source_sec=ground_req.source_section_id,
                    python_expected_mandatory=ground_req.is_mandatory,
                    genai_output_source_doc=gen_mod.source_document_id if gen_mod else None,
                    genai_output_source_sec=gen_mod.source_section_id if gen_mod else None,
                    genai_output_mandatory=gen_mod.is_mandatory if gen_mod else None,
                    match_result=match_res,
                    validation_status=val_status,
                    disagreement_explanation=explanation
                )
            )

        # 16. Step 21: Save ValidationReport & Discrepancy Records to Database
        consistency_score = max(
            0.0,
            min(100.0, round(100.0 - (contradiction_count * 10.0 + duplicate_count * 5.0 + len(all_issues) * 2.0), 2))
        )

        report = ValidationReport(
            plan_id=plan_id,
            verification_status=overall_status,
            mandatory_coverage_score=coverage_score,
            source_traceability_score=traceability_score,
            consistency_score=consistency_score,
            total_mandatory_requirements=total_mandatory,
            covered_mandatory_requirements=covered_mandatory,
            missing_requirements_count=missing_count,
            unsupported_requirements_count=unsupported_req_count,
            contradiction_count=contradiction_count,
            duplicate_count=duplicate_count,
            evaluated_at=datetime.utcnow()
        )
        db.add(report)
        db.flush()

        # Save issues
        for iss in all_issues:
            v_issue = ValidationIssue(
                report_id=report.report_id,
                requirement_id=iss.requirement_id,
                issue_type=iss.issue_type,
                severity=iss.severity,
                explanation=iss.explanation,
                source_info=iss.source_info,
                expected_value=iss.expected_value,
                generated_value=iss.generated_value
            )
            db.add(v_issue)

        # Save comparison details
        for cd in comparison_details_to_create:
            cd.report_id = report.report_id
            db.add(cd)

        # Update OnboardingPlan record scores & status
        plan.verification_status = overall_status
        plan.coverage_score = coverage_score
        plan.traceability_score = traceability_score
        plan.consistency_score = consistency_score

        # Step 24: Human Review Handoff if non-VERIFIED or has discrepancies
        if overall_status != VerificationStatusEnum.VERIFIED:
            review_reason = (
                f"Automatic handoff to review queue for status '{overall_status.value}': "
                f"Coverage={coverage_score}%, Traceability={traceability_score}%, "
                f"Missing={missing_count}, Unsupported={unsupported_req_count}, "
                f"Contradictions={contradiction_count}, Issues={len(all_issues)}."
            )
            queue_item = ManualReviewQueue(
                report_id=report.report_id,
                plan_id=plan_id,
                status="pending",
                reason_for_review=review_reason
            )
            db.add(queue_item)

        db.commit()
        db.refresh(report)
        db.refresh(plan)

        return report

pipeline2_validator = Pipeline2Validator()
