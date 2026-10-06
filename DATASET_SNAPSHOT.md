# OnBoardIQ — Live Dataset Snapshot

## 1. Executive Summary
This document provides the authoritative, frozen snapshot of the live database (`skillsprint.db`) at the conclusion of all end-to-end verification workflows.

---

## 2. Core Entity Metrics & Dataset Baseline

| Entity Type | Count | Description / Scope |
| :--- | :---: | :--- |
| **Employees** | `29` | Active employee profiles across Engineering, Security, Operations, Product, HR, Finance |
| **Job Roles** | `29` | Active configured job roles mapped to Ground Truth RRM requirements |
| **Company Documents** | `24` | Ingested policy and compliance documents in the ground-truth repository |
| **Document Version Delta (>v1)** | `10` | Policy documents with version changes (e.g. `DOC-POL-001` v0 $\rightarrow$ v2) |
| **Document Chunks** | `44` | Ingested policy sections and vector-ready chunks with precise paragraph citations |
| **RRM Requirements** | `154` | Ground-truth Role & Requirement Matrix items |
| **Mandatory Requirements** | `55` | Strict compliance requirements requiring mandatory inclusion & verification |
| **Onboarding Plans** | `17` | Generated onboarding plans across active job roles |
| **Learning Modules** | `71` | Individual learning modules synthesized by Pipeline 1 |
| **Practical Tasks** | `61` | Hands-on practical tasks linked to source policy clauses |
| **Module Quizzes** | `61` | Quiz assessments with pass threshold criteria |
| **Quiz Attempts** | `1` | Test quiz submission record for employee progress verification |
| **Manual Review Queue** | `4` | Pipeline 2 validation flags (3 pending review items, 1 verified manual override) |
| **Policy Update Records** | `1` | Analyzed policy impact record (`DOC-POL-001` v2 impact analysis) |
| **Policy Audit Events** | `12` | Immutable audit events tracking detection, impact, selective regeneration, and review |

---

## 3. Verified Test Employee Baseline

- **Employee Name**: Security User inj2
- **Employee ID**: `300c3d2c-8901-46bd-b7f1-730a58bf5dce`
- **Department**: IT Security
- **Role Code / Title**: `ROLE_SEC_inj2` / Sec Title inj2
- **Assigned Plan ID**: `7e8cc594-f9a4-4e3c-924d-7fc7dbee705d` (`ROLE-DEVOPS` verified plan)
- **Overall Progress**: **19.67%**
- **Completed Modules**: **1 / 15** (`1bee9a3d-191e-484f-b2cc-4ef111e5c10b`)
- **Completed Tasks**: **1 / 15** (`ad938c62-c26b-4a4e-9f8c-db881961d0ef`)
- **Quiz Score**: **100%** (Module Quiz score recorded)

---

## 4. Policy Update & Selective Regeneration Baseline

- **Analyzed Update ID**: `07001559-69ec-4e47-b972-0082cc172a0c`
- **Source Policy Document**: `DOC-POL-001` ("Corporate Policy Standard #1 (Revised)", v0 $\rightarrow$ v2)
- **Affected RRM Requirements**: 8 requirements (`REQ-EVAL-001`, `REQ-EVAL-021`, `REQ-EVAL-041`, `REQ-EVAL-061`, `REQ-EVAL-081`, `REQ-EVAL-101`, `REQ-EVAL-121`, `REQ-EVAL-141`)
- **Affected Onboarding Plans**: 3 plans (`d9cd542e-...`, `6acbb8a3-...`, `e15b9d2a-...`)
- **Affected Modules**: 3 modules
- **Regeneration Status**: `review_required` (3 regenerated modules queued for Pipeline 2 re-validation)
