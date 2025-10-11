import os
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local.db")
engine = create_engine(DATABASE_URL, future=True, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

def init_db():
    # For demo: ensure minimal tables exist if using SQLite. In Postgres, run schema.sql.
    with engine.begin() as conn:
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS message (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT,
          role TEXT NOT NULL,
          content TEXT
        );
        """))

def get_session() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

DBSessionDep = get_session
