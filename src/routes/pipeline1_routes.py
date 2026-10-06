from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import OnboardingPlan, GenAIExecutionLog, LearningModule, CompanyDocument, EmployeeProfile, JobRole
from genai_pipeline.pipeline1_engine import pipeline1_engine
from schemas.pipeline1_schemas import Pipeline1GenerationRequest

router = APIRouter(prefix="/pipeline1", tags=["Pipeline 1: GenAI Generation Pipeline"])

def _verify_admin_access(x_user_role: Optional[str] = Header(None, alias="X-User-Role")):
    """Requirement 16: Security RBAC — Only authorized roles can trigger Pipeline 1 plan generation."""
    if x_user_role and x_user_role.lower() == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. Employees cannot trigger Pipeline 1 onboarding plan generation."
        )

@router.post("/generate", status_code=status.HTTP_201_CREATED)
def generate_onboarding_plan(
    req: Pipeline1GenerationRequest,
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """
    Executes Pipeline 1 GenAI Generation Pipeline (Specification Step 12).
    Generates structured multi-stage onboarding plan, modules, tasks, quizzes, rubrics, and citations.
    """
    try:
        r_id = req.role_id or req.role_identifier
        plan_record, json_output = pipeline1_engine.generate_plan_for_employee(
            db=db,
            employee_id=req.employee_id,
            role_identifier=r_id,
            model_name=req.model_name or "gemini-2.5-flash",
            prompt_version=req.prompt_version or "v1.0.0"
        )
        return {
            "message": "Pipeline 1 onboarding plan generated successfully.",
            "plan_id": plan_record.plan_id,
            "employee_id": plan_record.employee_id,
            "role_id": plan_record.job_role_id,
            "genai_model": plan_record.genai_model,
            "prompt_version": plan_record.prompt_version,
            "verification_status": plan_record.verification_status.value,
            "execution_id": plan_record.execution_id,
            "structured_json_output": json_output
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Pipeline 1 generation error: {str(e)}")

@router.get("/plan/{plan_id}")
def get_onboarding_plan_details(plan_id: str, db: Session = Depends(get_db)):
    """Retrieve full plan details including stages, modules, tasks, and quizzes."""
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Plan '{plan_id}' not found.")

    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == plan.employee_id).first()
    role = db.query(JobRole).filter(JobRole.role_id == plan.job_role_id).first()

    stages_data = []
    for stg in plan.stages:
        mods_data = []
        for mod in stg.modules:
            mods_data.append({
                "module_id": mod.module_id,
                "module_code": mod.module_code,
                "title": mod.title,
                "purpose": mod.purpose,
                "requirement_id": mod.requirement_id,
                "is_mandatory": mod.is_mandatory,
                "source_document_id": mod.source_document_id,
                "source_section_id": mod.source_section_id,
                "difficulty": mod.difficulty.value if hasattr(mod.difficulty, "value") else str(mod.difficulty),
                "objectives": mod.learning_objectives or [],
                "tasks": [
                    {
                        "task_id": t.task_code,
                        "description": t.description,
                        "expected_outcome": t.expected_outcome,
                        "source_document_id": t.source_document_id,
                        "source_section_id": t.source_section_id
                    } for t in mod.tasks
                ],
                "quizzes": [
                    {
                        "question_id": q.question_code,
                        "question_text": q.question_text,
                        "correct_answer": q.correct_answer,
                        "explanation": q.explanation,
                        "source_document_id": q.source_document_id,
                        "source_section_id": q.source_section_id
                    } for q in mod.quizzes
                ]
            })
        stages_data.append({
            "stage_id": stg.stage_id,
            "stage_name": stg.stage_name.value if hasattr(stg.stage_name, "value") else str(stg.stage_name),
            "stage_order": stg.stage_order,
            "modules": mods_data
        })

    return {
        "plan_id": plan.plan_id,
        "employee_id": plan.employee_id,
        "employee_name": emp.user.full_name if emp and emp.user else "Employee",
        "job_role_id": plan.job_role_id,
        "role_code": role.role_code if role else "N/A",
        "role_title": role.title if role else "N/A",
        "prompt_version": plan.prompt_version,
        "genai_model": plan.genai_model,
        "verification_status": plan.verification_status.value,
        "created_at": plan.created_at,
        "stages": stages_data
    }

@router.get("/plan/{plan_id}/json")
def get_onboarding_plan_raw_json(plan_id: str, db: Session = Depends(get_db)):
    """Developer/Admin view for raw structured JSON output (Requirement 13)."""
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Plan '{plan_id}' not found.")

    log = db.query(GenAIExecutionLog).filter(GenAIExecutionLog.execution_id == plan.execution_id).first()
    if log and log.parsed_json_output:
        return log.parsed_json_output

    # Fallback to reconstructing JSON from plan details if execution log missing
    plan_details = get_onboarding_plan_details(plan_id, db)
    return plan_details

@router.get("/plan/{plan_id}/sources")
def get_onboarding_plan_sources(plan_id: str, db: Session = Depends(get_db)):
    """Developer/Admin view for source document citations used in plan (Requirement 13)."""
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Plan '{plan_id}' not found.")

    sources = []
    for stg in plan.stages:
        for mod in stg.modules:
            doc = db.query(CompanyDocument).filter(CompanyDocument.document_id == mod.source_document_id).first()
            sources.append({
                "module_code": mod.module_code,
                "module_title": mod.title,
                "requirement_id": mod.requirement_id,
                "source_document_id": mod.source_document_id,
                "source_document_title": doc.title if doc else "N/A",
                "source_document_version": doc.version if doc else 1,
                "source_section_id": mod.source_section_id,
                "is_mandatory": mod.is_mandatory
            })

    return {
        "plan_id": plan_id,
        "total_sources_cited": len(sources),
        "source_citations": sources
    }

@router.get("/runs/{execution_id}")
def get_generation_execution_run(execution_id: str, db: Session = Depends(get_db)):
    """Retrieve generation run metadata for debugging & competition demo (Requirement 10 & 13)."""
    log = db.query(GenAIExecutionLog).filter(GenAIExecutionLog.execution_id == execution_id).first()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Execution run '{execution_id}' not found.")

    return {
        "execution_id": log.execution_id,
        "employee_id": log.employee_id,
        "model_name": log.model_name,
        "prompt_version": log.prompt_version,
        "schema_validation_passed": log.schema_validation_passed,
        "retry_count": log.retry_count,
        "latency_ms": log.latency_ms,
        "executed_at": log.executed_at,
        "error_log": log.error_log,
        "parsed_json_output": log.parsed_json_output
    }
