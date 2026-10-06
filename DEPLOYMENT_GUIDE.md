# OnBoardIQ — Production Deployment Guide

This guide details the complete production deployment architecture and workflow for deploying **OnBoardIQ**:
- **Frontend:** Next.js 16 → **Vercel**
- **Backend:** FastAPI (Python 3.12) → **Render**
- **Database:** PostgreSQL → **Render Managed PostgreSQL**
- **Source Code Management:** **GitHub** (Separate Frontend and Backend Repositories)

---

## 🏗️ System Architecture

```
                       User Browser
                            │
                            ▼
              ┌───────────────────────────┐
              │          Vercel           │
              │  Next.js 16 (Turbopack)   │
              │    (OnBoardIQ-frontend)   │
              └─────────────┬─────────────┘
                            │ HTTPS / REST (CORS)
                            │ X-User-Role / X-User-Id
                            ▼
              ┌───────────────────────────┐
              │          Render           │
              │      FastAPI Backend      │
              │    (OnBoardIQ-backend)    │
              └──────┬─────────────┬──────┘
                     │             │
        SQLAlchemy   │             │ Google Gemini API
    (psycopg2 / SSL) │             │ (Pipeline 1 Plan Gen)
                     ▼             ▼
       ┌──────────────────┐  ┌───────────┐
       │      Render      │  │ Google AI │
       │ PostgreSQL DB    │  │  Studio   │
       └──────────────────┘  └───────────┘
```

---

## 📋 Pre-Deployment Repository Structure

One GitHub repository (this root) deploys to both platforms:

| Deployment Target | Source in Repo | Configuration |
|---|---|---|
| **Render** (backend) | Repository root | `render.yaml` at root (build/start/health commands) |
| **Vercel** (frontend) | `frontend-next/` | Set **Root Directory** = `frontend-next` when importing the project |

Secrets and local artifacts are excluded by `.gitignore` (`.env`, `*.db`, `uploads/`, `node_modules/`, `.next/`).

---

## 🚀 Step 1: Backend Deployment on Render

### A. PostgreSQL Database
**Already provisioned:** Neon (pooled connection string stored in `.env`, data migrated — see Step 2).
Skip Render's managed database. Your existing connection string is used as the `DATABASE_URL` environment variable.

<details>
<summary>Alternative: Render managed PostgreSQL (only if you ever move off Neon)</summary>

1. Render Dashboard → **New +** → **PostgreSQL**.
2. Name `onboardiq-postgres`, region Oregon, plan Starter.
3. Copy the connection string and use it as `DATABASE_URL`.
</details>

### B. Deploy FastAPI Web Service
1. Push this repository to GitHub (single repo serves both platforms):
   ```bash
   git init
   git add .
   git commit -m "Initial commit of OnBoardIQ"
   git remote add origin https://github.com/<your-org>/OnBoardIQ.git
   git branch -M main
   git push -u origin main
   ```
2. In Render Dashboard, click **New +** → **Web Service**.
3. Connect the `OnBoardIQ` GitHub repository (Root Directory: leave empty — backend lives at repo root).
4. Configure service settings:
   - **Name:** `onboardiq-backend`
   - **Region:** Same region as your database (`Oregon`)
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`
5. Configure Environment Variables:
   | Key | Value | Description |
   |---|---|---|
   | `ENVIRONMENT` | `production` | Enables production mode |
   | `DATABASE_URL` | *(Your PostgreSQL connection string — Neon / Supabase / Render)* | Database connection string |
   | `CORS_ORIGINS` | `https://onboardiq.vercel.app,http://localhost:3000` | Allowed frontend domains |
   | `GEMINI_API_KEY` | *(Your Google AI Gemini API Key)* | Server-side key for Pipeline 1 |
   | `UPLOAD_DIR` | `/data/uploads` | Path for raw uploaded files |
6. *(Optional)* Add a Persistent Disk:
   - **Name:** `uploads-storage`
   - **Mount Path:** `/data/uploads`
   - **Size:** `1 GB`
7. Click **Create Web Service**.
8. Once deployed, note your service URL (e.g., `https://onboardiq-backend.onrender.com`).

---

## 📦 Step 2: Database Data Migration (SQLite → PostgreSQL: Neon / Supabase / Render)

Migrate your local evaluation dataset to the live PostgreSQL database (already done for the current Neon instance):

```bash
# Reads TARGET_DATABASE_URL from the environment, or pass --target explicitly
python scripts/migrate_sqlite_to_postgres.py --target "postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
```

> Neon: use the **pooled** connection string. Supabase: use the **Session pooler** (port 6543).

The migration script:
- Creates all 39 database tables idempotently using SQLAlchemy models.
- Migrates every table (77 employee profiles, 82 job roles, 69 company documents, 57 requirements, plans, progress and audit trails).
- Preserves all primary keys, UUIDs, relationships, JSON payloads, and audit history.
- Verifies row counts before and after migration.

---

## 🌐 Step 3: Frontend Deployment on Vercel

### A. Import the Same Repository
Vercel imports the **same** `OnBoardIQ` GitHub repository — only the root directory changes:
```bash
# No separate push needed: frontend-next/ is already part of the repo
```

### B. Deploy on Vercel
1. Log in to the [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your `OnBoardIQ` repository.
4. In **Configure Project**:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend-next`  ← important, otherwise the build fails
5. In **Environment Variables**:
   | Key | Value | Description |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://onboardiq-backend.onrender.com` | Live Render backend API URL |
6. Click **Deploy**.
7. Once deployed, copy your production domain (e.g., `https://onboardiq.vercel.app`).

### C. Update Backend CORS
In your Render Dashboard, ensure `CORS_ORIGINS` matches your Vercel domain:
```env
CORS_ORIGINS=https://onboardiq.vercel.app,http://localhost:3000
```

---

## 🔒 Security Architecture Highlights

1. **Zero Secret Exposure:**
   - `GEMINI_API_KEY` is strictly confined to the Render backend environment. It is never exposed in client-side bundles or repository commits.
   - Database credentials are fed directly via Render environment variables.
2. **Deterministic Dual-Pipeline:**
   - Pipeline 1 GenAI plan generation runs server-side with strict schema validation.
   - Pipeline 2 Python verification runs 100% deterministically without LLM dependencies.
3. **Role-Based Access Control (RBAC):**
   - Header-based tokens (`X-User-Role`, `X-User-Id`) are automatically forwarded by `fetchApi` across all requests.
   - Administrative endpoints, human reviews, and employee dashboards maintain strict tenant isolation.
4. **Health Check Monitoring:**
   - Render automatically pings `GET /health` to monitor service availability and database connectivity.
