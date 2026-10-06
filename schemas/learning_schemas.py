from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ModuleProgressResponse(BaseModel):
    module_id: str
    module_code: str
    title: str
    purpose: str
    requirement_id: Optional[str] = None
    is_mandatory: bool
    source_document_id: str
    source_section_id: str
    estimated_duration_minutes: int
    difficulty: str
    completion_status: str  # assigned, started, completed
    completion_percentage: float
    assigned_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    learning_objectives: List[str] = []
    completion_criteria: str

class ChecklistProgressResponse(BaseModel):
    checklist_id: str
    activity_name: str
    is_required: bool
    due_stage: str
    responsible_person: Optional[str] = None
    is_completed: bool
    completed_at: Optional[str] = None

class TaskProgressResponse(BaseModel):
    task_id: str
    task_code: str
    description: str
    expected_outcome: str
    difficulty: str
    due_stage: str
    completion_criteria: str
    status: str  # pending, in_progress, completed, requires_review
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    employee_notes: Optional[str] = None
    evidence_link: Optional[str] = None

class QuizOptionSchema(BaseModel):
    option_id: str
    option_label: str
    option_text: str

class QuizDetailResponse(BaseModel):
    quiz_id: str
    module_id: str
    requirement_id: Optional[str] = None
    question_code: str
    question_text: str
    question_type: str
    options: List[QuizOptionSchema]
    passing_score: float = 80.0

class QuizSubmissionRequest(BaseModel):
    selected_option_label: str

class QuizResultResponse(BaseModel):
    attempt_id: str
    quiz_id: str
    score: float
    passed: bool
    correct_answer: str
    explanation: str
    attempted_at: str

class AssessmentResponse(BaseModel):
    assessment_id: str
    module_id: str
    requirement_id: Optional[str] = None
    assessment_topic: str
    score: Optional[float] = None
    result: str  # passed, failed, requires_review
    reviewer_id: Optional[str] = None
    feedback: Optional[str] = None
    assessed_at: str

class AssessmentEvaluationRequest(BaseModel):
    score: float
    result: str  # passed, failed, requires_review
    feedback: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommendation_id: str
    recommendation_type: str
    recommended_action: str
    reason: str
    status: str
    created_at: str

class UpcomingActivityResponse(BaseModel):
    activity_id: str
    activity_type: str  # module, task, quiz, assessment
    title: str
    due_stage: str
    is_mandatory: bool

class MilestoneResponse(BaseModel):
    milestone_id: str
    stage_name: str
    title: str
    target_completion_days: int
    is_reached: bool
    reached_at: Optional[str] = None

class EmployeeDashboardResponse(BaseModel):
    employee_id: str
    employee_name: str
    role_code: str
    role_title: str
    department: str
    overall_progress_percentage: float
    overall_status: str  # On Track, Requires Attention, Behind Schedule, Assessment Required, Completed
    current_stage: str
    current_module_id: Optional[str] = None
    current_module_title: Optional[str] = None
    assigned_modules_count: int
    completed_modules_count: int
    pending_modules_count: int
    completed_tasks_count: int
    total_tasks_count: int
    checklist_completion_percentage: float
    quiz_assessment_score: float
    upcoming_activities: List[UpcomingActivityResponse]
    milestones: List[MilestoneResponse]
    recommendations: List[RecommendationResponse]

class ManagerProgressOverviewResponse(BaseModel):
    employee_id: str
    employee_name: str
    role_title: str
    department: str
    overall_progress_percentage: float
    overall_status: str
    completed_modules_count: int
    total_modules_count: int
    quiz_score_avg: float
    weak_areas_count: int
    pending_reviews_count: int
