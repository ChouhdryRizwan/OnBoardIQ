from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.session import init_db
from src.routes.documents import router as documents_router
from src.routes.role_matrix_routes import router as role_matrix_router
from src.routes.employee_routes import router as employee_router
from src.routes.pipeline1_routes import router as pipeline1_router
from src.routes.pipeline2_routes import router as pipeline2_router
from src.routes.human_review_routes import router as human_review_router
from src.routes.employee_learning_routes import router as employee_learning_router
from src.routes.policy_update_routes import router as policy_update_router
from src.routes.reports_routes import router as reports_router
from src.routes.user_routes import router as user_router

from config.settings import settings

app = FastAPI(
    title="OnBoardIQ — Training & Onboarding Intelligence API",
    description="Dual-Pipeline Generative AI & Deterministic Python Validation Backend",
    version="1.0.0"
)

# Enable CORS for frontend integration (Vercel production and local development)
cors_origins = settings.cors_origins
allow_all = "*" in cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else cors_origins,
    allow_credentials=False if allow_all else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database Tables
@app.on_event("startup")
def on_startup():
    init_db()

# Include Routers
app.include_router(documents_router, prefix="/api")
app.include_router(role_matrix_router, prefix="/api")
app.include_router(employee_router)
app.include_router(pipeline1_router, prefix="/api")
app.include_router(pipeline2_router, prefix="/api")
app.include_router(human_review_router, prefix="/api")
app.include_router(employee_learning_router, prefix="/api")
app.include_router(policy_update_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(user_router, prefix="/api")

from fastapi.responses import HTMLResponse
import os

@app.get("/admin/documents", response_class=HTMLResponse)
@app.get("/documents-ui", response_class=HTMLResponse)
def admin_documents_page():
    """Serves the Admin Document Management UI Page."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "admin_documents.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Admin Document Management UI File Not Found</h1>"

@app.get("/admin/rrm", response_class=HTMLResponse)
@app.get("/rrm-ui", response_class=HTMLResponse)
def admin_rrm_page():
    """Serves the Admin Role Requirement Matrix (RRM) UI Page."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "admin_rrm.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Admin RRM UI File Not Found</h1>"

@app.get("/admin/pipeline1", response_class=HTMLResponse)
@app.get("/pipeline1-ui", response_class=HTMLResponse)
def admin_pipeline1_page():
    """Serves the Admin Pipeline 1 GenAI Plan Generator UI Page."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "admin_pipeline1.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Admin Pipeline 1 UI File Not Found</h1>"

@app.get("/admin/pipeline2", response_class=HTMLResponse)
@app.get("/pipeline2-ui", response_class=HTMLResponse)
def admin_pipeline2_page():
    """Serves the Admin Pipeline 2 Python Validation Engine UI Page."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "admin_pipeline2.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Admin Pipeline 2 UI File Not Found</h1>"

@app.get("/admin/human-review", response_class=HTMLResponse)
@app.get("/human-review-ui", response_class=HTMLResponse)
def admin_human_review_page():
    """Serves the Admin Human Review Workspace UI Page."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "admin_human_review.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Admin Human Review UI File Not Found</h1>"

@app.get("/employee/dashboard", response_class=HTMLResponse)
@app.get("/employee-ui", response_class=HTMLResponse)
def employee_dashboard_page():
    """Serves the Employee Learning Dashboard UI Page."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "employee_dashboard.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Employee Dashboard UI File Not Found</h1>"

@app.get("/admin/policy-updates", response_class=HTMLResponse)
@app.get("/policy-updates-ui", response_class=HTMLResponse)
def admin_policy_updates_page():
    """Serves the Admin Policy Impact & Selective Regeneration Dashboard UI Page."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "admin_policy_updates.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Admin Policy Updates UI File Not Found</h1>"

@app.get("/admin/reports", response_class=HTMLResponse)
@app.get("/reports-ui", response_class=HTMLResponse)
def admin_reports_page():
    """Serves the Admin Reports & Analytics Workspace UI Page."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "admin_reports.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Admin Reports & Analytics UI File Not Found</h1>"

@app.get("/")
def root():
    return {
        "app": "OnBoardIQ",
        "theme": "OnboardVerse",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "admin_documents_ui": "/admin/documents",
        "admin_rrm_ui": "/admin/rrm",
        "admin_pipeline1_ui": "/admin/pipeline1",
        "admin_pipeline2_ui": "/admin/pipeline2",
        "admin_human_review_ui": "/admin/human-review",
        "employee_dashboard_ui": "/employee/dashboard",
        "admin_policy_updates_ui": "/admin/policy-updates",
        "admin_reports_ui": "/admin/reports",
        "health_check": "/health"
    }

@app.get("/health")
def health_check():
    """Health / System Check endpoint (Requirements 21)."""
    return {
        "status": "healthy",
        "service": "OnBoardIQ Backend",
        "version": "1.0.0",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    reload_flag = settings.ENVIRONMENT == "development"
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=reload_flag)



