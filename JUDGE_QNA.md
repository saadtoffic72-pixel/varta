# Judge Q&A Guide

**Q: Are these real AI/ML predictions we are looking at?**
**A:** For this prototype, we are using a robust *Physics-Guided Simulation* (incorporating mathematical constraints like Coriolis forces, Beta drift, and SLOSH proxy curves). We built it this way so the dashboard would generate dynamic, realistic outputs for the presentation without requiring gigabytes of real-time satellite imagery. However, our Python architecture (`AbstractAIModel`) is explicitly designed to drop in a PyTorch `.pt` or ONNX file seamlessly for real deployment.

**Q: How does the system handle real-time data feeds?**
**A:** VARTA is built with external integration in mind. While currently running on seeded internal DB scenarios for the demo, our models have standard `preprocess()` hooks intended to ingest standard APIs from IMD, open weather, or ISRO satellite telemetry via background tasks. 

**Q: What makes this better than the standard IMD website?**
**A:** VARTA bridges the gap between *meteorology* and *disaster response*. IMD provides the tracks, but VARTA automatically overlays that track with a coastal vulnerability index (population data, shelter counts) and generates CAP-compliant alerts specifically for those districts, enabling immediate action by agencies like the NDRF.

**Q: What happens if multiple people access this dashboard at once? Will it crash?**
**A:** No, we've utilized **FastAPI**, an asynchronous Python framework. Our database access uses `aiosqlite`, meaning concurrent requests won't block the server, allowing high availability even during a crisis.

**Q: How is the Admin panel secured?**
**A:** We implemented a Bearer token-based authentication mechanism. Only authenticated emergency operators (using standard login credentials) are issued the token required to access configuration and model-swapping endpoints.
