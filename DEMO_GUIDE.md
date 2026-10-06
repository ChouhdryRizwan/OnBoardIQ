# OnBoardIQ — Live Product Demo Guide & Presentation Script

This document provides the official **7–10 minute step-by-step presentation guide** for demonstrating **OnBoardIQ**.

---

## Quick Start & Environment Pre-Flight

Before presenting, verify that both the backend service and Next.js frontend are active:

```bash
# 1. Start FastAPI Backend (Port 8000)
python -m uvicorn src.main:app --port 8000

# 2. Start Next.js Frontend (Port 3000)
cd frontend-next
npm run start
```

### Demo Access Credentials
Use the quick demo role buttons on `/auth/login` or log in using these credentials:

| Role | Email | Password | Primary Workspace Route |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@onboardiq.ai` | `admin123` | `/admin/dashboard` |
| **Training Manager** | `training_manager@onboardiq.ai` | `password123` | `/training/dashboard` |
| **Human Reviewer** | `reviewer@onboardiq.ai` | `password123` | `/reviewer/dashboard` |
| **Department Manager** | `manager@onboardiq.ai` | `password123` | `/manager/dashboard` |

---

## 7–10 Minute Live Demonstration Timeline

### 0:00 – 0:45 | Problem Statement & Platform Architecture
- **Script**: *"Traditional enterprise onboarding relies on static PDF SOPs and generic LMS courses. This leads to hallucinated training plans, unverified compliance, and massive manual overhead when policies change. OnBoardIQ solves this using a **Dual-Pipeline Architecture**: Pipeline 1 uses GenAI to synthesize personalized plans, while Pipeline 2 uses a 100% deterministic Python audit engine to independently enforce compliance before human review."*
- **Visual**: Show the Landing Page (`http://localhost:3000/`) and point out the Dual-Pipeline diagram.

### 0:45 – 1:30 | Document Ingestion & SOP Parsing
- **Script**: *"First, company policies, security SOPs, and compliance guidelines are ingested into the platform."*
- **Visual**: Navigate to **Document SOPs** (`/admin/documents`). Show the list of 24 ingested SOPs (`Security_Policy_v2.1.pdf`, `Data_Privacy_SOP.docx`). Click **Upload Document**, show supported file formats (PDF, DOCX, TXT, MD, CSV) and drag-and-drop file validation.

### 1:30 – 2:15 | Role & Requirement Matrix (RRM) — Ground Truth
- **Script**: *"Ingested policies are mapped into the **Role & Requirement Matrix (RRM)**, creating the immutable 'Ground Truth' for every job role in the company."*
- **Visual**: Open **RRM Workspace** (`/admin/rrm`). Filter by `Senior DevOps Engineer` or `Security Analyst`. Highlight **Mandatory Ground Truth Requirements** (55 total mandatory rules) and show source document traceability citations (document ID, version, section, page, chunk).

### 2:15 – 3:15 | Pipeline 1 — GenAI Plan Synthesis
- **Script**: *"When onboarding a new employee, Pipeline 1 uses Gemini GenAI to synthesize a multi-stage, personalized onboarding plan tailored to the employee's role and experience level."*
- **Visual**: Open **Pipeline 1** (`/admin/pipeline1`). Select a job role (`R004 - Senior DevOps Engineer`), select model (`gemini-2.5-flash`), and click **Generate Onboarding Plan**. Point out generated stages, modules, practical tasks, quizzes, and ground truth citations.

### 3:15 – 4:15 | Pipeline 2 — Deterministic Python Validation
- **Script**: *"GenAI can hallucinate or omit mandatory safety steps. That's why Pipeline 1 output is **never** assigned directly to employees. Instead, Pipeline 2 runs a 100% deterministic Python audit engine to verify 100% requirement coverage, prerequisite order, and zero missing mandatory rules."*
- **Visual**: Open **Pipeline 2** (`/admin/pipeline2`). Select the generated plan and click **Run Deterministic Audit**. Show the rule coverage score, pass/warning badges, and exact rule result breakdowns.

### 4:15 – 5:15 | Human Governance & Review Queue
- **Script**: *"Plans that pass or produce validation warnings enter the Human Review Queue for final governance."*
- **Visual**: Open **Human Review** (`/admin/human-review`). Click a pending review item. Show the **Approve**, **Reject**, **Edit**, **Regenerate**, **Comment**, and **Manual Override** actions. Demonstrate approving or editing a plan item with audit trail logging.

### 5:15 – 6:15 | Employee Learning Experience
- **Script**: *"Once approved, the onboarding plan is assigned to the employee's portal."*
- **Visual**: Log out and log in as **Employee** (`/employee/dashboard`). Open **My Onboarding Plan** (`/employee/learning`). Show active learning stages, module checklists, task evidence notes, interactive quiz questions, and score calculations.

### 6:15 – 7:15 | Policy Updates & Selective Regeneration
- **Script**: *"When a company policy changes (e.g. Security Policy updated from v1.0 to v2.0), OnBoardIQ detects affected requirements, roles, plans, and employees, performing **selective regeneration** of affected modules without resetting unaffected progress."*
- **Visual**: Log back in as **Admin** and open **Policy Updates** (`/admin/policy-updates`). Show affected requirements table, affected employees grid, and the selective regeneration execution button.

### 7:15 – 8:15 | Reports & Analytics (GenAI vs Python Comparison)
- **Script**: *"OnBoardIQ provides complete executive reporting, comparing GenAI synthesis speed against Python audit compliance scores."*
- **Visual**: Open **Reports & Analytics** (`/admin/reports`). Show Employee Progress, Role Coverage, Mandatory Training, and GenAI vs Python metrics. Click **Export CSV** to demonstrate real backend-generated report file downloads.

### 8:15 – 9:00 | Security, Prompt Injection & Audit Trail
- **Script**: *"The platform includes active prompt-injection defense during document parsing and maintains a tamper-proof audit trail for all human review decisions and policy updates."*
- **Visual**: Show prompt injection scan indicators in Document Management and audit logs in Policy Updates.

### 9:00 – 10:00 | Closing Summary
- **Script**: *"OnBoardIQ combines the creative synthesis of GenAI with the immutable precision of deterministic Python validation — delivering verifiable, traceable, and scalable enterprise employee onboarding."*

---

## Architectural Data Flow Summary

```
+------------------------+
|   COMPANY DOCUMENTS    |  (Ingested PDFs, DOCX, SOPs)
+-----------+------------+
            |
            v
+------------------------+
|    RRM GROUND TRUTH    |  (154 Requirements, 55 Mandatory Rules)
+-----------+------------+
            |
            v
+------------------------+
|      PIPELINE 1        |  (GenAI Plan Synthesis)
|   (GenAI Synthesis)    |
+-----------+------------+
            |
            v
+------------------------+
|      PIPELINE 2        |  (100% Deterministic Python Audit)
| (Python Deterministic) |
+-----------+------------+
            |
            v
+------------------------+
|     HUMAN REVIEW       |  (Reviewer Governance & Action Trail)
+-----------+------------+
            |
            v
+------------------------+
|   EMPLOYEE LEARNING    |  (Interactive Learning & Quizzes)
+-----------+------------+
            |
            v
+------------------------+
|    POLICY UPDATES      |  (Selective Regeneration Engine)
+-----------+------------+
            |
            v
+------------------------+
|  REPORTS & ANALYTICS   |  (Executive Compliance & CSV Exports)
+------------------------+
```
