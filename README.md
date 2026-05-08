# Only War / Rogue Trader Dataslate

A grimdark character-sheet web app for the FFG Warhammer 40,000 d100 RPGs.
Started as an Only War sheet, now also covers Rogue Trader (with minimal
ship management). Single-user, self-hosted.

See [`CHANGELOG.md`](./CHANGELOG.md) for the full feature history.

## Highlights

- **Two systems, one engine.** OW and RT are first-class peers — same
  9 characteristics and d100 roll-under, system-specific fields (Regiment
  vs. Career, Profit Factor vs. nothing) shown conditionally. The new-
  character modal picks the system; switching between them re-skins the
  whole UI.
- **Theming.** Only War uses a phosphor-green dataslate look; Rogue Trader
  switches to the von Moehrder dynasty heraldry palette (orange × petrol
  blue × brass gold) via a `data-theme` attribute, with no markup changes.
- **D100 dice roller** with DoS/DoF, modifier input, color-coded feedback,
  particle effects on crits, and a session vox-log. The vox-log is also
  persisted onto the character (last 100 rolls) and rehydrated on load —
  useful when sessions are months apart.
- **Bilingual DE/EN** with the full sheet translated; toggle in the
  control bar. German is the default.
- **Character portraits** auto-cropped to 600×800 server-side via smartcrop,
  with a recrop button that goes back to the untouched original.
- **Voidship management (RT only)**: hull/speed/armour/turret stats, crew
  population + morale, power/space budgets, modular components, ship-
  weapon batteries, background, captain's notes.
- **Built for long campaigns.** Each character carries a Captain's Log
  (multi-entry with Imperial dates), an NPC Roster (filterable, with
  disposition tags), an Injuries & Trauma log, and Companions (collapsible
  mini-statblocks for servitors, gyrinx, etc.). Ships carry a Manifest with
  Crew & Guests, Cargo & Loot, and Prisoners.

## Project structure

```
onlywar/
├── backend/                  FastAPI + SQLAlchemy 2.0 / Pydantic v2 / Alembic
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/         0001 → 0005, schema source of truth
│   ├── alembic.ini
│   ├── init_db.py            Idempotent bootstrap (stamps / migrates / no-op)
│   ├── main.py               Models, Pydantic schemas, routes, portrait pipeline
│   ├── requirements.txt
│   └── onlywar.db            SQLite (gitignored, generated on first run)
├── frontend/                 React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── CharacterSheet.jsx   The big one — sheet + sections
│   │   │   ├── ShipSheet.jsx        RT bridge view
│   │   │   ├── DiceRoller.jsx       Single-stat d100 button
│   │   │   ├── DiceLog.jsx          Right-side vox-log panel
│   │   │   ├── Portrait.jsx         Drag-and-drop + recrop UI
│   │   │   └── ParticleEffects.jsx  Crit feedback shader
│   │   ├── context/
│   │   │   └── GameContext.jsx      State, API calls, i18n strings
│   │   ├── App.jsx
│   │   └── index.css                Theme overrides for [data-theme="rt"]
│   ├── tailwind.config.js
│   └── package.json
├── CHANGELOG.md
└── README.md
```

## Local development

### Backend

```bash
conda create -n onlywar_env python=3.9 -y
conda activate onlywar_env
cd backend
pip install -r requirements.txt
python init_db.py              # bootstraps / migrates the SQLite DB
uvicorn main:app --reload --port 8000
```

API at `http://localhost:8000`. Routes are mounted before the static frontend,
so `/characters/`, `/ships/`, and `/characters/{id}/portrait` always win.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dev server at `http://localhost:5173`. It reads `VITE_API_URL` from
`.env.development` (point it at the dev backend).

## Database & migrations

Schema is fully Alembic-managed.

```bash
cd backend
alembic upgrade head           # apply pending migrations
alembic current                # what's applied
alembic history --verbose      # full timeline
```

`init_db.py` wraps `alembic upgrade head` and is also called by the
production systemd unit's `ExecStartPre`, so a `systemctl restart` is
sufficient to land schema changes in prod.

When adding a feature:

1. Edit `backend/main.py` — add the column on the `Mapped[…]` model and the
   field on the matching Pydantic schema.
2. Create `backend/alembic/versions/000N_<slug>.py` (use `op.batch_alter_table`
   for SQLite-friendly DDL, set `server_default` so existing rows get a value).
3. Add the field to `owDefault` / `rtDefault` / `blankShip` in `GameContext`
   and defensive normalization in `normalizeLoadedCharacter` /
   `normalizeLoadedShip`.

## Production deploy

The app runs on a Proxmox LXC. Backend mounts the built Vite `dist` at root
(`/`), so the same uvicorn serves both API and frontend on port 8000.

From the project root on the LXC:

```bash
git pull
cd frontend && npm ci && npm run build
systemctl restart onlywar      # ExecStartPre runs init_db.py → migrations
```

The systemd unit lives at `/etc/systemd/system/onlywar.service` and runs
`uvicorn main:app --host 0.0.0.0 --port 8000 --proxy-headers` from
`/opt/onlywar/backend/.venv/`.

## Features at a glance

| Section                   | Where               | OW    | RT    |
| ------------------------- | ------------------- | ----- | ----- |
| Identity + portrait       | top of sheet        | ✓     | ✓     |
| 9 characteristics         | left col            | ✓     | ✓     |
| Skills (with +0 to +60)   | left col            | ✓     | ✓     |
| Weapons (card layout)     | left col            | ✓     | ✓     |
| Talents & Traits          | left col            | ✓     | ✓     |
| Companions                | left col            | ✓     | ✓     |
| Vitals & Condition        | right col           | ✓     | ✓     |
| Armour by location        | right col           | ✓     | ✓     |
| Injuries & Trauma         | right col           | ✓     | ✓     |
| Gear (textarea)           | right col           | ✓     | ✓     |
| Captain's Log             | full-width, bottom  | ✓     | ✓     |
| NPC Roster (filterable)   | full-width, bottom  | ✓     | ✓     |
| Voidship sheet            | "Bridge" view       | —     | ✓     |
| Ship Manifest             | bridge view         | —     | ✓     |
| Persistent vox-log        | right rail panel    | ✓     | ✓     |
