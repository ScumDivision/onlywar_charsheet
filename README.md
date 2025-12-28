# Only War Dataslate App

A Grimdark character sheet and dice rolling application for the Warhammer 40k "Only War" RPG.

## Project Structure

```
onlywar/
├── backend/
│   ├── main.py          # FastAPI application & SQLite models
│   ├── requirements.txt # Python dependencies
│   └── onlywar.db       # SQLite database (generated on run)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CharacterSheet.jsx
│   │   │   ├── DiceRoller.jsx
│   │   │   └── ParticleEffects.jsx
│   │   ├── context/
│   │   │   └── GameContext.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Environment Setup

### 1. Backend (Python/FastAPI)

Create and activate the Conda environment:
```bash
conda create -n onlywar_env python=3.9 -y
conda activate onlywar_env
```

Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

Run the Backend Server:
```bash
uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`.

### 2. Frontend (React/Vite)

Install dependencies (if not already done):
```bash
cd frontend
npm install
```

Run the Frontend Dev Server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## Simultaneous Run Command

To run both servers (requires two terminal tabs or a tool like `concurrently`):

**Terminal 1:**
```bash
conda activate onlywar_env && cd backend && uvicorn main:app --reload
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

## Features

- **Grimdark UI:** Styled like an Imperial Dataslate with CRT effects.
- **Dice Roller:** D100 roll-under system with automatic DoS/DoF calculation.
- **Visual Feedback:** Particle effects for successes (Green/Sanctified) and failures (Red/Corruption).
- **Backend Persistence:** Characters are stored in a SQLite database via FastAPI.

## Deployment

Initialize Git:
```bash
git init
git remote add origin git@github.com:ScumDivision/onlywar_charsheet.git
git add .
git commit -m "Initial commit: Only War Dataslate App"
git push -u origin main
```
