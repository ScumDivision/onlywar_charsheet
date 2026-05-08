from __future__ import annotations

from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any, Literal, Optional

import smartcrop
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, ConfigDict
from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    create_engine,
    event,
)
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./onlywar.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@event.listens_for(Engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


class Base(DeclarativeBase):
    pass


SystemName = Literal["only_war", "rogue_trader"]


class Ship(Base):
    __tablename__ = "ships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, default="Unnamed Voidship")
    ship_class: Mapped[str] = mapped_column(String, default="")

    hull_integrity_current: Mapped[int] = mapped_column(Integer, default=0)
    hull_integrity_total: Mapped[int] = mapped_column(Integer, default=0)
    speed: Mapped[int] = mapped_column(Integer, default=0)
    manoeuvrability: Mapped[int] = mapped_column(Integer, default=0)
    detection: Mapped[int] = mapped_column(Integer, default=0)
    armour: Mapped[int] = mapped_column(Integer, default=0)
    turret_rating: Mapped[int] = mapped_column(Integer, default=0)

    crew_population: Mapped[int] = mapped_column(Integer, default=0)
    crew_rating: Mapped[str] = mapped_column(String, default="Competent")
    morale_current: Mapped[int] = mapped_column(Integer, default=0)
    morale_total: Mapped[int] = mapped_column(Integer, default=0)

    power_used: Mapped[int] = mapped_column(Integer, default=0)
    power_total: Mapped[int] = mapped_column(Integer, default=0)
    space_used: Mapped[int] = mapped_column(Integer, default=0)
    space_total: Mapped[int] = mapped_column(Integer, default=0)

    components: Mapped[list] = mapped_column(JSON, default=list)
    weapons: Mapped[list] = mapped_column(JSON, default=list)
    background: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class CharacterImage(Base):
    __tablename__ = "character_images"

    character_id: Mapped[int] = mapped_column(
        ForeignKey("characters.id", ondelete="CASCADE"), primary_key=True
    )
    data: Mapped[bytes] = mapped_column(LargeBinary)
    mime: Mapped[str] = mapped_column(String, default="image/jpeg")
    original_data: Mapped[bytes] = mapped_column(LargeBinary)
    original_mime: Mapped[str] = mapped_column(String, default="image/jpeg")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CharacterModel(Base):
    __tablename__ = "characters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    system: Mapped[str] = mapped_column(String, default="only_war")
    name: Mapped[str] = mapped_column(String, index=True)
    regiment: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    specialty: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    demeanour: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    career: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    profit_factor: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

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
    xp: Mapped[dict] = mapped_column(
        JSON, default=lambda: {"current": 0, "spent": 0, "total": 0}
    )
    inventory: Mapped[dict] = mapped_column(JSON, default=dict)

    ship_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("ships.id"), nullable=True
    )


class CharacterBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    system: SystemName = "only_war"
    name: str
    regiment: Optional[str] = None
    specialty: Optional[str] = None
    demeanour: Optional[str] = None
    career: Optional[str] = None
    profit_factor: Optional[int] = None
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
    ship_id: Optional[int] = None


class CharacterCreate(CharacterBase):
    pass


class Character(CharacterBase):
    id: int
    has_portrait: bool = False


class ShipBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = "Unnamed Voidship"
    ship_class: str = ""
    hull_integrity_current: int = 0
    hull_integrity_total: int = 0
    speed: int = 0
    manoeuvrability: int = 0
    detection: int = 0
    armour: int = 0
    turret_rating: int = 0
    crew_population: int = 0
    crew_rating: str = "Competent"
    morale_current: int = 0
    morale_total: int = 0
    power_used: int = 0
    power_total: int = 0
    space_used: int = 0
    space_total: int = 0
    components: list[dict[str, Any]] = []
    weapons: list[dict[str, Any]] = []
    background: str = ""
    notes: str = ""


class ShipCreate(ShipBase):
    pass


class ShipRead(ShipBase):
    id: int


app = FastAPI(title="Only War / Rogue Trader Dataslate API")

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


def _serialize_character(
    db_character: CharacterModel, has_portrait: bool
) -> dict[str, Any]:
    payload = {
        attr.key: getattr(db_character, attr.key)
        for attr in CharacterModel.__mapper__.column_attrs
    }
    payload["has_portrait"] = has_portrait
    return payload


def _has_portrait(db: Session, character_id: int) -> bool:
    return (
        db.query(CharacterImage.character_id)
        .filter(CharacterImage.character_id == character_id)
        .first()
        is not None
    )


@app.post("/characters/", response_model=Character)
def create_character(character: CharacterCreate, db: Session = Depends(get_db)):
    db_character = CharacterModel(**character.model_dump())
    db.add(db_character)
    db.commit()
    db.refresh(db_character)
    return _serialize_character(db_character, has_portrait=False)


@app.get("/characters/", response_model=list[Character])
def read_characters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    rows = db.query(CharacterModel).offset(skip).limit(limit).all()
    if not rows:
        return []
    portrait_ids = {
        cid
        for (cid,) in db.query(CharacterImage.character_id)
        .filter(CharacterImage.character_id.in_([r.id for r in rows]))
        .all()
    }
    return [_serialize_character(r, has_portrait=r.id in portrait_ids) for r in rows]


@app.get("/characters/{character_id}", response_model=Character)
def read_character(character_id: int, db: Session = Depends(get_db)):
    db_character = db.get(CharacterModel, character_id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return _serialize_character(db_character, has_portrait=_has_portrait(db, character_id))


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
    return _serialize_character(db_character, has_portrait=_has_portrait(db, character_id))


@app.delete("/characters/{character_id}")
def delete_character(character_id: int, db: Session = Depends(get_db)):
    db_character = db.get(CharacterModel, character_id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    db.delete(db_character)
    db.commit()
    return {"ok": True}


@app.post("/ships/", response_model=ShipRead)
def create_ship(ship: ShipCreate, db: Session = Depends(get_db)):
    db_ship = Ship(**ship.model_dump())
    db.add(db_ship)
    db.commit()
    db.refresh(db_ship)
    return db_ship


@app.get("/ships/", response_model=list[ShipRead])
def read_ships(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Ship).offset(skip).limit(limit).all()


@app.get("/ships/{ship_id}", response_model=ShipRead)
def read_ship(ship_id: int, db: Session = Depends(get_db)):
    db_ship = db.get(Ship, ship_id)
    if db_ship is None:
        raise HTTPException(status_code=404, detail="Ship not found")
    return db_ship


@app.put("/ships/{ship_id}", response_model=ShipRead)
def update_ship(ship_id: int, ship: ShipCreate, db: Session = Depends(get_db)):
    db_ship = db.get(Ship, ship_id)
    if db_ship is None:
        raise HTTPException(status_code=404, detail="Ship not found")

    for key, value in ship.model_dump().items():
        setattr(db_ship, key, value)

    db.commit()
    db.refresh(db_ship)
    return db_ship


@app.delete("/ships/{ship_id}")
def delete_ship(ship_id: int, db: Session = Depends(get_db)):
    db_ship = db.get(Ship, ship_id)
    if db_ship is None:
        raise HTTPException(status_code=404, detail="Ship not found")

    orphans = (
        db.query(CharacterModel).filter(CharacterModel.ship_id == ship_id).count()
    )
    if orphans:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete ship: {orphans} character(s) still reference it",
        )

    db.delete(db_ship)
    db.commit()
    return {"ok": True}


PORTRAIT_WIDTH = 600
PORTRAIT_HEIGHT = 800
MAX_PORTRAIT_BYTES = 10 * 1024 * 1024
ALLOWED_PORTRAIT_MIMES = {"image/jpeg", "image/png", "image/webp"}


def _autocrop_portrait(
    image_bytes: bytes,
    target_w: int = PORTRAIT_WIDTH,
    target_h: int = PORTRAIT_HEIGHT,
) -> bytes:
    try:
        img = Image.open(BytesIO(image_bytes))
        img.load()
    except (UnidentifiedImageError, OSError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}") from e

    if img.mode not in ("RGB", "RGBA", "L"):
        img = img.convert("RGB")

    result = smartcrop.SmartCrop().crop(img, target_w, target_h)
    box = result["top_crop"]
    cropped = img.crop(
        (box["x"], box["y"], box["x"] + box["width"], box["y"] + box["height"])
    ).resize((target_w, target_h), Image.LANCZOS)

    if cropped.mode != "RGB":
        cropped = cropped.convert("RGB")

    out = BytesIO()
    cropped.save(out, format="JPEG", quality=85, optimize=True)
    return out.getvalue()


def _require_character(db: Session, character_id: int) -> CharacterModel:
    db_character = db.get(CharacterModel, character_id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return db_character


@app.post("/characters/{character_id}/portrait")
async def upload_portrait(
    character_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    _require_character(db, character_id)

    if file.content_type not in ALLOWED_PORTRAIT_MIMES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image type: {file.content_type}. Use JPEG, PNG, or WebP.",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty upload")
    if len(raw) > MAX_PORTRAIT_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 10 MB limit")

    cropped = _autocrop_portrait(raw)

    existing = db.get(CharacterImage, character_id)
    if existing is None:
        db.add(
            CharacterImage(
                character_id=character_id,
                data=cropped,
                mime="image/jpeg",
                original_data=raw,
                original_mime=file.content_type,
            )
        )
    else:
        existing.data = cropped
        existing.mime = "image/jpeg"
        existing.original_data = raw
        existing.original_mime = file.content_type
        existing.created_at = datetime.utcnow()

    db.commit()
    return {
        "ok": True,
        "width": PORTRAIT_WIDTH,
        "height": PORTRAIT_HEIGHT,
        "bytes": len(cropped),
    }


@app.get("/characters/{character_id}/portrait")
def get_portrait(character_id: int, db: Session = Depends(get_db)):
    img = db.get(CharacterImage, character_id)
    if img is None:
        raise HTTPException(status_code=404, detail="No portrait set")
    return Response(content=img.data, media_type=img.mime)


@app.get("/characters/{character_id}/portrait/original")
def get_portrait_original(character_id: int, db: Session = Depends(get_db)):
    img = db.get(CharacterImage, character_id)
    if img is None:
        raise HTTPException(status_code=404, detail="No portrait set")
    return Response(content=img.original_data, media_type=img.original_mime)


@app.post("/characters/{character_id}/portrait/recrop")
def recrop_portrait(character_id: int, db: Session = Depends(get_db)):
    img = db.get(CharacterImage, character_id)
    if img is None:
        raise HTTPException(status_code=404, detail="No portrait set")
    img.data = _autocrop_portrait(img.original_data)
    img.mime = "image/jpeg"
    img.created_at = datetime.utcnow()
    db.commit()
    return {"ok": True, "bytes": len(img.data)}


@app.delete("/characters/{character_id}/portrait")
def delete_portrait(character_id: int, db: Session = Depends(get_db)):
    img = db.get(CharacterImage, character_id)
    if img is None:
        raise HTTPException(status_code=404, detail="No portrait set")
    db.delete(img)
    db.commit()
    return {"ok": True}


# Serve the built frontend (vite dist) at the root if it exists.
# Mounted last so the API routes above always take precedence.
DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if DIST_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="frontend")
