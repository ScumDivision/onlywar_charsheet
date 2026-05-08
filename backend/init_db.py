"""Bootstrap helper: bring onlywar.db to head revision.

- Fresh DB                     -> alembic upgrade head
- Pre-Alembic DB (no version)  -> stamp 0001, then upgrade head
- Already-versioned DB         -> upgrade head (no-op if at head)
"""
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

DB_FILE = Path(__file__).parent / "onlywar.db"
ALEMBIC_INI = Path(__file__).parent / "alembic.ini"


def main() -> None:
    cfg = Config(str(ALEMBIC_INI))
    engine = create_engine(f"sqlite:///{DB_FILE}")
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    if "characters" in tables and "alembic_version" not in tables:
        print("Pre-Alembic DB detected. Stamping at 0001 ...")
        command.stamp(cfg, "0001")

    print("Running alembic upgrade head ...")
    command.upgrade(cfg, "head")
    print("DB is at head.")


if __name__ == "__main__":
    main()
