# SIH 2026 Presentation Guide: VARTA

## Suggested 3–5 Minute Presentation Flow

1. **The Hook (30s)**: Introduce the problem. Coastal regions face rapid storm intensification, yet actionable intelligence takes hours to compile. Introduce **VARTA** as the all-in-one AI/ML diagnostic system designed for disaster relief agencies (like the NDRF).
2. **Dashboard Demo (1 min)**: Navigate to the `Dashboard`. Show the live tracking, telemetry data, and the 70% probability cone. Point out the Vulnerability Index which tells responders *exactly* where shelters are needed.
3. **AI Capabilities (1 min)**: Click into the **Genesis Lab** and **Intensity Lab** modals. Emphasize that while we use simulated physics-models today, the architecture uses a `BaseAIModel` class ready to plug in real PyTorch/ONNX files. Hit the "Re-compute AI Ensembles" button to show real-time responsiveness.
4. **Historical Analytics (30s)**: Move to the `Analytics` tab to show the "Decadal Cyclone Frequency" chart. Explain how this data helps long-term infrastructural planning.
5. **Security/Admin (30s)**: Log out and log back in to demonstrate the protected `Admin` interface. Explain that model swapping and dataset synchronization are secured from public view.
6. **Closing (30s)**: Summarize the tech stack (FastAPI + React) and explain the production roadmap (Live ISRO feeds, PostgreSQL).

## What to Demonstrate
- The dynamic GIS map and uncertainty cone (zoom in/out).
- The dynamic Wind/Pressure charting reacting to the storm data.
- The CAP (Common Alerting Protocol) warning cards.
- The login and authentication barrier for Admin settings.

## Important Technical Points
- **Pluggable Architecture**: The AI is completely modular. You can hot-swap intensity prediction models via the Admin panel without altering business logic.
- **Async Speed**: Mention the FastAPI backend using `asyncio` and `aiosqlite`, ensuring the platform doesn't block while waiting for heavy ML predictions.
- **State Management**: Note how React cleanly parses and displays complex telemetry matrices.
