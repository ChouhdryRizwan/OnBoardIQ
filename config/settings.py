import os

# Load .env file if present (local development). Never overrides real environment
# variables set by the hosting platform (Render/Vercel).
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Settings:
    APP_NAME: str = "OnBoardIQ"
    API_V1_STR: str = "/api"
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Upload settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.getcwd(), "uploads"))
    MAX_FILE_SIZE_BYTES: int = int(os.getenv("MAX_FILE_SIZE_BYTES", str(25 * 1024 * 1024)))  # 25 MB max limit
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx", ".txt", ".md", ".csv"}
    
    # Database Settings (Defaults to local SQLite if Postgres URL not set)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.getcwd(), 'skillsprint.db')}"
    )

    # CORS Settings (Multi-origin support for Vercel and local dev)
    @property
    def cors_origins(self) -> list:
        raw = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
        )
        origins = [o.strip() for o in raw.split(",") if o.strip()]
        return origins

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
