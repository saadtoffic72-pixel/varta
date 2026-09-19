VARTA AI/ML Tropical Cyclone Diagnostic & Prediction System
===========================================================

Smart India Hackathon (SIH 2026) Prototype
-------------------------------------------

VARTA (Atmospheric Vortex Analysis, Real-time Tracking & Alerting) delivers:
  - Physics-guided Cyclone Genesis Detection (TCGPI + Convective Analysis)
  - IMD-standard Intensity Classification (Advanced Dvorak Technique)
  - Ensemble Track & 70% Probability Cone Forecasting (T+12 to T+120h)
  - Multi-Hazard Coastal Surge & Vulnerability Risk Analytics
  - CAP v1.2-compliant Automated Emergency Alert Dissemination
  - Interactive Leaflet GIS Map (Storm tracks, wind radii, coastal risk markers)
  - Historical Archive: Amphan, Biparjoy, Fani, Dana, Tauktae, Mocha

---

QUICK START (LOCAL DEVELOPMENT)
================================

Prerequisites
-------------
  - Python 3.10+ (Anaconda3 is fine)
  - Node.js 18 LTS+
  - npm 9+

---

STEP 1: Start the Backend (FastAPI)
-------------------------------------

  cd varta/backend

  # Create and activate virtual environment
  python -m venv venv

  # Activate (Windows)
  venv\Scripts\activate

  # Install dependencies
  pip install -r requirements.txt

  # Start the server (auto-seeds the DB and starts on http://localhost:8000)
  python run.py

  API Docs: http://localhost:8000/docs
  Health:   http://localhost:8000/health

---

STEP 2: Start the Frontend (React + Vite)
------------------------------------------

  cd varta/frontend

  # Install npm dependencies
  npm install

  # Start dev server (http://localhost:5173)
  npm run dev

---

STEP 3: (Windows) One-Command Startup
---------------------------------------

  Run the included helper script from the varta/ directory:

    start.bat

  This opens two terminal windows — one for backend, one for frontend.

---

AUTHENTICATION (NEW)
====================

  The administrative interface is secured.
  Default Prototype Credentials:
    Username: admin
    Password: admin123

---

URLS
=====
  Frontend:          http://localhost:5173
  Backend REST API:  http://localhost:8000
  OpenAPI Swagger:   http://localhost:8000/docs
  ReDoc:             http://localhost:8000/redoc

---

PROJECT STRUCTURE
==================

  varta/
  ├── backend/
  │   ├── app/
  │   │   ├── main.py                     # FastAPI entrypoint
  │   │   ├── core/                       # Config & logging
  │   │   ├── db/                         # SQLAlchemy engine, init/seed
  │   │   ├── models/                     # ORM: Cyclone, Alert, AIModel, Dataset
  │   │   ├── schemas/                    # Pydantic request/response schemas
  │   │   ├── ai_modules/                 # Pluggable AI inference engines
  │   │   ├── services/                   # Business logic
  │   │   └── api/v1/endpoints/          # REST routes
  │   ├── tests/test_api.py               # Pytest suite (8 tests, all passing)
  │   ├── requirements.txt
  │   └── run.py
  │
  ├── frontend/
  │   ├── src/
  │   │   ├── pages/                      # 10 full page components
  │   │   ├── components/                 # 9 reusable components
  │   │   ├── services/api.ts             # Axios API client
  │   │   └── types/index.ts              # TypeScript domain types
  │   ├── package.json
  │   └── vite.config.ts
  │
  ├── start.bat                           # Windows launch script
  ├── docker-compose.yml
  └── README.md

---

AI ARCHITECTURE
================

All AI modules inherit from app/ai_modules/base.py :: AbstractAIModel
  → load_weights()  | preprocess() | predict() | postprocess()

To plug in a real PyTorch model, just subclass AbstractAIModel.
See Documentation page within the app for the integration guide.

Current Engines:
  1. GenesisDetectionEngine  — TCGPI + Sigmoid genesis probability
  2. IntensityClassificationEngine — ADT Dvorak T-number regression
  3. TrackPredictionEngine — Physics-guided ensemble trajectory + GeoJSON cone
  4. RiskAnalysisEngine — SLOSH-proxy surge inundation + district vulnerability

---

TEST SUITE
===========

  cd backend
  $env:PYTHONPATH='.'; pytest -v

  Results: 8/8 tests passing

---

STACK SUMMARY
==============
  Backend:  Python 3.13 | FastAPI | SQLAlchemy 2.0 | Pydantic v2 | SQLite
  Frontend: React 18 | TypeScript | Vite | Tailwind CSS | Leaflet | Recharts
  AI:       Physics-Guided Math Models (PyTorch/ONNX-ready interfaces)
  DB:       SQLite (prototype) → PostgreSQL (production, no code changes needed)

---

FUTURE INTEGRATION (PRODUCTION ROADMAP)
=========================================
  [ ] Replace SQLite with asyncpg + PostgreSQL
  [ ] Load ONNX/TorchScript model weights via load_weights()
  [ ] Wire live ISRO/MOSDAC INSAT-3DR satellite feed
  [ ] IMD Real-time Best Track API WebSocket integration
  [ ] OpenWeather / ECMWF ERA5 live environmental parameter feeds
  [ ] NDRF / SDMA shelter capacity API integration
  [ ] AWS/GCP containerized Kubernetes deployment via Helm chart

---

TEAM
=====
  Smart India Hackathon 2026 | VARTA Engineering Team

