from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy import JSON, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./onlywar.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class CharacterModel(Base):
    __tablename__ = "characters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    regiment: Mapped[str] = mapped_column(String)
    specialty: Mapped[str] = mapped_column(String)
    demeanour: Mapped[str] = mapped_column(String)

    ws: Mapped[int] = mapped_column(Integer)
    bs: Mapped[int] = mapped_column(Integer)
    s: Mapped[int] = mapped_column(Integer)
    t: Mapped[int] = mapped_column(Integer)
    ag: Mapped[int] = mapped_column(Integer)
    int_: Mapped[int] = mapped_column("int", Integer)
    per: Mapped[int] = mapped_column(Integer)
    wp: Mapped[int] = mapped_column(Integer)
    fel: Mapped[int] = mapped_column(Integer)

    current_wounds: Mapped[int] = mapped_column(Integer)
    total_wounds: Mapped[int] = mapped_column(Integer)
    current_fate: Mapped[int] = mapped_column(Integer)
    total_fate: Mapped[int] = mapped_column(Integer)
    fatigue: Mapped[int] = mapped_column(Integer, default=0)

    insanity: Mapped[int] = mapped_column(Integer, default=0)
    corruption: Mapped[int] = mapped_column(Integer, default=0)
    movement: Mapped[int] = mapped_column(Integer, default=3)

    skills: Mapped[list] = mapped_column(JSON, default=list)
    weapons: Mapped[list] = mapped_column(JSON, default=list)
    talents: Mapped[list] = mapped_column(JSON, default=list)
    armour: Mapped[dict] = mapped_column(JSON, default=dict)
    gear: Mapped[str] = mapped_column(String, default="")
    xp: Mapped[dict] = mapped_column(JSON, default=lambda: {"current": 0, "spent": 0, "total": 0})
    inventory: Mapped[dict] = mapped_column(JSON, default=dict)


class CharacterBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    regiment: str
    specialty: str
    demeanour: str
    ws: int
    bs: int
    s: int
    t: int
    ag: int
    int_: int
    per: int
    wp: int
    fel: int
    current_wounds: int
    total_wounds: int
    current_fate: int
    total_fate: int
    fatigue: int = 0
    insanity: int = 0
    corruption: int = 0
    movement: int = 3
    skills: list[dict[str, Any]] = []
    weapons: list[dict[str, Any]] = []
    talents: list[dict[str, Any]] = []
    armour: dict[str, Any] = {}
    gear: str = ""
    xp: dict[str, int] = {"current": 0, "spent": 0, "total": 0}
    inventory: dict[str, Any] = {}


class CharacterCreate(CharacterBase):
    pass


class Character(CharacterBase):
    id: int


app = FastAPI(title="Only War Dataslate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/characters/", response_model=Character)
def create_character(character: CharacterCreate, db: Session = Depends(get_db)):
    db_character = CharacterModel(**character.model_dump())
    db.add(db_character)
    db.commit()
    db.refresh(db_character)
    return db_character


@app.get("/characters/", response_model=list[Character])
def read_characters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(CharacterModel).offset(skip).limit(limit).all()


@app.get("/characters/{character_id}", response_model=Character)
def read_character(character_id: int, db: Session = Depends(get_db)):
    db_character = db.get(CharacterModel, character_id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return db_character


@app.put("/characters/{character_id}", response_model=Character)
def update_character(
    character_id: int, character: CharacterCreate, db: Session = Depends(get_db)
):
    db_character = db.get(CharacterModel, character_id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")

    for key, value in character.model_dump().items():
        setattr(db_character, key, value)

    db.commit()
    db.refresh(db_character)
    return db_character


@app.delete("/characters/{character_id}")
def delete_character(character_id: int, db: Session = Depends(get_db)):
    db_character = db.get(CharacterModel, character_id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    db.delete(db_character)
    db.commit()
    return {"ok": True}
