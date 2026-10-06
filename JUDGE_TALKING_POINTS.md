# OnBoardIQ — Talking Points & Platform Pitch Guide

## 1. Executive Summary: What Problem OnBoardIQ Solves
Enterprise onboarding and compliance training are traditionally slow, fragmented, and vulnerable to policy drift. Traditional LMS platforms rely on static courseware that quickly becomes outdated when company policies change. 

**OnBoardIQ** automates end-to-end employee onboarding through a **Dual-Pipeline Architecture** that combines the creative generative power of Gemini LLM with the strict, unyielding precision of a deterministic Python validation engine.

---

## 2. Key Architecture Pillars

### 🎯 1. Role & Requirement Matrix (RRM) as Ground Truth
- The RRM defines the single source of truth for every job role, mapping regulatory rules, mandatory compliance clauses, and role-specific competencies directly to ingested company policy documents.
- No onboarding plan can be generated without strict traceability back to active RRM ground-truth requirements.

### 🤖 2. Pipeline 1: GenAI Onboarding Synthesis
- Leverages Gemini LLM to synthesize personalized, structured onboarding plans (stages, modules, practical tasks, rubrics, and quizzes).
- Generates rich educational content tailored to job roles while citing ground-truth source documents.
- Treats ingested policies strictly as data, neutralizing prompt injection attacks.

### 🛡️ 3. Pipeline 2: 100% Deterministic Python Validation Engine
- **Zero GenAI Dependency**: Pipeline 2 does NOT use another LLM to approve GenAI output. It uses pure Python verification rules.
- **Strict Verification Checks**:
  1. Mandatory Requirement Coverage (100% required)
  2. Source Traceability (Document ID, Version, Section ID, Paragraph)
  3. Hallucination & Unsupported Claim Detection
  4. Contradiction & Duplicate Detection
  5. Policy Version Staleness Detection
- If Pipeline 2 detects any rule violation, the plan is immediately flagged and routed to Human Review.

### 👤 4. Human Review & Manual Override Workspace
- Subject Matter Experts (SMEs) and compliance officers inspect flagged plans with side-by-side diffs.
- Allows approving, rejecting, editing, or executing manual overrides with an immutable audit trail (`review_audit_trail`).

### 🔄 5. Policy Updates & Selective Regeneration Engine
- When a company document is updated (e.g. `DOC-POL-001` v0 $\rightarrow$ v2), OnBoardIQ executes **deterministic impact analysis** across RRM, roles, and plans.
- **Selective Regeneration**: Only affected modules linked to updated policy clauses are re-synthesized via Pipeline 1 and re-validated via Pipeline 2. Unaffected modules remain intact.
- **Progress Preservation**: Employee learning progress (e.g., completed tasks, quiz scores) is strictly preserved during plan updates.

---

## 3. Key Demo Highlights

1. **29 Active Roles & 24 Policy Documents**: Fully pre-populated enterprise dataset in live SQLite database.
2. **Deterministic Compliance (55 Mandatory Reqs)**: 100% coverage verification.
3. **Prompt Injection Defense**: Ingested policies containing adversarial payloads (e.g., `"IGNORE INSTRUCTIONS"`) are safely treated as passive data.
4. **Dark SaaS Enterprise UI**: Consistent OnBoardIQ slate theme (`bg-slate-900`, `border-slate-800`, `font-mono` IDs).
5. **Unified Reports & Analytics Workspace**: 9 live report views with instant CSV/Excel export.
