from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from pathlib import Path

SQLITE_DB_PATH = Path(__file__).resolve().parents[2] / "internal_db" / "app.db"

SQLITE_DB_PATH.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    f"sqlite:///{SQLITE_DB_PATH}", connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

Base = declarative_base()
