"""
OnBoardIQ — SQLAlchemy Database Models
Maps 1:1 to PostgreSQL schema while supporting SQLite fallback for testing.
"""

import enum
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Numeric, Date, DateTime, Enum, ForeignKey, CheckConstraint, UniqueConstraint, JSON
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# Cross-dialect JSON type: PostgreSQL uses native JSONB, SQLite uses JSON
JSONType = JSON().with_variant(JSONB, "postgresql")

# =============================================================================
# ENUM DEFINITIONS
# =============================================================================

class UserRoleEnum(str, enum.Enum):
    ADMIN = "admin"
    TRAINING_MANAGER = "training_manager"
    REVIEWER = "reviewer"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class DocumentCategoryEnum(str, enum.Enum):
    COMPANY_HANDBOOK = "company_handbook"
    HR_POLICY = "hr_policy"
    LEAVE_POLICY = "leave_policy"
    INFORMATION_SECURITY_POLICY = "information_security_policy"
    WORKPLACE_CONDUCT_POLICY = "workplace_conduct_policy"
    DATA_PRIVACY_POLICY = "data_privacy_policy"
    DEPARTMENT_SOP = "department_sop"
    ROLE_DESCRIPTION = "role_description"
    PROCESS_DOCUMENT = "process_document"
    FAQ = "faq"
    COMPLIANCE_INSTRUCTION = "compliance_instruction"
    ESCALATION_PROCEDURE = "escalation_procedure"
    SAFETY_INSTRUCTION = "safety_instruction"

class DocumentStatusEnum(str, enum.Enum):
    ACTIVE = "active"
    OBSOLETE = "obsolete"
    PENDING_REVIEW = "pending_review"
    DRAFT = "draft"

class DocumentFormatEnum(str, enum.Enum):
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
    MARKDOWN = "markdown"
    CSV = "csv"

class RequirementTypeEnum(str, enum.Enum):
    MUST_KNOW = "must_know"
    MUST_COMPLETE = "must_complete"
    MUST_DEMONSTRATE = "must_demonstrate"
    MUST_ACKNOWLEDGE = "must_acknowledge"
    RECOMMENDED = "recommended"
    OPTIONAL = "optional"
    NOT_APPLICABLE = "not_applicable"

class PriorityLevelEnum(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class OnboardingStageEnum(str, enum.Enum):
    DAY_1 = "day_1"
    WEEK_1 = "week_1"
    WEEK_2 = "week_2"
    FIRST_30_DAYS = "first_30_days"
    FIRST_60_DAYS = "first_60_days"
    FIRST_90_DAYS = "first_90_days"

class DifficultyLevelEnum(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class QuizQuestionTypeEnum(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    MULTIPLE_RESPONSE = "multiple_response"
    TRUE_FALSE = "true_false"
    SCENARIO_BASED = "scenario_based"

class VerificationStatusEnum(str, enum.Enum):
    VERIFIED = "verified"
    VERIFIED_WITH_WARNING = "verified_with_warning"
    PARTIALLY_VERIFIED = "partially_verified"
    SOURCE_SUPPORT_MISSING = "source_support_missing"
    REQUIREMENT_MISSING = "requirement_missing"
    UNSUPPORTED_REQUIREMENT = "unsupported_requirement"
    OUTDATED_SOURCE = "outdated_source"
    CONTRADICTION_DETECTED = "contradiction_detected"
    MANUAL_REVIEW_REQUIRED = "manual_review_required"

class MatchResultEnum(str, enum.Enum):
    MATCH = "match"
    MISMATCH = "mismatch"
    MISSING = "missing"
    UNSUPPORTED = "unsupported"

class ProgressStatusEnum(str, enum.Enum):
    ON_TRACK = "on_track"
    REQUIRES_ATTENTION = "requires_attention"
    BEHIND_SCHEDULE = "behind_schedule"
    ASSESSMENT_REQUIRED = "assessment_required"
    COMPLETED = "completed"

class ReviewActionEnum(str, enum.Enum):
    APPROVE = "approve"
    REJECT = "reject"
    EDIT = "edit"
    REGENERATE = "regenerate"
    OVERRIDE = "override"
    COMMENT = "comment"
    MANUAL_OVERRIDE = "manual_override"

# =============================================================================
# MODEL DEFINITIONS
# =============================================================================

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(Enum(UserRoleEnum), nullable=False, default=UserRoleEnum.EMPLOYEE)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("EmployeeProfile", back_populates="user", uselist=False)

class JobRole(Base):
    __tablename__ = "job_roles"

    role_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role_code = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    required_experience_level = Column(Enum(DifficultyLevelEnum), default=DifficultyLevelEnum.BEGINNER)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    matrix_requirements = relationship("RoleRequirementMatrix", back_populates="job_role")
    employees = relationship("EmployeeProfile", back_populates="job_role")

class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    employee_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), unique=True)
    employee_code = Column(String(50), unique=True, nullable=False)
    job_role_id = Column(String(36), ForeignKey("job_roles.role_id"), nullable=False, index=True)
    department = Column(String(100), nullable=False, index=True)
    experience_level = Column(Enum(DifficultyLevelEnum), nullable=False, default=DifficultyLevelEnum.BEGINNER)
    location = Column(String(100))
    joining_date = Column(Date, nullable=False)
    reporting_manager_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="SET NULL"))
    required_competencies = Column(JSONType, default=[])
    previous_experience = Column(Text)
    training_status = Column(Enum(ProgressStatusEnum), nullable=False, default=ProgressStatusEnum.ON_TRACK)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")
    job_role = relationship("JobRole", back_populates="employees")
    onboarding_plans = relationship("OnboardingPlan", back_populates="employee")

class CompanyDocument(Base):
    __tablename__ = "company_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(DocumentCategoryEnum), nullable=False, index=True)
    department = Column(String(100))
    version = Column(Integer, nullable=False, default=1)
    effective_date = Column(Date, nullable=False)
    expiry_date = Column(Date)
    status = Column(Enum(DocumentStatusEnum), nullable=False, default=DocumentStatusEnum.ACTIVE, index=True)
    file_format = Column(Enum(DocumentFormatEnum), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    content_hash = Column(String(64), nullable=False)
    precedence_rank = Column(Integer, nullable=False, default=3)
    supersedes_document_id = Column(String(100))
    uploaded_by = Column(String(36), ForeignKey("users.user_id"))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan", primaryjoin="foreign(DocumentChunk.document_id)==CompanyDocument.document_id")
    processing_jobs = relationship("DocumentProcessingJob", back_populates="document", cascade="all, delete-orphan", primaryjoin="foreign(DocumentProcessingJob.document_id)==CompanyDocument.document_id")

    __table_args__ = (UniqueConstraint('document_id', 'version', name='unique_doc_version'),)

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    chunk_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(100), nullable=False, index=True)
    document_version = Column(Integer, nullable=False, default=1)
    section_id = Column(String(100), nullable=False)
    section_title = Column(String(255))
    heading = Column(String(255))
    page_number = Column(Integer)
    paragraph_reference = Column(String(100))
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    token_count = Column(Integer)
    contains_adversarial_flag = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    document = relationship("CompanyDocument", back_populates="chunks", primaryjoin="foreign(DocumentChunk.document_id)==CompanyDocument.document_id")

class DocumentProcessingJob(Base):
    __tablename__ = "document_processing_jobs"

    job_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(100), nullable=False, index=True)
    document_version = Column(Integer, nullable=False, default=1)
    status = Column(String(50), nullable=False, default="completed")
    error_message = Column(Text, nullable=True)
    total_chunks = Column(Integer, default=0)
    adversarial_flags_count = Column(Integer, default=0)
    processed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    document = relationship("CompanyDocument", back_populates="processing_jobs", primaryjoin="foreign(DocumentProcessingJob.document_id)==CompanyDocument.document_id")

class RoleRequirementMatrix(Base):
    __tablename__ = "role_requirement_matrix"

    requirement_id = Column(String(100), primary_key=True)
    job_role_id = Column(String(36), ForeignKey("job_roles.role_id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    department = Column(String(100), nullable=True)
    policy_requirement = Column(Text, nullable=False)
    process_requirement = Column(Text)
    required_competency = Column(String(150), nullable=False)
    is_mandatory = Column(Boolean, nullable=False, default=True)
    requirement_type = Column(Enum(RequirementTypeEnum), nullable=False, default=RequirementTypeEnum.MUST_KNOW)
    priority = Column(Enum(PriorityLevelEnum), nullable=False, default=PriorityLevelEnum.HIGH)
    due_stage = Column(Enum(OnboardingStageEnum), nullable=False, default=OnboardingStageEnum.WEEK_1)
    source_document_id = Column(String(100), nullable=False)
    source_document_version = Column(Integer, nullable=False, default=1)
    source_section_id = Column(String(100), nullable=False)
    source_location = Column(String(255), nullable=True)
    prerequisite_requirement_ids = Column(JSONType, nullable=False, default=[])
    required_task_description = Column(Text)
    required_assessment_topic = Column(String(200))
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    job_role = relationship("JobRole", back_populates="matrix_requirements")

class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    template_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_name = Column(String(100), nullable=False)
    prompt_version = Column(String(50), nullable=False)
    system_prompt = Column(Text, nullable=False)
    user_prompt_template = Column(Text, nullable=False)
    expected_json_schema = Column(JSONType, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('template_name', 'prompt_version', name='unique_name_version'),)

class OnboardingPlan(Base):
    __tablename__ = "onboarding_plans"

    plan_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    job_role_id = Column(String(36), ForeignKey("job_roles.role_id"), nullable=False)
    execution_id = Column(String(36))
    prompt_version = Column(String(50), nullable=False)
    genai_model = Column(String(100), nullable=False)
    verification_status = Column(Enum(VerificationStatusEnum), nullable=False, default=VerificationStatusEnum.MANUAL_REVIEW_REQUIRED, index=True)
    coverage_score = Column(Numeric(5, 2), default=0.00)
    traceability_score = Column(Numeric(5, 2), default=0.00)
    consistency_score = Column(Numeric(5, 2), default=0.00)
    is_current_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("EmployeeProfile", back_populates="onboarding_plans")
    stages = relationship("OnboardingStage", back_populates="plan", cascade="all, delete-orphan")
    checklists = relationship("OnboardingChecklist", back_populates="plan", cascade="all, delete-orphan")
    validation_reports = relationship("ValidationReport", back_populates="plan", cascade="all, delete-orphan")

class GenAIExecutionLog(Base):
    __tablename__ = "genai_execution_logs"

    execution_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=True)
    template_id = Column(String(36), ForeignKey("prompt_templates.template_id"), nullable=True)
    model_name = Column(String(100), nullable=False)
    prompt_version = Column(String(50), nullable=False)
    input_prompt = Column(Text, nullable=False)
    raw_response_text = Column(Text)
    parsed_json_output = Column(JSONType)
    schema_validation_passed = Column(Boolean, default=False)
    retry_count = Column(Integer, default=0)
    latency_ms = Column(Integer)
    tokens_prompt = Column(Integer)
    tokens_completion = Column(Integer)
    error_log = Column(Text)
    executed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class OnboardingStage(Base):
    __tablename__ = "onboarding_stages"

    stage_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String(36), ForeignKey("onboarding_plans.plan_id", ondelete="CASCADE"), nullable=False)
    stage_name = Column(Enum(OnboardingStageEnum), nullable=False)
    stage_order = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    plan = relationship("OnboardingPlan", back_populates="stages")
    modules = relationship("LearningModule", back_populates="stage", cascade="all, delete-orphan")

class LearningModule(Base):
    __tablename__ = "learning_modules"

    module_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    stage_id = Column(String(36), ForeignKey("onboarding_stages.stage_id", ondelete="CASCADE"), nullable=False, index=True)
    module_code = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=False)
    requirement_id = Column(String(100), ForeignKey("role_requirement_matrix.requirement_id"), index=True)
    is_mandatory = Column(Boolean, nullable=False, default=True)
    source_document_id = Column(String(100), nullable=False)
    source_section_id = Column(String(100), nullable=False)
    estimated_duration_minutes = Column(Integer, nullable=False, default=30)
    difficulty = Column(Enum(DifficultyLevelEnum), nullable=False, default=DifficultyLevelEnum.BEGINNER)
    prerequisite_module_id = Column(String(36), ForeignKey("learning_modules.module_id"))
    learning_objectives = Column(JSONType, nullable=False, default=[])
    key_concepts = Column(JSONType, nullable=False, default=[])
    completion_criteria = Column(Text, nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    stage = relationship("OnboardingStage", back_populates="modules")
    tasks = relationship("PracticalTask", back_populates="module", cascade="all, delete-orphan")
    quizzes = relationship("ModuleQuiz", back_populates="module", cascade="all, delete-orphan")
    requirement = relationship("RoleRequirementMatrix", foreign_keys=[requirement_id])

    @property
    def source_document_version(self) -> int:
        if hasattr(self, "_source_document_version") and self._source_document_version is not None:
            return self._source_document_version
        if self.requirement and self.requirement.source_document_version is not None:
            return self.requirement.source_document_version
        return 1

    @source_document_version.setter
    def source_document_version(self, value: int):
        self._source_document_version = value

class OnboardingChecklist(Base):
    __tablename__ = "onboarding_checklists"

    checklist_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String(36), ForeignKey("onboarding_plans.plan_id", ondelete="CASCADE"), nullable=False)
    activity_name = Column(String(255), nullable=False)
    is_required = Column(Boolean, nullable=False, default=True)
    due_stage = Column(Enum(OnboardingStageEnum), nullable=False)
    responsible_person = Column(String(150))
    source_document_id = Column(String(100))
    is_completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime(timezone=True))

    plan = relationship("OnboardingPlan", back_populates="checklists")

class PracticalTask(Base):
    __tablename__ = "practical_tasks"

    task_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = Column(String(36), ForeignKey("learning_modules.module_id", ondelete="CASCADE"), nullable=False, index=True)
    task_code = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    expected_outcome = Column(Text, nullable=False)
    difficulty = Column(Enum(DifficultyLevelEnum), nullable=False, default=DifficultyLevelEnum.BEGINNER)
    due_stage = Column(Enum(OnboardingStageEnum), nullable=False)
    completion_criteria = Column(Text, nullable=False)
    scenario_context = Column(Text)
    source_document_id = Column(String(100), nullable=False)
    source_section_id = Column(String(100), nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)
    reviewer_notes = Column(Text)
    completed_at = Column(DateTime(timezone=True))

    module = relationship("LearningModule", back_populates="tasks")
    rubrics = relationship("AssessmentRubric", back_populates="task", cascade="all, delete-orphan")

class ModuleQuiz(Base):
    __tablename__ = "module_quizzes"

    quiz_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = Column(String(36), ForeignKey("learning_modules.module_id", ondelete="CASCADE"), nullable=False, index=True)
    question_code = Column(String(50), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuizQuestionTypeEnum), nullable=False, default=QuizQuestionTypeEnum.MULTIPLE_CHOICE)
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    difficulty = Column(Enum(DifficultyLevelEnum), nullable=False, default=DifficultyLevelEnum.BEGINNER)
    source_document_id = Column(String(100), nullable=False)
    source_section_id = Column(String(100), nullable=False)
    distractor_validation_passed = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    module = relationship("LearningModule", back_populates="quizzes")
    options = relationship("QuizOption", back_populates="quiz", cascade="all, delete-orphan")

class QuizOption(Base):
    __tablename__ = "quiz_options"

    option_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String(36), ForeignKey("module_quizzes.quiz_id", ondelete="CASCADE"), nullable=False)
    option_label = Column(String(10), nullable=False)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)

    quiz = relationship("ModuleQuiz", back_populates="options")

class AssessmentRubric(Base):
    __tablename__ = "assessment_rubrics"

    rubric_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String(36), ForeignKey("practical_tasks.task_id", ondelete="CASCADE"), nullable=True)
    module_id = Column(String(36), ForeignKey("learning_modules.module_id", ondelete="CASCADE"), nullable=True)
    criterion = Column(String(255), nullable=False)
    weight = Column(Numeric(4, 2), nullable=False)
    expected_performance = Column(Text, nullable=False)
    pass_condition = Column(Text, nullable=False)

    task = relationship("PracticalTask", back_populates="rubrics")

class ValidationReport(Base):
    __tablename__ = "validation_reports"

    report_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String(36), ForeignKey("onboarding_plans.plan_id", ondelete="CASCADE"), nullable=False)
    verification_status = Column(Enum(VerificationStatusEnum), nullable=False)
    mandatory_coverage_score = Column(Numeric(5, 2), nullable=False)
    source_traceability_score = Column(Numeric(5, 2), nullable=False)
    consistency_score = Column(Numeric(5, 2), nullable=False)
    total_mandatory_requirements = Column(Integer, nullable=False)
    covered_mandatory_requirements = Column(Integer, nullable=False)
    missing_requirements_count = Column(Integer, nullable=False, default=0)
    unsupported_requirements_count = Column(Integer, nullable=False, default=0)
    contradiction_count = Column(Integer, nullable=False, default=0)
    duplicate_count = Column(Integer, nullable=False, default=0)
    evaluated_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    plan = relationship("OnboardingPlan", back_populates="validation_reports")
    comparison_details = relationship("RequirementComparisonDetail", back_populates="report", cascade="all, delete-orphan")
    hallucination_flags = relationship("HallucinationFlag", back_populates="report", cascade="all, delete-orphan")
    contradiction_flags = relationship("ContradictionFlag", back_populates="report", cascade="all, delete-orphan")
    issues = relationship("ValidationIssue", back_populates="report", cascade="all, delete-orphan")

class ValidationIssue(Base):
    __tablename__ = "validation_issues"

    issue_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("validation_reports.report_id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_id = Column(String(100), nullable=True)
    issue_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False, default="high")
    explanation = Column(Text, nullable=False)
    source_info = Column(JSONType, nullable=True)
    expected_value = Column(Text, nullable=True)
    generated_value = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    report = relationship("ValidationReport", back_populates="issues")

class RequirementComparisonDetail(Base):
    __tablename__ = "requirement_comparison_details"

    comparison_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("validation_reports.report_id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_id = Column(String(100), nullable=False)
    job_role_code = Column(String(50), nullable=False)
    python_expected_source_doc = Column(String(100))
    python_expected_source_sec = Column(String(100))
    python_expected_mandatory = Column(Boolean)
    genai_output_source_doc = Column(String(100))
    genai_output_source_sec = Column(String(100))
    genai_output_mandatory = Column(Boolean)
    match_result = Column(Enum(MatchResultEnum), nullable=False)
    validation_status = Column(Enum(VerificationStatusEnum), nullable=False)
    disagreement_explanation = Column(Text)

    report = relationship("ValidationReport", back_populates="comparison_details")

class HallucinationFlag(Base):
    __tablename__ = "hallucination_flags"

    flag_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("validation_reports.report_id", ondelete="CASCADE"), nullable=False)
    module_id = Column(String(36), ForeignKey("learning_modules.module_id"))
    claimed_source_doc = Column(String(100))
    claimed_source_sec = Column(String(100))
    flagged_statement = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    resolution_notes = Column(Text)
    flagged_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    report = relationship("ValidationReport", back_populates="hallucination_flags")

class ContradictionFlag(Base):
    __tablename__ = "contradiction_flags"

    contradiction_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("validation_reports.report_id", ondelete="CASCADE"), nullable=False)
    primary_document_id = Column(String(100))
    conflicting_document_id = Column(String(100))
    primary_clause = Column(Text, nullable=False)
    conflicting_clause = Column(Text, nullable=False)
    applied_precedence_rule = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    flagged_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    report = relationship("ValidationReport", back_populates="contradiction_flags")

class ManualReviewQueue(Base):
    __tablename__ = "manual_review_queue"

    review_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("validation_reports.report_id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(String(36), ForeignKey("onboarding_plans.plan_id", ondelete="CASCADE"), nullable=False)
    assigned_reviewer_id = Column(String(36), ForeignKey("users.user_id"))
    status = Column(String(50), nullable=False, default="pending")
    reason_for_review = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    resolved_at = Column(DateTime(timezone=True))

    audit_trails = relationship("ReviewAuditTrail", back_populates="review", cascade="all, delete-orphan")

class ReviewAuditTrail(Base):
    __tablename__ = "review_audit_trail"

    audit_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    review_id = Column(String(36), ForeignKey("manual_review_queue.review_id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    action_taken = Column(Enum(ReviewActionEnum), nullable=False)
    original_genai_output = Column(JSONType, nullable=False)
    original_verification_status = Column(Enum(VerificationStatusEnum), nullable=False)
    overridden_verification_status = Column(Enum(VerificationStatusEnum), nullable=False)
    reviewer_comments = Column(Text, nullable=False)
    performed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    review = relationship("ManualReviewQueue", back_populates="audit_trails")

class WeakAreaTracking(Base):
    __tablename__ = "weak_area_tracking"

    weakness_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False)
    requirement_id = Column(String(100), ForeignKey("role_requirement_matrix.requirement_id"))
    topic = Column(String(200), nullable=False)
    fail_count = Column(Integer, nullable=False, default=1)
    last_quiz_score = Column(Numeric(5, 2))
    identified_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    recommendations = relationship("AdaptiveRecommendation", back_populates="weakness", cascade="all, delete-orphan")

class AdaptiveRecommendation(Base):
    __tablename__ = "adaptive_recommendations"

    recommendation_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False)
    weakness_id = Column(String(36), ForeignKey("weak_area_tracking.weakness_id"))
    recommendation_type = Column(String(100), nullable=False)
    recommended_action = Column(Text, nullable=False)
    target_module_id = Column(String(36), ForeignKey("learning_modules.module_id"))
    status = Column(String(50), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    weakness = relationship("WeakAreaTracking", back_populates="recommendations")

class PolicyUpdateImpact(Base):
    __tablename__ = "policy_update_impacts"

    impact_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    updated_document_id = Column(String(100), nullable=False)
    obsolete_document_id = Column(String(100))
    affected_roles_count = Column(Integer, default=0)
    affected_plans_count = Column(Integer, default=0)
    affected_modules_count = Column(Integer, default=0)
    affected_quizzes_count = Column(Integer, default=0)
    selective_regeneration_status = Column(String(50), default="pending")
    impact_summary = Column(JSONType, nullable=False)
    detected_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class EmployeeLearningPlan(Base):
    __tablename__ = "employee_learning_plans"

    assignment_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(String(36), ForeignKey("onboarding_plans.plan_id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    status = Column(String(50), nullable=False, default="assigned")
    overall_progress_percentage = Column(Numeric(5, 2), nullable=False, default=0.00)
    overall_status = Column(String(50), nullable=False, default="on_track")
    current_stage = Column(String(100), nullable=True, default="day_1")
    current_module_id = Column(String(36), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class EmployeeModuleProgress(Base):
    __tablename__ = "employee_module_progress"

    module_progress_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_id = Column(String(36), ForeignKey("employee_learning_plans.assignment_id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(String(36), ForeignKey("learning_modules.module_id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_id = Column(String(100), nullable=True)
    completion_status = Column(String(50), nullable=False, default="assigned")
    completion_percentage = Column(Numeric(5, 2), nullable=False, default=0.00)
    assigned_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class ChecklistProgress(Base):
    __tablename__ = "checklist_progress"

    checklist_progress_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_id = Column(String(36), ForeignKey("employee_learning_plans.assignment_id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    checklist_id = Column(String(36), ForeignKey("onboarding_checklists.checklist_id", ondelete="CASCADE"), nullable=False, index=True)
    is_completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class TaskProgress(Base):
    __tablename__ = "task_progress"

    task_progress_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_id = Column(String(36), ForeignKey("employee_learning_plans.assignment_id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(String(36), ForeignKey("practical_tasks.task_id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="pending")
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    employee_notes = Column(Text, nullable=True)
    evidence_link = Column(String(255), nullable=True)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    attempt_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_id = Column(String(36), ForeignKey("module_quizzes.quiz_id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(String(36), nullable=False)
    requirement_id = Column(String(100), nullable=True)
    score = Column(Numeric(5, 2), nullable=False)
    passed = Column(Boolean, nullable=False, default=False)
    answers_submitted = Column(JSONType, nullable=False, default={})
    attempted_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    assessment_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(String(36), nullable=False)
    requirement_id = Column(String(100), nullable=True)
    assessment_topic = Column(String(200), nullable=False)
    score = Column(Numeric(5, 2), nullable=True)
    result = Column(String(50), nullable=False, default="requires_review")
    reviewer_id = Column(String(36), nullable=True)
    feedback = Column(Text, nullable=True)
    assessed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class ProgressSnapshot(Base):
    __tablename__ = "progress_snapshots"

    snapshot_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    overall_progress = Column(Numeric(5, 2), nullable=False)
    overall_status = Column(String(50), nullable=False)
    snapshot_date = Column(Date, default=date.today)

class Milestone(Base):
    __tablename__ = "milestones"

    milestone_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_id = Column(String(36), ForeignKey("employee_learning_plans.assignment_id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(String(36), ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    stage_name = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    target_completion_days = Column(Integer, nullable=False, default=7)
    is_reached = Column(Boolean, nullable=False, default=False)
    reached_at = Column(DateTime(timezone=True), nullable=True)

class PolicyUpdateRecord(Base):
    __tablename__ = "policy_update_records"

    update_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(100), nullable=False, index=True)
    old_version = Column(Integer, nullable=False, default=1)
    new_version = Column(Integer, nullable=False, default=2)
    change_type = Column(String(50), nullable=False, default="modified")
    affected_roles_count = Column(Integer, default=0)
    affected_plans_count = Column(Integer, default=0)
    affected_modules_count = Column(Integer, default=0)
    affected_employees_count = Column(Integer, default=0)
    status = Column(String(50), nullable=False, default="detected")
    detected_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class AffectedRequirementImpact(Base):
    __tablename__ = "affected_requirement_impacts"

    impact_item_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    update_id = Column(String(36), ForeignKey("policy_update_records.update_id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_id = Column(String(100), nullable=False)
    old_source_version = Column(Integer, default=1)
    new_source_version = Column(Integer, default=2)
    change_type = Column(String(50), nullable=False, default="modified")
    affected_roles = Column(JSONType, nullable=False, default=[])

class AffectedModuleImpact(Base):
    __tablename__ = "affected_module_impacts"

    module_impact_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    update_id = Column(String(36), ForeignKey("policy_update_records.update_id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(String(36), ForeignKey("onboarding_plans.plan_id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(String(36), ForeignKey("learning_modules.module_id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_id = Column(String(100), nullable=True)
    old_module_version = Column(Integer, default=1)
    new_module_version = Column(Integer, default=2)
    status = Column(String(50), nullable=False, default="outdated")
    validation_report_id = Column(String(36), nullable=True)
    review_queue_id = Column(String(36), nullable=True)

class PolicyAuditEvent(Base):
    __tablename__ = "policy_audit_events"

    event_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String(100), nullable=False, index=True)
    user_id = Column(String(36), nullable=True)
    username = Column(String(100), nullable=False, default="System Admin")
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=False)
    old_value = Column(JSONType, nullable=True)
    new_value = Column(JSONType, nullable=True)
    reason = Column(Text, nullable=True)
    performed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

