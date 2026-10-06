# OnBoardIQ — Feature Matrix & Requirements Capability Mapping

## 1. Feature Status Summary

| Capability Module | Status | Implemented Components |
| :--- | :---: | :--- |
| **Document Management** | `PASS` | Multipart file upload (PDF/Word/MD/TXT), MIME validation, hash deduplication, versioning, chunking, precedence rank |
| **Role & Requirement Matrix (RRM)** | `PASS` | 29 active job roles, 154 requirements, 55 mandatory flags, source traceability links, role-requirement mapping |
| **Pipeline 1 — GenAI Synthesis** | `PASS` | Gemini API integration (`gemini-2.5-flash`/`pro`), prompt versioning, structured JSON schema, prompt injection defense |
| **Pipeline 2 — Python Validation** | `PASS` | 100% deterministic Python engine, mandatory coverage check, source traceability check, hallucination & contradiction detection |
| **Human Review Workspace** | `PASS` | Queue management, side-by-side diff, approval/rejection workflows, comment trail, manual override with audit logging |
| **Employee Learning Workspace** | `PASS` | Assigned plan roadmap, module view, practical task execution, quiz assessments, overall progress calculation, status badges |
| **Policy Update Engine** | `PASS` | Change detection, deterministic impact analysis, selective module regeneration, employee progress preservation |
| **Reports & Analytics** | `PASS` | 9 report views (Overview, Employee Progress, Role Coverage, Mandatory Compliance, Assessments, Traceability, Validation Quality, Policy Coverage, GenAI vs Python), CSV/Excel export |
| **Security & RBAC** | `PASS` | Server-side `X-User-Role` validation, employee data isolation (IDOR), path traversal defense, file size limits, prompt injection shield |

---

## 2. Platform Limitations & Production Hardening Roadmap

| Domain | Current Evaluation State | Production Roadmap Recommendation |
| :--- | :--- | :--- |
| **Authentication** | Header-based identity context (`X-User-Role`, `X-User-Id`) | OAuth2 / OpenID Connect JWT Bearer Token Auth |
| **Manager Scope** | Department-level access control | Team hierarchy mapping (`manager_id` FK isolation) |
| **Vector Search** | SQLite relational chunk matching | Vector database (pgvector / Qdrant) for RAG embeddings |
| **Transport** | HTTP / localhost | Enforced HTTPS / TLS 1.3 with HSTS headers |
