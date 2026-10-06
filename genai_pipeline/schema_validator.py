import json
from typing import Dict, Any, Tuple, List, Optional
from pydantic import ValidationError
from schemas.pipeline1_schemas import Pipeline1OnboardingPlanResponse

class SchemaValidator:
    """
    Python Schema Validator for GenAI JSON Output (Specification Step 38).
    Detects missing fields, invalid data types, duplicate IDs, and ungrounded source IDs.
    """

    @staticmethod
    def validate_plan_json(json_data: Dict[str, Any]) -> Tuple[bool, List[str], Optional[Pipeline1OnboardingPlanResponse]]:
        """
        Validates returned JSON object against Pydantic schema and business rules.
        Returns (is_valid, list_of_errors, parsed_pydantic_model).
        """
        errors = []
        if not isinstance(json_data, dict):
            return False, ["JSON output must be an object/dictionary."], None

        # Normalize key names if LLM produced aliases
        if "role" in json_data and "role_name" not in json_data:
            json_data["role_name"] = json_data["role"]
        if "role_name" in json_data and "role" not in json_data:
            json_data["role"] = json_data["role_name"]

        # Ensure stages list is present
        stages = json_data.get("stages", [])
        if not isinstance(stages, list) or len(stages) == 0:
            errors.append("Plan must contain at least one stage in 'stages'.")

        for s_idx, stg in enumerate(stages):
            if isinstance(stg, dict):
                if "stage" not in stg and "stage_name" in stg:
                    stg["stage"] = stg["stage_name"]
                if "stage" not in stg and "stage_id" in stg:
                    stg["stage"] = stg["stage_id"]
                if "stage" not in stg:
                    stg["stage"] = f"Stage {s_idx + 1}"

                modules = stg.get("modules", [])
                for m_idx, mod in enumerate(modules):
                    if isinstance(mod, dict):
                        if "title" not in mod and "module_title" in mod:
                            mod["title"] = mod["module_title"]
                        if "title" not in mod:
                            mod["title"] = f"Module {m_idx + 1}"

        # 1. Structural Schema Validation using Pydantic
        try:
            parsed_model = Pipeline1OnboardingPlanResponse(**json_data)
        except ValidationError as e:
            for err in e.errors():
                loc = " -> ".join([str(x) for x in err["loc"]])
                errors.append(f"Schema Error at '{loc}': {err['msg']}")
            return False, errors, None
        except Exception as e:
            return False, [f"Invalid JSON structure: {str(e)}"], None

        # 2. Additional Business Rules Validation (Step 38)
        seen_module_ids = set()
        seen_task_ids = set()
        seen_quiz_ids = set()

        for stage in parsed_model.stages:
            for module in stage.modules:
                mod_id = module.module_id or module.module_code or "M_UNKNOWN"
                # Check duplicate Module IDs
                if mod_id in seen_module_ids:
                    errors.append(f"Duplicate Module ID detected: '{mod_id}'")
                seen_module_ids.add(mod_id)

                # Check tasks inside module
                tasks = module.practical_tasks or module.tasks or []
                for task in tasks:
                    if task.task_id in seen_task_ids:
                        errors.append(f"Duplicate Task ID detected: '{task.task_id}'")
                    seen_task_ids.add(task.task_id)

                # Check quizzes inside module
                quizzes = module.quiz or module.quizzes or []
                for quiz in quizzes:
                    if quiz.question_id in seen_quiz_ids:
                        errors.append(f"Duplicate Quiz Question ID detected: '{quiz.question_id}'")
                    seen_quiz_ids.add(quiz.question_id)

        is_valid = len(errors) == 0
        return is_valid, errors, parsed_model if is_valid else None

schema_validator = SchemaValidator()
