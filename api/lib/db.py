from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local.db")

engine = create_engine(DATABASE_URL, future=True, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

def init_db():
    # Detect dialect to use correct auto-increment syntax
    is_sqlite = DATABASE_URL.startswith("sqlite")
    id_col = "INTEGER PRIMARY KEY AUTOINCREMENT" if is_sqlite else "SERIAL PRIMARY KEY"
    create_stmt = f"""
    CREATE TABLE IF NOT EXISTS message (
        id {id_col},
        session_id TEXT,
        role TEXT NOT NULL,
        content TEXT
    );
    """
    with engine.begin() as conn:
        conn.execute(text(create_stmt))

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

DBSessionDep = get_session
