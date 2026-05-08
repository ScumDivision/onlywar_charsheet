# Changelog

All notable changes to the Only War / Rogue Trader Dataslate App.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Dates are in ISO 8601 format. The app is single-user and not versioned —
entries are anchored on the date a feature landed in production.

---

## [2026-05-08] — Companions, log, NPCs, injuries, manifest

A full evening of feature work driven by an active Rogue Trader campaign:
quarterly sessions over 8 years means structured persistence beats free-text
memory. Almost everything below is about not losing things between sessions.

### Added — character sheet

- **Companions section** with collapsible mini-statblocks. Each companion
  stores 9 characteristics, current/total wounds, movement, an own weapon
  list (with damage roll button) and free-form notes. Designed for things
  like Combat Servitors, Gyrinx and other bonded familiars.
- **Captain's Log** — multi-entry journal with optional Imperial date stamps
  (e.g. `0.342.M42`). Newest entries first, full-width below the main grid.
- **NPC roster ("Personenakte")** — searchable list of named persons
  encountered over the campaign. Each entry: name, role/faction, disposition
  (Allied → Friendly → Neutral → Owes Us → We Owe → Rival → Enemy → Dead →
  Unknown, color-coded), last-seen note, free-text. Filter input searches all
  fields and shows `filtered/total` count.
- **Injuries & Trauma log** — date, description, mechanical effect, healing
  state, plus a "healed" checkbox that strikes through and fades the entry.
- **Persistent vox-log** — the right-hand dice history now stores the last
  100 rolls on the character itself. Loading a character hydrates the
  session log so rolls from previous sessions are visible. New trash button
  in the vox-log header clears both session and persistent rolls.

### Added — ship sheet

- **Ship Manifest** with three sub-lists in a 3-column grid:
  - *Crew & Guests* (active personnel, embedded NPCs)
  - *Cargo & Loot* (acquired or stolen possessions)
  - *Prisoners & Detained* (so the Asuryani ambassador isn't forgotten in
    the brig two sessions in a row)

  Each entry: name, status, location aboard, notes.

### Changed

- **Weapons table → card layout.** The 13-column weapons grid was cramped on
  every screen size, especially the *Special* column (truncated to "Überhitzu",
  "Zuverläss"…). Now each weapon is a card with its name and roll/damage
  actions in the header, an 8-cell grid of stats below, and a full-width
  *Special* row that wraps cleanly.
- **Skill bonus dropdown** now goes to **+60** (was capped at +30). Stacking
  *skilled +20*, *Noble Born +20*, and a *Talented* talent's *+10* finally
  fits into one selector.
- **Global font-size bumped** to `17.5px` at the root, scaling every
  rem-based Tailwind text class ~10% larger across the whole sheet.

### Backend

- **Alembic migration `0003_companions`** — adds `characters.companions`
  JSON column (default `[]`).
- **Alembic migration `0004_log_entries`** — adds `characters.log_entries`
  JSON column (default `[]`).
- **Alembic migration `0005_npc_injuries_dicelog_manifest`** — adds three
  more JSON columns to `characters` (`npc_roster`, `injuries`, `dice_log`)
  and one to `ships` (`manifest`, default with empty `crew/cargo/prisoners`
  sub-arrays).

All migrations run automatically via the systemd unit's `ExecStartPre=…
init_db.py` on every restart.

---

## [2026-05-08, earlier] — Rogue Trader, ships, portraits, deploy

### Added

- **Rogue Trader as a peer system** to Only War. Both share the same 9
  characteristics and d100 roll-under engine. RT-specific fields (Career,
  Profit Factor) replace OW-specific ones (Regiment, Specialty) at the
  character level. New-character modal lets the user pick the system.
- **Ship management (RT-only).** New "Bridge" view with full ship sheet:
  name + class, hull integrity, speed, manoeuvrability, detection, armour,
  turret rating, crew population + rating, morale, power and space budgets,
  components list, ship-weapons table, background and notes. Ships are a
  separate entity; characters reference them via `ship_id`.
- **Character portraits** with server-side smartcrop autocrop to 600×800,
  re-crop endpoint that re-uses the original upload, and remove endpoint.
  JPEG/PNG/WebP supported, 10 MB cap.
- **System-aware theming.** Only War keeps its phosphor-green dataslate
  look; Rogue Trader switches to the von Moehrder dynasty heraldry palette
  (orange × petrol blue × brass gold) by re-skinning existing utility
  classes via `[data-theme="rt"]` selectors — no markup changes needed.
- **German as default language** with a full DE/EN translation pass and
  language toggle in the control bar.
- **Production deploy mode.** Backend mounts the built Vite `dist` at root
  and serves the frontend same-origin; `VITE_API_URL` is read from
  `.env.development` for local dev only.

### Changed

- Backend migrated to **SQLAlchemy 2.0** typed ORM (`Mapped[…]`,
  `mapped_column`) and **Pydantic v2** (`model_config`, `from_attributes`).
- **Alembic introduced** as the schema source of truth. `init_db.py` is
  idempotent: stamps fresh DBs, migrates pre-Alembic ones in place, fast-paths
  already-versioned ones.
- Number inputs go through a `toInt` helper that tolerates empty strings,
  preventing NaN propagation into the saved JSON.
- Portrait upload UX hardened: drag-and-drop area, recrop button, clearer
  error messages.

### Backend

- **Alembic migration `0001_initial_schema`** — characters table.
- **Alembic migration `0002_rt_ships_images`** — adds `system`, `career`,
  `profit_factor`, `ship_id` to characters; creates `ships` table; creates
  `character_images` table (autocropped JPEG + original blob).

---

## [2025-12-28] — Initial release

### Added

- Only War character sheet with the 9 d100 characteristics, skills,
  weapons, talents, armour by location, gear, XP tracker, wounds/fate,
  fatigue, insanity, corruption.
- D100 dice roller with degrees-of-success/failure calculation, modifier
  input, color-coded result feedback, and an in-page vox-log of the last
  rolls.
- Particle effects for criticals (green-on-success, red-on-failure) and a
  CRT-overlay shader for the dataslate aesthetic.
- FastAPI + SQLite backend with full CRUD over `/characters/`.
