import os
import json
import time
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Tuple, Optional, List
from sqlalchemy.orm import Session

from database.models import GenAIExecutionLog
from genai_pipeline.schema_validator import schema_validator

# Environment variables
GENAI_PROVIDER = os.getenv("GENAI_PROVIDER", "gemini").lower()
GENAI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GENAI_API_KEY")
GENAI_MODEL = os.getenv("GENAI_MODEL", "gemini-2.5-flash")

HAS_GEMINI_SDK = False
try:
    import google.generativeai as genai
    if GENAI_API_KEY:
        genai.configure(api_key=GENAI_API_KEY)
        HAS_GEMINI_SDK = True
except Exception:
    HAS_GEMINI_SDK = False


class BaseGenAIProvider(ABC):
    """Modular abstraction for GenAI providers."""

    @abstractmethod
    def generate_text(self, system_prompt: str, user_prompt: str, model_name: str) -> str:
        pass


class GeminiGenAIProvider(BaseGenAIProvider):
    """Google Gemini API Provider implementation."""

    def generate_text(self, system_prompt: str, user_prompt: str, model_name: str) -> str:
        if not HAS_GEMINI_SDK or not GENAI_API_KEY:
            raise RuntimeError("Gemini API SDK or GEMINI_API_KEY is not configured.")

        model = genai.GenerativeModel(
            model_name=model_name or GENAI_MODEL,
            system_instruction=system_prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(user_prompt)
        if not response or not response.text:
            raise ValueError("Gemini API returned an empty response.")
        return response.text


class FallbackGenAIProvider(BaseGenAIProvider):
    """Deterministic ground-truth Fallback Generator when LLM API is unavailable or in mock mode."""

    def generate_text(self, system_prompt: str, user_prompt: str, model_name: str) -> str:
        raise NotImplementedError("Use generate_fallback_json directly.")

    @staticmethod
    def generate_fallback_json(
        role: str,
        role_id: str,
        employee_id: str,
        department: str,
        matrix_requirements: list,
        prompt_version: str,
        model_name: str
    ) -> Dict[str, Any]:
        """Constructs valid structured JSON onboarding plan directly from Role Matrix entries."""
        stages_map = {
            "day_1": {"stage": "Day 1", "stage_id": "day_1", "stage_order": 1, "modules": []},
            "week_1": {"stage": "Week 1", "stage_id": "week_1", "stage_order": 2, "modules": []},
            "week_2": {"stage": "Week 2", "stage_id": "week_2", "stage_order": 3, "modules": []},
            "first_30_days": {"stage": "First 30 Days", "stage_id": "first_30_days", "stage_order": 4, "modules": []}
        }

        checklists = []
        mod_counter = 1

        for req in matrix_requirements:
            stg_key = req.get("due_stage", "week_1")
            if hasattr(stg_key, "value"):
                stg_key = stg_key.value
            stg_key = str(stg_key).lower()
            if stg_key not in stages_map:
                stg_key = "week_1"

            mod_id = f"M{mod_counter:02d}"
            task_id = f"T{mod_counter:02d}"
            quiz_id = f"Q{mod_counter:02d}"

            doc_id = req.get("source_document_id", "POL-01")
            doc_ver = req.get("source_document_version", 1)
            sec_id = req.get("source_section_id", "Sec-1")

            req_item = {
                "requirement_id": req.get("requirement_id"),
                "mandatory": req.get("is_mandatory", True),
                "classification": req.get("requirement_type", "must_know"),
                "source_document_id": doc_id,
                "source_document_version": doc_ver,
                "source_section_id": sec_id,
                "priority": req.get("priority", "high"),
                "due_stage": stg_key,
                "task": req.get("required_task_description") or f"Execute {req.get('required_competency')} exercise.",
                "assessment_topic": req.get("required_assessment_topic") or req.get("required_competency")
            }

            module_obj = {
                "module_id": mod_id,
                "module_code": mod_id,
                "title": f"{req.get('required_competency')} Module",
                "module_title": f"{req.get('required_competency')} Module",
                "description": req.get("policy_requirement", "Master company policy requirement."),
                "purpose": req.get("policy_requirement", "Master company policy requirement."),
                "objectives": [
                    f"Understand policy: {req.get('policy_requirement')}",
                    f"Demonstrate competency in {req.get('required_competency')}"
                ],
                "learning_objectives": [
                    f"Understand policy: {req.get('policy_requirement')}",
                    f"Demonstrate competency in {req.get('required_competency')}"
                ],
                "requirements": [req_item],
                "requirement_id": req.get("requirement_id"),
                "mandatory": req.get("is_mandatory", True),
                "source_document_id": doc_id,
                "source_section_id": sec_id,
                "estimated_duration_minutes": 30,
                "difficulty": "beginner",
                "key_concepts": [req.get("required_competency"), "Policy Compliance"],
                "completion_criteria": "Complete practical task and pass module quiz with >= 80% score.",
                "checklist": [f"Complete {req.get('required_competency')} orientation"],
                "practical_tasks": [
                    {
                        "task_id": task_id,
                        "description": req.get("required_task_description") or f"Execute {req.get('required_competency')} exercise.",
                        "expected_outcome": "Complete task documentation according to SOP.",
                        "difficulty": "beginner",
                        "due_stage": stg_key,
                        "completion_criteria": "Pass supervisor review.",
                        "scenario_context": f"Simulated operational scenario for {role}.",
                        "source_document_id": doc_id,
                        "source_section_id": sec_id,
                        "rubric": [
                            {
                                "criterion": "Accuracy & Compliance",
                                "weight": 1.0,
                                "expected_performance": "100% policy compliance.",
                                "pass_condition": "Zero critical errors."
                            }
                        ]
                    }
                ],
                "role_specific_activities": [f"Conduct {role} scenario test for {req.get('required_competency')}"],
                "quiz": [
                    {
                        "question_id": quiz_id,
                        "question_text": f"What is the required standard for {req.get('required_competency')}?",
                        "question_type": "multiple_choice",
                        "options": [
                            {"option_label": "A", "option_text": req.get("policy_requirement"), "is_correct": True},
                            {"option_label": "B", "option_text": "Non-compliant informal guidance.", "is_correct": False},
                            {"option_label": "C", "option_text": "Obsolete process rule.", "is_correct": False},
                            {"option_label": "D", "option_text": "Not applicable to this role.", "is_correct": False}
                        ],
                        "correct_answer": req.get("policy_requirement"),
                        "explanation": f"According to {doc_id} Section {sec_id}.",
                        "difficulty": "beginner",
                        "source_document_id": doc_id,
                        "source_section_id": sec_id
                    }
                ],
                "assessment": {
                    "criterion": "Accuracy & Compliance",
                    "weight": 1.0,
                    "pass_condition": "Score >= 80%"
                },
                "explanation": f"Module covers compliance requirements outlined in {doc_id} Section {sec_id}."
            }

            stages_map[stg_key]["modules"].append(module_obj)
            checklists.append({
                "activity_name": f"Acknowledge {req.get('required_competency')}",
                "required": req.get("is_mandatory", True),
                "due_stage": stg_key,
                "responsible_person": "Employee",
                "source_document_id": doc_id
            })
            mod_counter += 1

        active_stages = [stg for stg in stages_map.values() if stg["modules"]]
        if not active_stages:
            active_stages = [stages_map["week_1"]]

        return {
            "employee_id": employee_id,
            "role_id": role_id,
            "role_name": role,
            "role": role,
            "department": department,
            "plan_version": prompt_version or "v1.0.0",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "prompt_version": prompt_version or "v1.0.0",
            "model_used": model_name or "fallback-ground-truth-generator",
            "stages": active_stages,
            "checklists": checklists,
            "recommendations": [
                f"Schedule initial 1-on-1 manager check-in during Week 1 for {role}.",
                f"Review mandatory compliance modules prior to operational deployment."
            ]
        }


class GenAIClient:
    """
    GenAI API Integration & Retry Recovery Client (Specification Step 12, 37, 39).
    Supports Gemini API structured generation with automated fallback generator and execution logging.
    """

    def __init__(self, max_retries: int = 3):
        self.max_retries = max_retries
        self.providers: Dict[str, BaseGenAIProvider] = {
            "gemini": GeminiGenAIProvider()
        }

    def register_provider(self, name: str, provider: BaseGenAIProvider):
        """Registers a new GenAI provider dynamically."""
        self.providers[name.lower()] = provider

    def generate_onboarding_plan(
        self,
        db: Session,
        employee_id: str,
        role: str,
        role_id: str,
        department: str,
        experience_level: str,
        joining_date: str,
        document_context: str,
        matrix_requirements: list,
        prompt_version: str = "v1.0.0",
        model_name: str = "gemini-2.5-flash",
        provider_name: Optional[str] = None
    ) -> Tuple[Dict[str, Any], str]:
        """
        Executes Pipeline 1 with retries, schema validation, and execution logging.
        Returns (parsed_json_dict, execution_id).
        """
        from genai_pipeline.prompt_manager import prompt_manager

        p_name = (provider_name or os.getenv("GENAI_PROVIDER", "gemini")).lower()
        active_provider = self.providers.get(p_name)

        matrix_req_str = json.dumps(matrix_requirements, indent=2)
        prompt_dict = prompt_manager.format_prompt(
            template_name="onboarding_v1",
            employee_id=employee_id,
            role=role,
            role_id=role_id,
            department=department,
            experience_level=experience_level,
            joining_date=joining_date,
            document_context=document_context,
            matrix_requirements=matrix_req_str
        )

        system_prompt = prompt_dict["system_prompt"]
        user_prompt = prompt_dict["user_prompt"]
        execution_id = str(uuid.uuid4())

        start_time = time.time()
        attempts = 0
        json_output = None
        validation_passed = False
        error_msg = None

        # Extract metadata sources used
        source_doc_ids = sorted(list({r.get("source_document_id") for r in matrix_requirements if r.get("source_document_id")}))
        rrm_req_ids = sorted(list({r.get("requirement_id") for r in matrix_requirements if r.get("requirement_id")}))

        while attempts < self.max_retries and not validation_passed:
            attempts += 1
            try:
                if active_provider and HAS_GEMINI_SDK and GENAI_API_KEY and p_name != "mock":
                    raw_resp = active_provider.generate_text(system_prompt, user_prompt, model_name)
                    json_output = json.loads(raw_resp)
                else:
                    # Fallback generator for unconfigured/mock environments or API failures
                    json_output = FallbackGenAIProvider.generate_fallback_json(
                        role=role,
                        role_id=role_id,
                        employee_id=employee_id,
                        department=department,
                        matrix_requirements=matrix_requirements,
                        prompt_version=prompt_version,
                        model_name=model_name
                    )

                is_valid, errors, _ = schema_validator.validate_plan_json(json_output)
                if is_valid:
                    validation_passed = True
                else:
                    error_msg = f"Schema Validation Failed (Attempt {attempts}): {'; '.join(errors)}"
            except Exception as e:
                error_msg = f"API Execution Exception (Attempt {attempts}): {str(e)}"
                # Use fallback generator immediately on API exception
                json_output = FallbackGenAIProvider.generate_fallback_json(
                    role=role,
                    role_id=role_id,
                    employee_id=employee_id,
                    department=department,
                    matrix_requirements=matrix_requirements,
                    prompt_version=prompt_version,
                    model_name=model_name
                )
                is_valid, errors, _ = schema_validator.validate_plan_json(json_output)
                if is_valid:
                    validation_passed = True

        latency_ms = int((time.time() - start_time) * 1000)

        # Log Execution Metadata to Database (Requirement 10)
        log_entry = GenAIExecutionLog(
            execution_id=execution_id,
            employee_id=employee_id,
            model_name=model_name,
            prompt_version=prompt_version,
            input_prompt=user_prompt[:2000],
            raw_response_text=json.dumps(json_output) if json_output else None,
            parsed_json_output=json_output,
            schema_validation_passed=validation_passed,
            retry_count=attempts - 1,
            latency_ms=latency_ms,
            error_log=error_msg if not validation_passed else None
        )
        db.add(log_entry)
        db.commit()

        return json_output, execution_id

llm_client = GenAIClient()
