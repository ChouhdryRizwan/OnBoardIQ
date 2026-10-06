import os
import sys

# Run the full suite against an isolated SQLite test database — never against the
# production DATABASE_URL from .env (Neon/Supabase/Render).
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(os.getcwd(), 'test_skillsprint.db')}"

from tests.test_document_processing import setup_database, test_root_endpoint, test_document_upload_and_chunking, test_get_document_chunks
from tests.test_role_matrix import (
    test_list_and_seed_roles, test_create_new_role,
    test_add_matrix_requirement_and_retrieve, test_validate_matrix_integrity
)
from tests.test_pipeline1 import test_pipeline1_generation
from tests.test_pipeline2 import test_pipeline2_verification_flow, test_pipeline2_invalid_plan
from tests.test_document_management_phase2 import (
    test_valid_pdf_upload, test_valid_docx_upload_and_traceability,
    test_invalid_file_type, test_empty_document, test_duplicate_document_content,
    test_version_handling_and_activation, test_unauthorized_upload, test_reprocess_document
)
from tests.test_role_requirement_matrix_phase2 import (
    test_create_and_list_roles, test_create_valid_mandatory_and_optional_requirements,
    test_invalid_source_document_and_section_rejection, test_duplicate_requirement_id_rejection,
    test_prerequisite_validation_and_circular_rejection, test_rrm_filtering_and_summary,
    test_unauthorized_matrix_modification, test_pipeline2_ground_truth_query_format
)
from tests.test_pipeline1_phase2 import (
    test_employee_crud_operations, test_pipeline1_generation_flow_and_architecture_rules,
    test_schema_validation_and_malformed_json_recovery, test_fallback_generator_ground_truth
)
from tests.test_pipeline2_phase2 import (
    test_pipeline2_no_genai_dependency_critical_rule, test_mandatory_coverage_calculation,
    test_source_traceability_score_calculation, test_pipeline2_full_validation_workflow_and_api_routes
)
from tests.test_human_review_phase2 import (
    test_human_review_queue_retrieval, test_human_review_approve_action,
    test_human_review_reject_action, test_human_review_edit_action,
    test_human_review_regenerate_action, test_human_review_comment_and_override_actions,
    test_final_onboarding_plan_export
)
from tests.test_employee_learning_phase2 import (
    test_approved_plan_assignment, test_rejected_plan_cannot_be_assigned,
    test_employee_dashboard, test_employee_isolation_security,
    test_module_progress_start_and_complete, test_checklist_progress_tracking,
    test_practical_task_completion, test_quiz_submission_and_scoring,
    test_assessment_result, test_overall_progress_calculation_formula,
    test_on_track_status, test_requires_attention_status,
    test_behind_schedule_status, test_completed_status,
    test_weak_area_detection_and_recommendations, test_upcoming_activities_and_milestones,
    test_manager_read_only_access, test_unauthorized_employee_access,
    test_regression_all_modules
)
from tests.test_policy_update_phase2 import (
    test_new_policy_version_detection, test_impact_analysis_requirements_roles_plans_employees,
    test_unaffected_module_preservation_and_selective_regeneration,
    test_human_review_routing_for_validation_issues,
    test_historical_version_and_employee_progress_preservation,
    test_audit_logging_and_history, test_rbac_security,
    test_regression_all_modules as test_policy_regression_all
)
from tests.test_reports_phase2 import (
    test_01_overview_metrics_success, test_02_overview_metrics_zero_denominator_safe,
    test_03_overview_metrics_rbac_denied, test_04_employee_progress_report_default,
    test_05_employee_progress_report_search_filter, test_06_employee_progress_report_department_filter,
    test_07_employee_progress_report_sorting, test_08_employee_progress_report_pagination,
    test_09_role_coverage_report, test_10_role_coverage_filter_role, test_11_role_coverage_rbac,
    test_12_mandatory_training_report, test_13_mandatory_training_department_filter,
    test_14_mandatory_training_optional_included, test_15_assessment_report_summary,
    test_16_assessment_report_filter_status, test_17_assessment_report_rbac,
    test_18_source_traceability_report, test_19_source_traceability_filter_doc,
    test_20_source_traceability_rbac, test_21_hallucination_report, test_22_hallucination_report_filter_type,
    test_23_hallucination_report_rbac, test_24_policy_coverage_report, test_25_policy_coverage_doc_filter,
    test_26_policy_coverage_rbac, test_27_genai_vs_python_comparison, test_28_compare_entities,
    test_29_compare_entities_rbac, test_30_export_report_csv, test_31_export_report_excel,
    test_32_export_report_pdf_html
)
from tests.test_security_phase9 import (
    test_01_prompt_injection_admin_account_creation, test_02_prompt_injection_override_mandatory_status,
    test_03_prompt_injection_reveal_system_prompt, test_04_prompt_injection_disregard_rrm,
    test_05_prompt_injection_auto_approve_plan, test_06_prompt_injection_ignore_validation_failures,
    test_07_prompt_injection_reveal_confidential_info, test_08_prompt_injection_change_requirement_priority,
    test_09_prompt_injection_highest_priority_instruction, test_10_prompt_injection_code_execution_instruction,
    test_11_rbac_employee_upload_document_denied, test_12_rbac_employee_modify_rrm_denied,
    test_13_rbac_employee_generate_pipeline1_denied, test_14_rbac_employee_trigger_pipeline2_denied,
    test_15_rbac_employee_human_review_approval_denied, test_16_rbac_employee_policy_impact_analysis_denied,
    test_17_rbac_employee_admin_reports_denied, test_18_rbac_manager_read_only_access,
    test_19_rbac_missing_user_role_defaults_to_employee, test_20_rbac_audit_trail_immutable,
    test_21_idor_employee_profile_isolation, test_22_idor_onboarding_plan_isolation,
    test_23_idor_module_completion_isolation, test_24_idor_quiz_answer_submission_isolation,
    test_25_idor_weak_area_tracking_isolation, test_26_idor_assessment_result_isolation,
    test_27_idor_direct_api_employee_endpoint, test_28_idor_direct_api_plan_endpoint,
    test_29_idor_direct_api_progress_endpoint, test_30_idor_adaptive_recommendation_isolation,
    test_31_upload_path_traversal_filename, test_32_upload_malicious_executable_extension,
    test_33_upload_mime_type_mismatch, test_34_upload_empty_0byte_document,
    test_35_upload_oversized_document, test_36_upload_duplicate_content_hash,
    test_37_upload_corrupted_pdf_handling, test_38_upload_corrupted_docx_handling,
    test_39_xss_script_injection_in_metadata, test_40_health_endpoint_secure
)
from tests.test_e2e_phase9 import test_full_end_to_end_onboardiq_lifecycle

print("=== Running OnBoardIQ Full Backend Test Suite ===")
try:
    setup_database()
    
    print("1. Testing Root Endpoint...")
    test_root_endpoint()
    print("   [PASSED]")

    print("2. Testing Document Upload, Parsing, Chunking & Security Injection Scanning...")
    test_document_upload_and_chunking()
    print("   [PASSED]")

    print("3. Testing Document Chunk Retrieval...")
    test_get_document_chunks()
    print("   [PASSED]")

    print("4. Testing Job Roles Listing & Default Seeding (10 Roles)...")
    test_list_and_seed_roles()
    print("   [PASSED]")

    print("5. Testing Dynamic Job Role Creation...")
    test_create_new_role()
    print("   [PASSED]")

    print("6. Testing Role Requirement Matrix Builder...")
    test_add_matrix_requirement_and_retrieve()
    print("   [PASSED]")

    print("7. Testing Role Requirement Matrix Integrity Validation...")
    test_validate_matrix_integrity()
    print("   [PASSED]")

    print("8. Testing Pipeline 1 GenAI Structured Onboarding Plan Generation...")
    test_pipeline1_generation()
    print("   [PASSED]")

    print("9. Testing Pipeline 2 Deterministic Python Verification Engine...")
    test_pipeline2_verification_flow()
    print("   [PASSED]")

    print("10. Testing Pipeline 2 Error Handling for Invalid Plan...")
    test_pipeline2_invalid_plan()
    print("   [PASSED]")

    print("11. Testing Phase 2 PDF Upload with Page Traceability...")
    test_valid_pdf_upload()
    print("   [PASSED]")

    print("12. Testing Phase 2 DOCX Upload with Heading/Paragraph Traceability...")
    test_valid_docx_upload_and_traceability()
    print("   [PASSED]")

    print("13. Testing Phase 2 File Validation & Security Handling...")
    test_invalid_file_type()
    test_empty_document()
    test_duplicate_document_content()
    test_unauthorized_upload()
    print("   [PASSED]")

    print("14. Testing Phase 2 Document Version Control & Activation...")
    test_version_handling_and_activation()
    print("   [PASSED]")

    print("15. Testing Phase 2 Document Reprocessing...")
    test_reprocess_document()
    print("   [PASSED]")

    print("16. Testing Phase 2 RRM Role Creation & Listing...")
    test_create_and_list_roles()
    print("   [PASSED]")

    print("17. Testing Phase 2 RRM Mandatory & Optional Requirements...")
    test_create_valid_mandatory_and_optional_requirements()
    print("   [PASSED]")

    print("18. Testing Phase 2 RRM Invalid Document & Section Source Rejection...")
    test_invalid_source_document_and_section_rejection()
    print("   [PASSED]")

    print("19. Testing Phase 2 RRM Duplicate Requirement Rejection...")
    test_duplicate_requirement_id_rejection()
    print("   [PASSED]")

    print("20. Testing Phase 2 RRM Prerequisite & Circular Dependency Rejection...")
    test_prerequisite_validation_and_circular_rejection()
    print("   [PASSED]")

    print("21. Testing Phase 2 RRM Dashboard Summary & Filtering...")
    test_rrm_filtering_and_summary()
    print("   [PASSED]")

    print("22. Testing Phase 2 RRM Security Authorization & Pipeline 2 Format Integration...")
    test_unauthorized_matrix_modification()
    test_pipeline2_ground_truth_query_format()
    print("   [PASSED]")

    print("23. Testing Phase 2 Employee CRUD Operations...")
    test_employee_crud_operations()
    print("   [PASSED]")

    print("24. Testing Pipeline 1 Flow & Architecture Rule (Must Not Self-Verify)...")
    test_pipeline1_generation_flow_and_architecture_rules()
    print("   [PASSED]")

    print("25. Testing Pipeline 1 Schema Validator & Malformed Recovery...")
    test_schema_validation_and_malformed_json_recovery()
    print("   [PASSED]")

    print("26. Testing Pipeline 1 Fallback Deterministic Generator...")
    test_fallback_generator_ground_truth()
    print("   [PASSED]")

    print("27. Testing Pipeline 2 Architecture Rule (No GenAI Imports)...")
    test_pipeline2_no_genai_dependency_critical_rule()
    print("   [PASSED]")

    print("28. Testing Pipeline 2 Mandatory Coverage Calculation...")
    test_mandatory_coverage_calculation()
    print("   [PASSED]")

    print("29. Testing Pipeline 2 Source Traceability Score Formula...")
    test_source_traceability_score_calculation()
    print("   [PASSED]")

    print("30. Testing Pipeline 2 Validation Workflow & Full API Suite...")
    test_pipeline2_full_validation_workflow_and_api_routes()
    print("   [PASSED]")

    print("31. Testing Human Review Queue Retrieval...")
    test_human_review_queue_retrieval()
    print("   [PASSED]")

    print("32. Testing Human Review Action: Approve Plan...")
    test_human_review_approve_action()
    print("   [PASSED]")

    print("33. Testing Human Review Action: Reject Plan...")
    test_human_review_reject_action()
    print("   [PASSED]")

    print("34. Testing Human Review Action: Edit Plan Structure...")
    test_human_review_edit_action()
    print("   [PASSED]")

    print("35. Testing Human Review Action: Regenerate Plan via Pipeline 1...")
    test_human_review_regenerate_action()
    print("   [PASSED]")

    print("36. Testing Human Review Action: Comment & Manual Override...")
    test_human_review_comment_and_override_actions()
    print("   [PASSED]")

    print("37. Testing Final Onboarding Plan Export & Audit Trail...")
    test_final_onboarding_plan_export()
    print("   [PASSED]")

    print("38. Testing Approved Plan Assignment to Employee Learning Plan...")
    test_approved_plan_assignment()
    test_rejected_plan_cannot_be_assigned()
    print("   [PASSED]")

    print("39. Testing Employee Dashboard & Isolation Security...")
    test_employee_dashboard()
    test_employee_isolation_security()
    print("   [PASSED]")

    print("40. Testing Module, Task, and Checklist Progress Tracking...")
    test_module_progress_start_and_complete()
    test_checklist_progress_tracking()
    test_practical_task_completion()
    print("   [PASSED]")

    print("41. Testing Quiz Detail, Submission, Scoring, & Assessments...")
    test_quiz_submission_and_scoring()
    test_assessment_result()
    print("   [PASSED]")

    print("42. Testing Deterministic Progress Calculation & Status Engine...")
    test_overall_progress_calculation_formula()
    test_on_track_status()
    test_requires_attention_status()
    test_behind_schedule_status()
    test_completed_status()
    print("   [PASSED]")

    print("43. Testing Weak Area Detection & Adaptive Recommendations...")
    test_weak_area_detection_and_recommendations()
    test_upcoming_activities_and_milestones()
    print("   [PASSED]")

    print("44. Testing Manager Read-Only Access & Regression Across All Modules...")
    test_manager_read_only_access()
    test_unauthorized_employee_access()
    test_regression_all_modules()
    print("   [PASSED]")

    print("45. Testing Policy Version Change & Deterministic Detection...")
    test_new_policy_version_detection()
    print("   [PASSED]")

    print("46. Testing Requirement, Role, Plan, Module & Employee Impact Analysis...")
    test_impact_analysis_requirements_roles_plans_employees()
    print("   [PASSED]")

    print("47. Testing Unaffected Module Preservation & Selective Regeneration...")
    test_unaffected_module_preservation_and_selective_regeneration()
    print("   [PASSED]")

    print("48. Testing Pipeline 2 Revalidation & Human Review Routing...")
    test_human_review_routing_for_validation_issues()
    print("   [PASSED]")

    print("49. Testing Historical Version & Employee Progress Preservation...")
    test_historical_version_and_employee_progress_preservation()
    print("   [PASSED]")

    print("50. Testing Policy Audit Logging, Security RBAC & Full Regression...")
    test_audit_logging_and_history()
    test_rbac_security()
    test_policy_regression_all()
    print("   [PASSED]")

    print("51. Testing Phase 8 Overview Metrics (Deterministic & Zero-Denominator Safe)...")
    test_01_overview_metrics_success()
    test_02_overview_metrics_zero_denominator_safe()
    test_03_overview_metrics_rbac_denied()
    print("   [PASSED]")

    print("52. Testing Phase 8 Employee Progress Reports (Search, Filters, Sort, Pagination)...")
    test_04_employee_progress_report_default()
    test_05_employee_progress_report_search_filter()
    test_06_employee_progress_report_department_filter()
    test_07_employee_progress_report_sorting()
    test_08_employee_progress_report_pagination()
    print("   [PASSED]")

    print("53. Testing Phase 8 Role Coverage, Mandatory Training & Assessment Reports...")
    test_09_role_coverage_report()
    test_10_role_coverage_filter_role()
    test_11_role_coverage_rbac()
    test_12_mandatory_training_report()
    test_13_mandatory_training_department_filter()
    test_14_mandatory_training_optional_included()
    test_15_assessment_report_summary()
    test_16_assessment_report_filter_status()
    test_17_assessment_report_rbac()
    print("   [PASSED]")

    print("54. Testing Phase 8 Traceability, Hallucination & Policy Coverage Reports...")
    test_18_source_traceability_report()
    test_19_source_traceability_filter_doc()
    test_20_source_traceability_rbac()
    test_21_hallucination_report()
    test_22_hallucination_report_filter_type()
    test_23_hallucination_report_rbac()
    test_24_policy_coverage_report()
    test_25_policy_coverage_doc_filter()
    test_26_policy_coverage_rbac()
    print("   [PASSED]")

    print("55. Testing Phase 8 GenAI vs Python Comparison & Entity Comparison Tool...")
    test_27_genai_vs_python_comparison()
    test_28_compare_entities()
    test_29_compare_entities_rbac()
    print("   [PASSED]")

    print("56. Testing Phase 8 Multi-Format Export (CSV, Excel, PDF)...")
    test_30_export_report_csv()
    test_31_export_report_excel()
    test_32_export_report_pdf_html()
    print("   [PASSED]")

    print("57. Testing Phase 9 Prompt Injection & Adversarial Document Defenses (10 Cases)...")
    test_01_prompt_injection_admin_account_creation()
    test_02_prompt_injection_override_mandatory_status()
    test_03_prompt_injection_reveal_system_prompt()
    test_04_prompt_injection_disregard_rrm()
    test_05_prompt_injection_auto_approve_plan()
    test_06_prompt_injection_ignore_validation_failures()
    test_07_prompt_injection_reveal_confidential_info()
    test_08_prompt_injection_change_requirement_priority()
    test_09_prompt_injection_highest_priority_instruction()
    test_10_prompt_injection_code_execution_instruction()
    print("   [PASSED]")

    print("58. Testing Phase 9 RBAC & Privilege Escalation Defenses (10 Cases)...")
    test_11_rbac_employee_upload_document_denied()
    test_12_rbac_employee_modify_rrm_denied()
    test_13_rbac_employee_generate_pipeline1_denied()
    test_14_rbac_employee_trigger_pipeline2_denied()
    test_15_rbac_employee_human_review_approval_denied()
    test_16_rbac_employee_policy_impact_analysis_denied()
    test_17_rbac_employee_admin_reports_denied()
    test_18_rbac_manager_read_only_access()
    test_19_rbac_missing_user_role_defaults_to_employee()
    test_20_rbac_audit_trail_immutable()
    print("   [PASSED]")

    print("59. Testing Phase 9 Employee Data Isolation & IDOR Protection (10 Cases)...")
    test_21_idor_employee_profile_isolation()
    test_22_idor_onboarding_plan_isolation()
    test_23_idor_module_completion_isolation()
    test_24_idor_quiz_answer_submission_isolation()
    test_25_idor_weak_area_tracking_isolation()
    test_26_idor_assessment_result_isolation()
    test_27_idor_direct_api_employee_endpoint()
    test_28_idor_direct_api_plan_endpoint()
    test_29_idor_direct_api_progress_endpoint()
    test_30_idor_adaptive_recommendation_isolation()
    print("   [PASSED]")

    print("60. Testing Phase 9 Document Upload Security & Malicious File Handling (10 Cases)...")
    test_31_upload_path_traversal_filename()
    test_32_upload_malicious_executable_extension()
    test_33_upload_mime_type_mismatch()
    test_34_upload_empty_0byte_document()
    test_35_upload_oversized_document()
    test_36_upload_duplicate_content_hash()
    test_37_upload_corrupted_pdf_handling()
    test_38_upload_corrupted_docx_handling()
    test_39_xss_script_injection_in_metadata()
    test_40_health_endpoint_secure()
    print("   [PASSED]")

    print("61. Testing Phase 9 Complete Automated End-to-End Workflow...")
    test_full_end_to_end_onboardiq_lifecycle()
    print("   [PASSED]")

    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY WITH 100% SUCCESS RATE!")
except Exception as e:
    print(f"\n[TEST FAILED]: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
