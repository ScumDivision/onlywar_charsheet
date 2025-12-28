from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware

# Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./onlywar.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class CharacterModel(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    regiment = Column(String)
    specialty = Column(String)
    demeanour = Column(String)
    
    # Characteristics
    ws = Column(Integer) # Weapon Skill
    bs = Column(Integer) # Ballistic Skill
    s = Column(Integer)  # Strength
    t = Column(Integer)  # Toughness
    ag = Column(Integer) # Agility
    int_ = Column(Integer, name="int") # Intelligence (reserved keyword)
    per = Column(Integer) # Perception
    wp = Column(Integer) # Willpower
    fel = Column(Integer) # Fellowship
    
    # Vitals
    current_wounds = Column(Integer)
    total_wounds = Column(Integer)
    current_fate = Column(Integer)
    total_fate = Column(Integer)
    fatigue = Column(Integer, default=0)
    
    # New Vitals
    insanity = Column(Integer, default=0)
    corruption = Column(Integer, default=0)
    movement = Column(Integer, default=3) # Base Half-Move
    
    # JSON Blobs
    skills = Column(JSON, default=[])
    weapons = Column(JSON, default=[])
    talents = Column(JSON, default=[])
    armour = Column(JSON, default={})
    gear = Column(String, default="")
    xp = Column(JSON, default={"current": 0, "spent": 0, "total": 0})
    inventory = Column(JSON, default={})

Base.metadata.create_all(bind=engine)

# Pydantic Schemas
class CharacterBase(BaseModel):
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
    fatigue: int
    insanity: int = 0
    corruption: int = 0
    movement: int = 3
    skills: List[Dict[str, Any]] = []
    weapons: List[Dict[str, Any]] = []
    talents: List[Dict[str, Any]] = []
    armour: Dict[str, Any] = {}
    gear: str = ""
    xp: Dict[str, int] = {"current": 0, "spent": 0, "total": 0}
    inventory: Dict[str, Any] = {}

    class Config:
        orm_mode = True

class CharacterCreate(CharacterBase):
    pass

class Character(CharacterBase):
    id: int

# FastAPI App
app = FastAPI(title="Only War Dataslate API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
@app.post("/characters/", response_model=Character)
def create_character(character: CharacterCreate, db: Session = Depends(get_db)):
    db_character = CharacterModel(**character.dict())
    db.add(db_character)
    db.commit()
    db.refresh(db_character)
    return db_character

@app.get("/characters/", response_model=List[Character])
def read_characters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(CharacterModel).offset(skip).limit(limit).all()

@app.get("/characters/{character_id}", response_model=Character)
def read_character(character_id: int, db: Session = Depends(get_db)):
    db_character = db.query(CharacterModel).filter(CharacterModel.id == character_id).first()
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return db_character

@app.put("/characters/{character_id}", response_model=Character)
def update_character(character_id: int, character: CharacterCreate, db: Session = Depends(get_db)):
    db_character = db.query(CharacterModel).filter(CharacterModel.id == character_id).first()
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    
    for key, value in character.dict().items():
        setattr(db_character, key, value)
    
    db.commit()
    db.refresh(db_character)
    return db_character

@app.delete("/characters/{character_id}")
def delete_character(character_id: int, db: Session = Depends(get_db)):
    db_character = db.query(CharacterModel).filter(CharacterModel.id == character_id).first()
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    db.delete(db_character)
    db.commit()
    return {"ok": True}
