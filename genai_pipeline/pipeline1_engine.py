from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session

from database.models import (
    EmployeeProfile, JobRole, RoleRequirementMatrix, DocumentChunk, CompanyDocument,
    OnboardingPlan, OnboardingStage, LearningModule, PracticalTask, ModuleQuiz,
    QuizOption, OnboardingChecklist, VerificationStatusEnum, OnboardingStageEnum, DifficultyLevelEnum, QuizQuestionTypeEnum
)
from role_matrix.matrix_manager import matrix_manager
from security.prompt_injection import detector
from genai_pipeline.llm_client import llm_client
from genai_pipeline.schema_validator import schema_validator

class Pipeline1Engine:
    """Orchestrates Pipeline 1 GenAI Structured Onboarding Plan Generation."""

    @staticmethod
    def generate_plan_for_employee(
        db: Session,
        employee_id: str,
        role_identifier: str = None,
        model_name: str = "gemini-2.5-flash",
        prompt_version: str = "v1.0.0"
    ) -> Tuple[OnboardingPlan, Dict[str, Any]]:
        """
        Main entry point for Pipeline 1 generation (Specification Step 12).
        Returns (OnboardingPlan_ORM_object, parsed_json_output).
        """
        # 1. Fetch Employee Profile
        profile = db.query(EmployeeProfile).filter(
            (EmployeeProfile.employee_id == employee_id) | (EmployeeProfile.employee_code == employee_id)
        ).first()
        if not profile:
            raise ValueError(f"Employee profile '{employee_id}' not found.")

        # 2. Fetch Job Role
        target_role_id = role_identifier or profile.job_role_id
        role = db.query(JobRole).filter(
            (JobRole.role_id == target_role_id) | (JobRole.role_code == target_role_id)
        ).first()
        if not role:
            role = db.query(JobRole).filter(JobRole.role_id == profile.job_role_id).first()
        if not role:
            raise ValueError(f"Job role '{target_role_id}' not found for employee '{employee_id}'.")

        # 3. Fetch Ground-Truth Role Requirement Matrix Entries
        matrix_items = matrix_manager.get_ground_truth_matrix_for_role(db, role.role_code)
        matrix_reqs = []
        source_doc_ids = set()

        for req in matrix_items:
            matrix_reqs.append({
                "requirement_id": req.requirement_id,
                "title": req.title,
                "description": req.description,
                "policy_requirement": req.policy_requirement,
                "process_requirement": req.process_requirement,
                "required_competency": req.required_competency,
                "is_mandatory": req.is_mandatory,
                "requirement_type": req.requirement_type.value if hasattr(req.requirement_type, "value") else str(req.requirement_type),
                "priority": req.priority.value if hasattr(req.priority, "value") else str(req.priority),
                "due_stage": req.due_stage.value if hasattr(req.due_stage, "value") else str(req.due_stage),
                "source_document_id": req.source_document_id,
                "source_document_version": req.source_document_version,
                "source_section_id": req.source_section_id,
                "source_location": req.source_location,
                "required_task_description": req.required_task_description,
                "required_assessment_topic": req.required_assessment_topic
            })
            source_doc_ids.add(req.source_document_id)

        # 4. Retrieve Document Chunks & Apply Prompt Injection Sanitization (Requirement 11)
        chunks = db.query(DocumentChunk).filter(
            DocumentChunk.document_id.in_(list(source_doc_ids))
        ).all() if source_doc_ids else []

        raw_context_blocks = []
        for c in chunks:
            safe_text = detector.sanitize_for_prompt(c.chunk_text)
            raw_context_blocks.append(
                f"Document: {c.document_id} (v{c.document_version}) | Section: {c.section_id} ({c.heading or 'General'})\n{safe_text}"
            )

        document_context_str = "\n\n".join(raw_context_blocks) if raw_context_blocks else "No active source document chunks available."

        # 5. Invoke LLM Client for Structured JSON Generation
        joining_str = str(profile.joining_date) if profile.joining_date else "N/A"
        exp_str = profile.experience_level.value if hasattr(profile.experience_level, "value") else str(profile.experience_level)

        json_output, execution_id = llm_client.generate_onboarding_plan(
            db=db,
            employee_id=profile.employee_id,
            role=role.title,
            role_id=role.role_id,
            department=profile.department or role.department,
            experience_level=exp_str,
            joining_date=joining_str,
            document_context=document_context_str,
            matrix_requirements=matrix_reqs,
            prompt_version=prompt_version,
            model_name=model_name
        )

        # 6. Save Generated Plan & Child Entities to Database
        # Set existing plans for this employee to non-active
        db.query(OnboardingPlan).filter(
            OnboardingPlan.employee_id == profile.employee_id
        ).update({"is_current_active": False})

        # Requirement 15: Pipeline 1 MUST NOT mark itself as Verified!
        # Always set verification_status to MANUAL_REVIEW_REQUIRED / PENDING_VERIFICATION
        plan_record = OnboardingPlan(
            employee_id=profile.employee_id,
            job_role_id=role.role_id,
            execution_id=execution_id,
            prompt_version=prompt_version,
            genai_model=model_name,
            verification_status=VerificationStatusEnum.MANUAL_REVIEW_REQUIRED,
            coverage_score=0.00,       # Will be evaluated by Pipeline 2
            traceability_score=0.00,   # Will be evaluated by Pipeline 2
            consistency_score=0.00,    # Will be evaluated by Pipeline 2
            is_current_active=True
        )
        db.add(plan_record)
        db.flush()

        # Save Stages & Modules
        stages = json_output.get("stages", [])
        for order, stg in enumerate(stages, start=1):
            stg_name = stg.get("stage_id", stg.get("stage", "week_1"))
            stg_str = str(stg_name).lower().replace(" ", "_")
            try:
                stg_enum = OnboardingStageEnum(stg_str)
            except ValueError:
                stg_enum = OnboardingStageEnum.WEEK_1

            stage_rec = OnboardingStage(
                plan_id=plan_record.plan_id,
                stage_name=stg_enum,
                stage_order=order
            )
            db.add(stage_rec)
            db.flush()

            modules = stg.get("modules", [])
            for mod in modules:
                diff_str = str(mod.get("difficulty", "beginner")).lower()
                try:
                    diff_enum = DifficultyLevelEnum(diff_str)
                except ValueError:
                    diff_enum = DifficultyLevelEnum.BEGINNER

                # Requirements list inside module or requirement_id
                reqs = mod.get("requirements", [])
                primary_req_id = mod.get("requirement_id")
                primary_doc_id = mod.get("source_document_id")
                primary_sec_id = mod.get("source_section_id")
                primary_doc_ver = mod.get("source_document_version")

                if reqs and isinstance(reqs, list) and len(reqs) > 0:
                    r0 = reqs[0]
                    if isinstance(r0, dict):
                        primary_req_id = primary_req_id or r0.get("requirement_id")
                        primary_doc_id = primary_doc_id or r0.get("source_document_id")
                        primary_sec_id = primary_sec_id or r0.get("source_section_id")
                        primary_doc_ver = primary_doc_ver or r0.get("source_document_version")

                # Fallback to first matrix requirement if missing
                if not primary_req_id and matrix_items:
                    primary_req_id = matrix_items[0].requirement_id
                if not primary_doc_id and matrix_items:
                    primary_doc_id = matrix_items[0].source_document_id
                if not primary_sec_id and matrix_items:
                    primary_sec_id = matrix_items[0].source_section_id
                if primary_doc_ver is None and matrix_items:
                    primary_doc_ver = matrix_items[0].source_document_version

                module_rec = LearningModule(
                    stage_id=stage_rec.stage_id,
                    module_code=mod.get("module_code", mod.get("module_id", f"M{order:02d}")),
                    title=mod.get("title", mod.get("module_title", "Learning Module")),
                    purpose=mod.get("description", mod.get("purpose", "Module purpose")),
                    requirement_id=primary_req_id,
                    is_mandatory=mod.get("mandatory", True),
                    source_document_id=primary_doc_id or "POL-01",
                    source_section_id=primary_sec_id or "Sec-1",
                    estimated_duration_minutes=mod.get("estimated_duration_minutes", 30),
                    difficulty=diff_enum,
                    learning_objectives=mod.get("objectives", mod.get("learning_objectives", [])),
                    key_concepts=mod.get("key_concepts", []),
                    completion_criteria=mod.get("completion_criteria", "Pass quiz.")
                )
                if primary_doc_ver is not None:
                    module_rec.source_document_version = primary_doc_ver
                db.add(module_rec)
                db.flush()

                # Save Practical Tasks
                tasks = mod.get("practical_tasks", mod.get("tasks", []))
                for t in tasks:
                    task_rec = PracticalTask(
                        module_id=module_rec.module_id,
                        task_code=t.get("task_id", "T01"),
                        description=t.get("description", "Practical task"),
                        expected_outcome=t.get("expected_outcome", "Task outcome"),
                        difficulty=diff_enum,
                        due_stage=stg_enum,
                        completion_criteria=t.get("completion_criteria", "Pass review."),
                        scenario_context=t.get("scenario_context"),
                        source_document_id=t.get("source_document_id", primary_doc_id or "POL-01"),
                        source_section_id=t.get("source_section_id", primary_sec_id or "Sec-1")
                    )
                    db.add(task_rec)

                # Save Quizzes
                quizzes = mod.get("quiz", mod.get("quizzes", []))
                for q in quizzes:
                    quiz_rec = ModuleQuiz(
                        module_id=module_rec.module_id,
                        question_code=q.get("question_id", "Q01"),
                        question_text=q.get("question_text", "Question?"),
                        question_type=QuizQuestionTypeEnum.MULTIPLE_CHOICE,
                        correct_answer=q.get("correct_answer", "Answer"),
                        explanation=q.get("explanation", "Explanation"),
                        difficulty=diff_enum,
                        source_document_id=q.get("source_document_id", primary_doc_id or "POL-01"),
                        source_section_id=q.get("source_section_id", primary_sec_id or "Sec-1")
                    )
                    db.add(quiz_rec)
                    db.flush()

                    for opt in q.get("options", []):
                        if isinstance(opt, dict):
                            label = opt.get("option_label", "A")
                            opt_text = opt.get("option_text", "Option")
                            is_corr = opt.get("is_correct", False)
                        else:
                            label = "A"
                            opt_text = str(opt)
                            is_corr = (opt_text == q.get("correct_answer"))

                        opt_rec = QuizOption(
                            quiz_id=quiz_rec.quiz_id,
                            option_label=label,
                            option_text=opt_text,
                            is_correct=is_corr
                        )
                        db.add(opt_rec)

        # Save Checklists
        for chk in json_output.get("checklists", []):
            try:
                chk_stg = OnboardingStageEnum(chk.get("due_stage", "day_1"))
            except ValueError:
                chk_stg = OnboardingStageEnum.DAY_1

            chk_rec = OnboardingChecklist(
                plan_id=plan_record.plan_id,
                activity_name=chk.get("activity_name", "Activity"),
                is_required=chk.get("required", True),
                due_stage=chk_stg,
                responsible_person=chk.get("responsible_person", "Employee"),
                source_document_id=chk.get("source_document_id")
            )
            db.add(chk_rec)

        db.commit()
        db.refresh(plan_record)

        return plan_record, json_output

pipeline1_engine = Pipeline1Engine()
