import os
import sys

# 1. Force test execution to use dedicated test_skillsprint.db
# This guarantees skillsprint.db (the live competition/demo DB) is NEVER dropped or modified by pytest.
TEST_DB_PATH = os.path.join(os.getcwd(), "test_skillsprint.db")
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

import pytest
from config.settings import settings
from database.session import engine, init_db
from database.models import Base

# Assert that settings.DATABASE_URL and engine are using test_skillsprint.db, NOT skillsprint.db
assert "test_skillsprint.db" in settings.DATABASE_URL, f"DATABASE_URL is not pointing to test_skillsprint.db: {settings.DATABASE_URL}"
assert "test_skillsprint.db" in str(engine.url), f"Engine is not pointing to test_skillsprint.db: {engine.url}"

@pytest.fixture(autouse=True, scope="module")
def reset_database():
    """Ensure clean database for every test module on isolated test_skillsprint.db."""
    # Extra safety check: fail fast if engine ever points to production/demo skillsprint.db
    if "skillsprint.db" in str(engine.url) and "test_skillsprint.db" not in str(engine.url):
        raise RuntimeError(f"CRITICAL SAFETY VIOLATION: Test fixture attempted to reset production DB: {engine.url}")

    Base.metadata.drop_all(bind=engine)
    init_db()

