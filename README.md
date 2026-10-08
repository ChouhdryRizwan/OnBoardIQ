# OnBoardIQ — Enterprise Onboarding & Verification Engine

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-emerald.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

OnBoardIQ is an enterprise-grade corporate onboarding & training intelligence engine powered by a **Dual-Pipeline Architecture**:
1. **Pipeline 1**: Generative AI Generation Pipeline (Ingests employee profiles, ground-truth role matrices & company policy documents to generate personalized, multi-stage onboarding plans with 100% source document traceability).
2. **Pipeline 2**: Independent Deterministic Python Verification Engine (100% non-LLM Python audit engine that verifies mandatory coverage, source traceability, and precedence consistency).

---

## 🌐 Live Deployment

| Service | Stack | URL |
|---|---|---|
| **Frontend** | Next.js on Vercel | **https://on-board-iq-rho.vercel.app** |
| **Backend API** | FastAPI on Render | **https://onboardiq-gp3c.onrender.com** |
| **API Docs** | Swagger UI | https://onboardiq-gp3c.onrender.com/docs |
| **Health Check** | `/health` | https://onboardiq-gp3c.onrender.com/health |

> Database: **Neon Serverless PostgreSQL**. The frontend is configured to call the Render backend (`https://onboardiq-gp3c.onrender.com`).

---

## ⚡ Core Architecture & Workflow Lifecycle

```
Company Documents & RRM Ground-Truth
                ↓
    Pipeline 1 (GenAI Generation)
                ↓
  Pipeline 2 (Ground-Truth Audit)
                ↓
Human Review, Approval & Override
                ↓
   Employee Learning Plan & Dashboard
                ↓
   Policy Update & Impact Analysis
                ↓
     Selective Regeneration Engine
                ↓
   Pipeline 1 → Pipeline 2 → Human Review → Publish
```

---

## 🔄 Policy Update Detection, Impact Analysis & Selective Regeneration

When a new document version is uploaded or activated, OnBoardIQ executes a 100% deterministic version comparison and impact analysis workflow.

### 1. Deterministic Version & Change Detection
- **No GenAI for Metadata**: Version detection compares document metadata, section IDs, chunk hashes, and paragraph references deterministically.
- Previous versions are automatically marked `OBSOLETE` when a new version is set to `ACTIVE`.

### 2. Requirement & Plan Impact Analysis
- Identifies affected RRM requirements and roles citing the updated policy.
- Locates onboarding plans using affected requirements and marks affected modules as `outdated`.
- Identifies assigned employees without erasing historical completion records.

### 3. Selective Module Regeneration Engine
- **Targeted Regeneration**: Only affected modules are regenerated via Pipeline 1. Unaffected modules and plans remain 100% untouched.
- **Mandatory Revalidation**: Every regenerated module is independently validated by Pipeline 2.
- **Human Review Routing**: If Pipeline 2 identifies validation warnings or issues, the module is routed to `ManualReviewQueue` before publishing.
- **Historical Preservation**: Employee quiz attempts, task submissions, and completion history are preserved.

### 4. Policy Audit Event Trail
Recorded audit events: `POLICY_VERSION_CREATED`, `POLICY_VERSION_ACTIVATED`, `POLICY_CHANGE_DETECTED`, `IMPACT_ANALYSIS_COMPLETED`, `MODULE_MARKED_OUTDATED`, `REGENERATION_REQUESTED`, `MODULE_REGENERATED`, `REVALIDATION_COMPLETED`, `REVIEW_REQUIRED`, `MODULE_APPROVED`, `MODULE_PUBLISHED`.

---

## 📊 Progress Calculation & Status Rules Formula

Calculated deterministically by `learning_engine/progress_calculator.py` using `config/progress_rules.json`:

$$\text{Overall Progress (\%)} = (0.40 \times \text{Module Progress}) + (0.30 \times \text{Task Progress}) + (0.15 \times \text{Checklist Progress}) + (0.15 \times \text{Quiz/Assessment Score})$$

### Deterministic Status Definitions:
- **`Completed`**: $100\%$ overall progress AND all assigned modules and practical tasks completed.
- **`Assessment Required`**: A practical task assessment or quiz is pending evaluation.
- **`Behind Schedule`**: Assigned activities have passed target completion timelines ($> 7$ days grace period).
- **`Requires Attention`**: Average quiz score $< 70\%$ or progress completion is stalled.
- **`On Track`**: Progress is proceeding within expected schedule and quality standards.

---

## 💡 Weak Area Signals & Adaptive Recommendations

- **Signals**: Quiz score $< 70\%$, failed practical assessment, or overdue task.
- **Explainable Recommendations**: Generates explainable action recommendations (e.g., `"Complete revision module: [Module Title]"` because `"Quiz score was [Score]%, below 80% passing threshold."`).

---

## 🔒 Security & RBAC Enforcement

- **Employee Isolation**: Employees can only view and update their own learning progress data.
- **Forbidden Operations for Employees**: Employees cannot modify their role, modify RRM, modify approved plan structures, approve/reject plans, override validation, or trigger policy regeneration (HTTP 403 Forbidden).
- **Manager Access**: Authorized managers have read-only visibility into their employees' progress summaries via `/api/employee/manager/employee/{id}/progress`.

---

## ⚡ API Endpoints Summary

### Policy Updates (`/api/policy-updates`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/policy-updates/policies/{doc_id}/versions/{version}/impact-analysis` | Trigger deterministic policy impact analysis. |
| `GET` | `/api/policy-updates/{update_id}` | Retrieve policy update summary and metrics. |
| `GET` | `/api/policy-updates/{update_id}/requirements` | List affected RRM requirements and roles. |
| `GET` | `/api/policy-updates/{update_id}/plans` | List affected onboarding plans. |
| `GET` | `/api/policy-updates/{update_id}/employees` | List affected employees and current progress. |
| `POST` | `/api/policy-updates/{update_id}/regenerate` | Trigger selective module regeneration via Pipeline 1 & Pipeline 2. |
| `GET` | `/api/policy-updates/{update_id}/history` | Retrieve full audit event history log. |

### Employee Learning (`/api/employee`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/employee/me/dashboard` | Employee Learning Dashboard metrics and current stage. |
| `GET` | `/api/employee/me/modules` | List assigned learning modules with progress. |
| `POST` | `/api/employee/me/modules/{id}/complete` | Mark module completed and recalculate progress. |
| `GET` | `/api/employee/me/quizzes/{id}` | Get quiz without exposing correct answers before submission. |
| `POST` | `/api/employee/me/quizzes/{id}/submit` | Submit quiz answer, calculate score, and log attempt. |
| `GET` | `/api/employee/manager/employee/{id}/progress` | Manager read-only employee progress overview. |

---

## 🖥️ UI Dashboards

- **Admin Document Management**: 👉 `http://localhost:8000/admin/documents`
- **Admin Role Requirement Matrix (RRM)**: 👉 `http://localhost:8000/admin/rrm`
- **Admin Pipeline 1 Plan Generator**: 👉 `http://localhost:8000/admin/pipeline1`
- **Admin Pipeline 2 Validation Engine**: 👉 `http://localhost:8000/admin/pipeline2`
- **Admin Human Review Workspace**: 👉 `http://localhost:8000/admin/human-review`
- **Employee Learning Portal**: 👉 `http://localhost:8000/employee/dashboard`
- **Admin Policy Impact & Selective Regeneration**: 👉 `http://localhost:8000/admin/policy-updates`

---

## 🧪 Testing & Verification

### Run Full System Suite (50 Custom Test Categories)
```bash
python run_tests.py
```

### Run Tests via Pytest (141 Tests Across All Modules)
```bash
python -m pytest -v
```

### Start Server
```bash
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```
