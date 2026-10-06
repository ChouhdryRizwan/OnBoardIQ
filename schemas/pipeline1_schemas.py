from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class QuizOptionSchema(BaseModel):
    option_label: str = Field(..., example="A")
    option_text: str = Field(..., example="Escalate to Supervisor within 24 hours.")
    is_correct: bool = Field(..., example=True)

class QuizQuestionSchema(BaseModel):
    question_id: str = Field(..., example="Q01")
    question_text: str = Field(..., example="What is the maximum allowed resolution time for priority escalations?")
    question_type: Optional[str] = Field("multiple_choice", example="multiple_choice")
    options: List[QuizOptionSchema]
    correct_answer: str = Field(..., example="Escalate to Supervisor within 24 hours.")
    explanation: str = Field(..., example="According to SOP-07 Section 4.2, escalations must be handled within 24h.")
    difficulty: Optional[str] = Field("beginner", example="beginner")
    source_document_id: str = Field(..., example="SOP-07")
    source_section_id: str = Field(..., example="4.2")

class TaskRubricSchema(BaseModel):
    criterion: str = Field(..., example="Timeliness of Response")
    weight: float = Field(1.0, example=1.0)
    expected_performance: Optional[str] = Field("100% compliance", example="100% compliance")
    pass_condition: str = Field(..., example="Score 80% or higher on rubric criteria.")

class PracticalTaskSchema(BaseModel):
    task_id: str = Field(..., example="T01")
    description: str = Field(..., example="Respond to a simulated customer complaint following escalation procedure.")
    expected_outcome: str = Field(..., example="Complete complaint resolution ticket with correct escalation tags.")
    difficulty: Optional[str] = Field("beginner", example="beginner")
    due_stage: Optional[str] = Field("day_1", example="day_1")
    completion_criteria: Optional[str] = Field("Pass review.", example="Pass review.")
    scenario_context: Optional[str] = Field(None, example="Customer expresses dissatisfaction with billing delay.")
    source_document_id: str = Field(..., example="SOP-07")
    source_section_id: str = Field(..., example="4.2")
    rubric: Optional[List[TaskRubricSchema]] = None

class GeneratedRequirementSchema(BaseModel):
    requirement_id: str = Field(..., example="REQ-SEC-001")
    mandatory: bool = Field(True, example=True)
    classification: Optional[str] = Field("must_know", example="must_know")
    source_document_id: str = Field(..., example="POL-SEC-001")
    source_document_version: Optional[int] = Field(1, example=1)
    source_section_id: str = Field(..., example="Sec-1")
    priority: Optional[str] = Field("high", example="high")
    due_stage: Optional[str] = Field("day_1", example="day_1")
    task: Optional[str] = Field(None, example="Password renewal task")
    assessment_topic: Optional[str] = Field(None, example="Security standard topic")

class ModuleAssessmentSchema(BaseModel):
    criterion: Optional[str] = Field("Policy adherence", example="Policy adherence")
    weight: Optional[float] = Field(1.0, example=1.0)
    pass_condition: Optional[str] = Field("Pass score >= 80%", example="Pass score >= 80%")

class LearningModuleSchema(BaseModel):
    module_id: str = Field(..., example="M01")
    module_code: Optional[str] = Field("M01", example="M01")
    title: str = Field(..., example="Customer Escalation Workflow")
    module_title: Optional[str] = Field(None, example="Customer Escalation Workflow")
    description: Optional[str] = Field(None, example="Master company escalation guidelines for customer complaints.")
    purpose: Optional[str] = Field(None, example="Master company escalation guidelines for customer complaints.")
    objectives: Optional[List[str]] = Field(default_factory=list)
    learning_objectives: Optional[List[str]] = Field(default_factory=list)
    requirements: Optional[List[GeneratedRequirementSchema]] = Field(default_factory=list)
    requirement_id: Optional[str] = Field(None, example="REQ-CS-001")
    mandatory: Optional[bool] = Field(True, example=True)
    source_document_id: Optional[str] = Field(None, example="SOP-07")
    source_section_id: Optional[str] = Field(None, example="4.2")
    estimated_duration_minutes: Optional[int] = Field(30, example=30)
    difficulty: Optional[str] = Field("beginner", example="beginner")
    key_concepts: Optional[List[str]] = Field(default_factory=list)
    completion_criteria: Optional[str] = Field("Pass quiz", example="Pass quiz")
    checklist: Optional[List[str]] = Field(default_factory=list)
    practical_tasks: Optional[List[PracticalTaskSchema]] = Field(default_factory=list)
    tasks: Optional[List[PracticalTaskSchema]] = Field(default_factory=list)
    role_specific_activities: Optional[List[str]] = Field(default_factory=list)
    quiz: Optional[List[QuizQuestionSchema]] = Field(default_factory=list)
    quizzes: Optional[List[QuizQuestionSchema]] = Field(default_factory=list)
    assessment: Optional[ModuleAssessmentSchema] = None
    explanation: Optional[str] = Field(None, example="Module detailed explanation")

class OnboardingStageSchema(BaseModel):
    stage: str = Field(..., example="Day 1")
    stage_id: Optional[str] = Field("day_1", example="day_1")
    stage_order: Optional[int] = Field(1, example=1)
    modules: List[LearningModuleSchema] = Field(default_factory=list)

class ChecklistItemSchema(BaseModel):
    activity_name: str = Field(..., example="Complete Information Security Acknowledgment")
    required: Optional[bool] = Field(True, example=True)
    due_stage: Optional[str] = Field("day_1", example="day_1")
    responsible_person: Optional[str] = Field("Employee", example="Employee")
    source_document_id: Optional[str] = Field(None, example="POL-HR-001")

class Pipeline1OnboardingPlanResponse(BaseModel):
    employee_id: str = Field(..., example="EMP-1001")
    role_id: Optional[str] = Field("R001", example="R001")
    role_name: Optional[str] = Field("Customer Support Executive", example="Customer Support Executive")
    role: Optional[str] = Field(None, example="Customer Support Executive")
    department: str = Field(..., example="Customer Service")
    plan_version: str = Field("v1.0.0", example="v1.0.0")
    generated_at: Optional[str] = Field(None, example="2026-09-25T20:50:00Z")
    prompt_version: Optional[str] = Field("v1.0.0", example="v1.0.0")
    model_used: Optional[str] = Field("gemini-2.5-flash", example="gemini-2.5-flash")
    stages: List[OnboardingStageSchema]
    checklists: Optional[List[ChecklistItemSchema]] = Field(default_factory=list)
    recommendations: Optional[List[str]] = Field(default_factory=list)

class Pipeline1GenerationRequest(BaseModel):
    employee_id: str = Field(..., example="EMP-1001")
    role_id: Optional[str] = Field(None, example="R001")
    role_identifier: Optional[str] = Field(None, example="R001")
    model_name: Optional[str] = Field("gemini-2.5-flash", example="gemini-2.5-flash")
    prompt_version: Optional[str] = Field("v1.0.0", example="v1.0.0")
