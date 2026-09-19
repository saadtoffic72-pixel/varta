# VARTA Project Summary

## Problem Statement
Tropical cyclones hitting the North Indian Ocean basin inflict massive infrastructural damage and casualties due to rapidly intensifying storms and unpredictable landfall trajectories. Existing early warning systems lack the speed, probabilistic uncertainty mapping, and localized coastal vulnerability assessment needed by modern disaster management agencies (like the NDRF).

## VARTA Solution
VARTA (Atmospheric Vortex Analysis, Real-time Tracking & Alerting) acts as an end-to-end, AI/ML-driven Command Center for analyzing cyclonic threats. It bridges the gap between raw meteorological data and actionable, district-level emergency bulletins.

## Major Modules & Features
1. **Genesis Lab (TCGPI Simulation)**: Detects the early formation likelihood of cyclonic depressions.
2. **Intensity Lab (Advanced Dvorak)**: Classifies storm strength (from Low Pressure to Super Cyclone) based on wind/pressure differentials.
3. **Tracking & Uncertainty**: Calculates and projects a 12h–120h multi-step forecast cone.
4. **Risk & Vulnerability Analysis**: Maps incoming surge intensity to district-level census and shelter data.
5. **CAP Automated Alerting**: Disseminates standardized warning bulletins to coastal zones (Red/Orange/Yellow alerts).
6. **Decadal Analytics**: Unveils historical meteorological trends across the Bay of Bengal and Arabian Sea.

## Architecture
- **Frontend Interface**: An immersive, dark-themed React SPA using Tailwind CSS, built for high-stress operational centers. Integrates Leaflet for dynamic track mapping and Recharts for analytical visualizations.
- **Backend Service**: A modular Python FastAPI architecture supporting decoupled components for Cyclone state management, Alert generation, and AI inference.
- **Data Flow**: `React Frontend -> Axios/REST API -> FastAPI Routes -> Async Services -> Pluggable AI Modules / SQLite -> JSON Response`.

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet, Recharts, Lucide-React.
- **Backend**: Python 3.13, FastAPI, Uvicorn, SQLAlchemy 2.0 (async), Pydantic v2.
- **Database**: SQLite (Development) -> PostgreSQL (Production ready).

## Security
- **Authentication**: JWT-style Bearer token implementation securing sensitive configuration (Model activation, Database Sync) via a generic prototype operator login (`admin`/`admin123`).
- **CORS**: Flexible middleware mapping for frontend/backend integration.

## Deployment Architecture
Designed to be containerized using Docker and orchestrated via Kubernetes. The lightweight frontend can be served via NGINX or Vercel, while the backend relies on high-performance ASGI servers.
