-- =============================================================================
-- OnBoardIQ — Complete PostgreSQL Database Schema
-- Theme: OnboardVerse (Generative AI Corporate Onboarding & Training Intelligence)
-- Specification: Based strictly on OnBoardIQ Specification v1.0
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================

CREATE TYPE user_role_enum AS ENUM (
    'admin',
    'training_manager',
    'reviewer',
    'manager',
    'employee'
);

CREATE TYPE document_category_enum AS ENUM (
    'company_handbook',
    'hr_policy',
    'leave_policy',
    'information_security_policy',
    'workplace_conduct_policy',
    'data_privacy_policy',
    'department_sop',
    'role_description',
    'process_document',
    'faq',
    'compliance_instruction',
    'escalation_procedure',
    'safety_instruction'
);

CREATE TYPE document_status_enum AS ENUM (
    'active',
    'obsolete',
    'pending_review',
    'draft'
);

CREATE TYPE document_format_enum AS ENUM (
    'pdf',
    'docx',
    'txt',
    'markdown',
    'csv'
);

CREATE TYPE requirement_type_enum AS ENUM (
    'must_know',
    'must_complete',
    'must_demonstrate',
    'must_acknowledge',
    'recommended',
    'optional',
    'not_applicable'
);

CREATE TYPE priority_level_enum AS ENUM (
    'high',
    'medium',
    'low'
);

CREATE TYPE onboarding_stage_enum AS ENUM (
    'day_1',
    'week_1',
    'week_2',
    'first_30_days',
    'first_60_days',
    'first_90_days'
);

CREATE TYPE difficulty_level_enum AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);

CREATE TYPE quiz_question_type_enum AS ENUM (
    'multiple_choice',
    'multiple_response',
    'true_false',
    'scenario_based'
);

CREATE TYPE verification_status_enum AS ENUM (
    'verified',
    'verified_with_warning',
    'partially_verified',
    'source_support_missing',
    'requirement_missing',
    'unsupported_requirement',
    'outdated_source',
    'contradiction_detected',
    'manual_review_required'
);

CREATE TYPE match_result_enum AS ENUM (
    'match',
    'mismatch',
    'missing',
    'unsupported'
);

CREATE TYPE progress_status_enum AS ENUM (
    'on_track',
    'requires_attention',
    'behind_schedule',
    'assessment_required',
    'completed'
);

CREATE TYPE review_action_enum AS ENUM (
    'approve',
    'reject',
    'edit',
    'regenerate',
    'override'
);

-- =============================================================================
-- 2. USER & AUTHENTICATION MANAGEMENT
-- =============================================================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'employee',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================================================
-- 3. ORGANIZATIONAL ROLES & JOB DEFINITIONS
-- =============================================================================

CREATE TABLE job_roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. R001, ROLE_CS_EXEC
    title VARCHAR(150) NOT NULL,            -- e.g. Customer Support Executive, Sales Executive
    department VARCHAR(100) NOT NULL,
    description TEXT,
    required_experience_level difficulty_level_enum DEFAULT 'beginner',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_roles_department ON job_roles(department);
CREATE INDEX idx_job_roles_code ON job_roles(role_code);

-- =============================================================================
-- 4. EMPLOYEE PROFILES (Specification Step 9)
-- Non-sensitive organizational profile details
-- =============================================================================

CREATE TABLE employee_profiles (
    employee_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    job_role_id UUID NOT NULL REFERENCES job_roles(role_id),
    department VARCHAR(100) NOT NULL,
    experience_level difficulty_level_enum NOT NULL DEFAULT 'beginner',
    location VARCHAR(100),
    joining_date DATE NOT NULL,
    reporting_manager_id UUID REFERENCES employee_profiles(employee_id) ON DELETE SET NULL,
    required_competencies JSONB DEFAULT '[]'::jsonb,
    previous_experience TEXT,
    training_status progress_status_enum NOT NULL DEFAULT 'on_track',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employee_profiles_role ON employee_profiles(job_role_id);
CREATE INDEX idx_employee_profiles_dept ON employee_profiles(department);

-- =============================================================================
-- 5. COMPANY DOCUMENT MANAGEMENT & METADATA (Specification Steps 4-8)
-- =============================================================================

CREATE TABLE company_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(100) NOT NULL,     -- e.g. POL-HR-001, SOP-07
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category document_category_enum NOT NULL,
    department VARCHAR(100),               -- NULL if company-wide
    version INT NOT NULL DEFAULT 1,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    status document_status_enum NOT NULL DEFAULT 'active',
    file_format document_format_enum NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,     -- SHA-256 hash to prevent duplicate upload
    precedence_rank INT NOT NULL DEFAULT 3, -- 1=Latest Policy, 2=SOP, 3=FAQ, 4=Informal
    supersedes_document_id VARCHAR(100),
    uploaded_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_doc_version UNIQUE (document_id, version)
);

CREATE INDEX idx_company_docs_category ON company_documents(category);
CREATE INDEX idx_company_docs_status ON company_documents(status);
CREATE INDEX idx_company_docs_version ON company_documents(document_id, version);

CREATE TABLE document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(100) NOT NULL,
    document_version INT NOT NULL DEFAULT 1,
    section_id VARCHAR(100) NOT NULL,        -- e.g. 4.2, Sec-3.1
    section_title VARCHAR(255),
    heading VARCHAR(255),
    page_number INT,                         -- Page number for PDF files
    paragraph_reference VARCHAR(100),        -- Paragraph/section reference for DOCX files
    chunk_text TEXT NOT NULL,
    chunk_index INT NOT NULL,
    token_count INT,
    contains_adversarial_flag BOOLEAN DEFAULT FALSE, -- Flagged by prompt injection detector
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chunks_doc_sec ON document_chunks(document_id, section_id);
CREATE INDEX idx_chunks_doc_id ON document_chunks(document_id);

CREATE TABLE document_processing_jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(100) NOT NULL,
    document_version INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    error_message TEXT,
    total_chunks INT DEFAULT 0,
    adversarial_flags_count INT DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 7. ROLE REQUIREMENT MATRIX (Specification Step 10 & 28)
-- Ground-Truth mapping constructed independently for Python verification
-- =============================================================================

CREATE TABLE role_requirement_matrix (
    requirement_id VARCHAR(100) PRIMARY KEY, -- e.g. R001, REQ-FIN-012
    job_role_id UUID NOT NULL REFERENCES job_roles(role_id) ON DELETE CASCADE,
    policy_requirement TEXT NOT NULL,
    process_requirement TEXT,
    required_competency VARCHAR(150) NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    requirement_type requirement_type_enum NOT NULL DEFAULT 'must_know',
    priority priority_level_enum NOT NULL DEFAULT 'high',
    due_stage onboarding_stage_enum NOT NULL DEFAULT 'week_1',
    source_document_id VARCHAR(100) NOT NULL REFERENCES company_documents(document_id) ON DELETE CASCADE,
    source_section_id VARCHAR(100) NOT NULL,
    required_task_description TEXT,
    required_assessment_topic VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matrix_role ON role_requirement_matrix(job_role_id);
CREATE INDEX idx_matrix_mandatory ON role_requirement_matrix(job_role_id, is_mandatory);
CREATE INDEX idx_matrix_source ON role_requirement_matrix(source_document_id, source_section_id);

-- =============================================================================
-- 8. PROMPT TEMPLATES & VERSIONING (Specification Step 40 & 41)
-- Managed and version-controlled prompt templates
-- =============================================================================

CREATE TABLE prompt_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL,    -- e.g. onboarding_plan_generator, quiz_generator
    prompt_version VARCHAR(50) NOT NULL,     -- e.g. v1.2.0
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    expected_json_schema JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_name_version UNIQUE (template_name, prompt_version)
);

-- =============================================================================
-- 9. GENAI EXECUTION LOGS & RETRY AUDIT (Specification Step 39 & 41)
-- Logs raw GenAI requests, retries, and API metrics
-- =============================================================================

CREATE TABLE genai_execution_logs (
    execution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employee_profiles(employee_id) ON DELETE CASCADE,
    template_id UUID REFERENCES prompt_templates(template_id),
    model_name VARCHAR(100) NOT NULL,        -- e.g. gemini-2.5-flash, gpt-4o
    prompt_version VARCHAR(50) NOT NULL,
    input_prompt TEXT NOT NULL,
    raw_response_text TEXT,
    parsed_json_output JSONB,
    schema_validation_passed BOOLEAN DEFAULT FALSE,
    retry_count INT DEFAULT 0,
    latency_ms INT,
    tokens_prompt INT,
    tokens_completion INT,
    error_log TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_genai_logs_employee ON genai_execution_logs(employee_id);

-- =============================================================================
-- 10. PERSONALIZED ONBOARDING PLANS (Specification Step 12 & 13)
-- Multi-stage onboarding plan assigned to employee
-- =============================================================================

CREATE TABLE onboarding_plans (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employee_profiles(employee_id) ON DELETE CASCADE,
    job_role_id UUID NOT NULL REFERENCES job_roles(role_id),
    execution_id UUID REFERENCES genai_execution_logs(execution_id),
    prompt_version VARCHAR(50) NOT NULL,
    genai_model VARCHAR(100) NOT NULL,
    verification_status verification_status_enum NOT NULL DEFAULT 'manual_review_required',
    coverage_score NUMERIC(5,2) DEFAULT 0.00,       -- 0.00 to 100.00 %
    traceability_score NUMERIC(5,2) DEFAULT 0.00,   -- 0.00 to 100.00 %
    consistency_score NUMERIC(5,2) DEFAULT 0.00,    -- 0.00 to 100.00 %
    is_current_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plans_employee ON onboarding_plans(employee_id);
CREATE INDEX idx_plans_status ON onboarding_plans(verification_status);

-- =============================================================================
-- 11. LEARNING MODULES & STAGES (Specification Step 13 & 14)
-- Structured learning modules within multi-stage onboarding
-- =============================================================================

CREATE TABLE onboarding_stages (
    stage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES onboarding_plans(plan_id) ON DELETE CASCADE,
    stage_name onboarding_stage_enum NOT NULL,
    stage_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learning_modules (
    module_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES onboarding_stages(stage_id) ON DELETE CASCADE,
    module_code VARCHAR(50) NOT NULL,        -- e.g. M01, M04
    title VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    requirement_id VARCHAR(100) REFERENCES role_requirement_matrix(requirement_id),
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    source_document_id VARCHAR(100) NOT NULL REFERENCES company_documents(document_id),
    source_section_id VARCHAR(100) NOT NULL,
    estimated_duration_minutes INT NOT NULL DEFAULT 30,
    difficulty difficulty_level_enum NOT NULL DEFAULT 'beginner',
    prerequisite_module_id UUID REFERENCES learning_modules(module_id),
    learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
    completion_criteria TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_stage ON learning_modules(stage_id);
CREATE INDEX idx_modules_req ON learning_modules(requirement_id);

-- =============================================================================
-- 12. CHECKLISTS, PRACTICAL TASKS & SCENARIOS (Specification Steps 17, 18, 19)
-- =============================================================================

CREATE TABLE onboarding_checklists (
    checklist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES onboarding_plans(plan_id) ON DELETE CASCADE,
    activity_name VARCHAR(255) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    due_stage onboarding_stage_enum NOT NULL,
    responsible_person VARCHAR(150),        -- e.g. HR Manager, IT Lead, Employee
    source_document_id VARCHAR(100) REFERENCES company_documents(document_id),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE practical_tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES learning_modules(module_id) ON DELETE CASCADE,
    task_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    expected_outcome TEXT NOT NULL,
    difficulty difficulty_level_enum NOT NULL DEFAULT 'beginner',
    due_stage onboarding_stage_enum NOT NULL,
    completion_criteria TEXT NOT NULL,
    scenario_context TEXT,                  -- Practical scenario if scenario-based
    source_document_id VARCHAR(100) NOT NULL REFERENCES company_documents(document_id),
    source_section_id VARCHAR(100) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    reviewer_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tasks_module ON practical_tasks(module_id);

-- =============================================================================
-- 13. QUIZZES, DISTRACTOR VALIDATION & RUBRICS (Specification Steps 20-24)
-- =============================================================================

CREATE TABLE module_quizzes (
    quiz_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES learning_modules(module_id) ON DELETE CASCADE,
    question_code VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    question_type quiz_question_type_enum NOT NULL DEFAULT 'multiple_choice',
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty difficulty_level_enum NOT NULL DEFAULT 'beginner',
    source_document_id VARCHAR(100) NOT NULL REFERENCES company_documents(document_id),
    source_section_id VARCHAR(100) NOT NULL,
    distractor_validation_passed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_options (
    option_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES module_quizzes(quiz_id) ON DELETE CASCADE,
    option_label VARCHAR(10) NOT NULL,      -- e.g. A, B, C, D
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE assessment_rubrics (
    rubric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES practical_tasks(task_id) ON DELETE CASCADE,
    module_id UUID REFERENCES learning_modules(module_id) ON DELETE CASCADE,
    criterion VARCHAR(255) NOT NULL,
    weight NUMERIC(4,2) NOT NULL CHECK (weight > 0 AND weight <= 1.00),
    expected_performance TEXT NOT NULL,
    pass_condition TEXT NOT NULL
);

-- =============================================================================
-- 14. DETERMINISTIC PYTHON VALIDATION & COMPARISON ENGINE (Specification Steps 28-36, 46)
-- Compares Pipeline 1 GenAI outputs against Pipeline 2 Python Ground Truth
-- =============================================================================

CREATE TABLE validation_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES onboarding_plans(plan_id) ON DELETE CASCADE,
    verification_status verification_status_enum NOT NULL,
    mandatory_coverage_score NUMERIC(5,2) NOT NULL,
    source_traceability_score NUMERIC(5,2) NOT NULL,
    consistency_score NUMERIC(5,2) NOT NULL,
    total_mandatory_requirements INT NOT NULL,
    covered_mandatory_requirements INT NOT NULL,
    missing_requirements_count INT NOT NULL DEFAULT 0,
    unsupported_requirements_count INT NOT NULL DEFAULT 0,
    contradiction_count INT NOT NULL DEFAULT 0,
    duplicate_count INT NOT NULL DEFAULT 0,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requirement_comparison_details (
    comparison_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES validation_reports(report_id) ON DELETE CASCADE,
    requirement_id VARCHAR(100) NOT NULL,
    job_role_code VARCHAR(50) NOT NULL,
    python_expected_source_doc VARCHAR(100),
    python_expected_source_sec VARCHAR(100),
    python_expected_mandatory BOOLEAN,
    genai_output_source_doc VARCHAR(100),
    genai_output_source_sec VARCHAR(100),
    genai_output_mandatory BOOLEAN,
    match_result match_result_enum NOT NULL,
    validation_status verification_status_enum NOT NULL,
    disagreement_explanation TEXT
);

CREATE INDEX idx_comparison_report ON requirement_comparison_details(report_id);
CREATE INDEX idx_comparison_result ON requirement_comparison_details(match_result);

-- =============================================================================
-- 15. HALLUCINATION & CONTRADICTION FLAGS (Specification Steps 31, 33)
-- =============================================================================

CREATE TABLE hallucination_flags (
    flag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES validation_reports(report_id) ON DELETE CASCADE,
    module_id UUID REFERENCES learning_modules(module_id),
    claimed_source_doc VARCHAR(100),
    claimed_source_sec VARCHAR(100),
    flagged_statement TEXT NOT NULL,
    reason TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    flagged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contradiction_flags (
    contradiction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES validation_reports(report_id) ON DELETE CASCADE,
    primary_document_id VARCHAR(100) REFERENCES company_documents(document_id),
    conflicting_document_id VARCHAR(100) REFERENCES company_documents(document_id),
    primary_clause TEXT NOT NULL,
    conflicting_clause TEXT NOT NULL,
    applied_precedence_rule TEXT NOT NULL,
    description TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    flagged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 16. HUMAN REVIEW QUEUE & REVIEWER OVERRIDE (Specification Steps 48, 49)
-- Preserves complete audit trail of human actions vs AI output
-- =============================================================================

CREATE TABLE manual_review_queue (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES validation_reports(report_id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES onboarding_plans(plan_id) ON DELETE CASCADE,
    assigned_reviewer_id UUID REFERENCES users(user_id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_review, resolved
    reason_for_review TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE review_audit_trail (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES manual_review_queue(review_id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(user_id),
    action_taken review_action_enum NOT NULL,
    original_genai_output JSONB NOT NULL,
    original_verification_status verification_status_enum NOT NULL,
    overridden_verification_status verification_status_enum NOT NULL,
    reviewer_comments TEXT NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_review ON review_audit_trail(review_id);
CREATE INDEX idx_audit_reviewer ON review_audit_trail(reviewer_id);

-- =============================================================================
-- 17. ADAPTIVE RECOMMENDATIONS & WEAK-AREA TRACKING (Specification Steps 55, 56)
-- =============================================================================

CREATE TABLE weak_area_tracking (
    weakness_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employee_profiles(employee_id) ON DELETE CASCADE,
    requirement_id VARCHAR(100) REFERENCES role_requirement_matrix(requirement_id),
    topic VARCHAR(200) NOT NULL,
    fail_count INT NOT NULL DEFAULT 1,
    last_quiz_score NUMERIC(5,2),
    identified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adaptive_recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employee_profiles(employee_id) ON DELETE CASCADE,
    weakness_id UUID REFERENCES weak_area_tracking(weakness_id),
    recommendation_type VARCHAR(100) NOT NULL, -- revision_module, additional_quiz, additional_task, manager_review
    recommended_action TEXT NOT NULL,
    target_module_id UUID REFERENCES learning_modules(module_id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 18. POLICY UPDATE IMPACT ANALYSIS & SELECTIVE REGENERATION (Specification Steps 57-59)
-- =============================================================================

CREATE TABLE policy_update_impacts (
    impact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    updated_document_id VARCHAR(100) NOT NULL REFERENCES company_documents(document_id),
    obsolete_document_id VARCHAR(100) REFERENCES company_documents(document_id),
    affected_roles_count INT DEFAULT 0,
    affected_plans_count INT DEFAULT 0,
    affected_modules_count INT DEFAULT 0,
    affected_quizzes_count INT DEFAULT 0,
    selective_regeneration_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed
    impact_summary JSONB NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 19. AUDIT TRAIL TRIGGER FUNCTIONS
-- Automatically updates updated_at timestamps across core entities
-- =============================================================================

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_job_roles_updated_at BEFORE UPDATE ON job_roles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_employee_profiles_updated_at BEFORE UPDATE ON employee_profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_company_documents_updated_at BEFORE UPDATE ON company_documents FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_role_matrix_updated_at BEFORE UPDATE ON role_requirement_matrix FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_onboarding_plans_updated_at BEFORE UPDATE ON onboarding_plans FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
