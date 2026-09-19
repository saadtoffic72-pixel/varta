import React from 'react';
import { FileText, Cpu, Compass, Layers, ShieldCheck, ExternalLink, Code } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
          <FileText className="w-6 h-6 text-cyan-400" />
          <span>VARTA System Architecture & Technical Specifications</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detailed engineering documentation, mathematical formulations, AI pipeline interfaces, and deployment instructions for Smart India Hackathon.
        </p>
      </div>

      {/* 1. Architecture Overview */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>1. Layered Micro-Modular Architecture</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          VARTA is engineered with strict separation of concerns, ensuring that the prototype can transition to enterprise deployment with zero architectural refactoring:
        </p>
        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2">
          <li><strong>Presentation Layer:</strong> React 18, TypeScript, Tailwind CSS, Leaflet GIS Engine, Recharts.</li>
          <li><strong>API Gateway Layer:</strong> FastAPI, Async Endpoints, Pydantic v2 validation, OpenAPI 3.1 Swagger spec.</li>
          <li><strong>AI Subsystem Layer:</strong> Pluggable abstract class hierarchy (<code className="text-cyan-300 font-mono">AbstractAIModel</code>) enabling seamless swapping of neural networks.</li>
          <li><strong>Database Layer:</strong> SQLAlchemy 2.0 Async Engine with SQLite prototype storage, immediately swappable to PostgreSQL (<code className="text-cyan-300 font-mono">asyncpg</code>).</li>
          <li><strong>Standard Compliance:</strong> Common Alerting Protocol (CAP v1.2) and IMD Stage-I to Stage-IV standard scales.</li>
        </ul>
      </div>

      {/* 2. Mathematical Formulations */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <span>2. Core AI & Physical Formulations</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-cyan-300">A. Tropical Cyclone Genesis Potential Index (TCGPI)</h3>
            <p className="text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg">
              TCGPI = |10⁵ η|^(3/2) × (RH / 50)³ × (SST / 26.5)^(2.8) × (1 + 0.08 × V_shear)^(-2) × min(1, |lat| / 6)
            </p>
            <p className="text-slate-400 text-[11px]">
              Where η is low-level 850 hPa absolute vorticity, RH is 700-500 hPa relative humidity, SST is sea surface temperature (°C), and V_shear is 850-200 hPa vertical wind shear (knots).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-amber-300">B. Advanced Dvorak Technique (ADT) Wind-Pressure Relation</h3>
            <p className="text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg">
              V_max = 3.929 × (1010 - P_c)^(0.644) (knots)
            </p>
            <p className="text-slate-400 text-[11px]">
              Calibrated for the North Indian Ocean basin, relating central barometric pressure drop (ΔP = 1010 - P_c) to maximum sustained surface wind speed (MSW).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-rose-300">C. Storm Surge Inundation Formulation</h3>
            <p className="text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg">
              Surge (meters) = 0.012 × ΔP + (V_max^(1.9) × 0.00028) / (Slope × 1000) × (1 - Dist / 350)
            </p>
            <p className="text-slate-400 text-[11px]">
              Hydrodynamic proxy modeling inverse barometric rise and coastal shelf bathymetric shoaling effects.
            </p>
          </div>
        </div>
      </div>

      {/* 3. IMD Cyclone Intensity Scale */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>3. Official IMD Cyclone Classification Matrix</span>
        </h2>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Stage / Category</th>
                <th className="py-2 px-3">Wind Speed (knots)</th>
                <th className="py-2 px-3">Wind Speed (km/h)</th>
                <th className="py-2 px-3">Dvorak T-Number</th>
                <th className="py-2 px-3">Disaster Alert Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="py-2 px-3 font-sans text-cyan-300">Depression</td>
                <td className="py-2 px-3">17 – 27 kts</td>
                <td className="py-2 px-3">31 – 49 km/h</td>
                <td className="py-2 px-3">T1.5 – T2.0</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">Green</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans text-blue-300">Deep Depression</td>
                <td className="py-2 px-3">28 – 33 kts</td>
                <td className="py-2 px-3">50 – 61 km/h</td>
                <td className="py-2 px-3">T2.0</td>
                <td className="py-2 px-3 text-yellow-400 font-bold">Yellow (Watch)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans text-yellow-300">Cyclonic Storm</td>
                <td className="py-2 px-3">34 – 47 kts</td>
                <td className="py-2 px-3">62 – 88 km/h</td>
                <td className="py-2 px-3">T2.5 – T3.0</td>
                <td className="py-2 px-3 text-amber-400 font-bold">Orange (Alert)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans text-amber-300">Severe Cyclonic Storm</td>
                <td className="py-2 px-3">48 – 63 kts</td>
                <td className="py-2 px-3">89 – 117 km/h</td>
                <td className="py-2 px-3">T3.5</td>
                <td className="py-2 px-3 text-rose-400 font-bold">Red (Warning)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans text-orange-300">Very Severe Cyclonic Storm</td>
                <td className="py-2 px-3">64 – 89 kts</td>
                <td className="py-2 px-3">118 – 166 km/h</td>
                <td className="py-2 px-3">T4.0 – T4.5</td>
                <td className="py-2 px-3 text-rose-500 font-bold">Red (Red Alert)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans text-rose-400">Extremely Severe Cyclonic Storm</td>
                <td className="py-2 px-3">90 – 119 kts</td>
                <td className="py-2 px-3">167 – 221 km/h</td>
                <td className="py-2 px-3">T5.0 – T6.0</td>
                <td className="py-2 px-3 text-rose-500 font-bold">Red (Red Alert)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans text-purple-300 font-bold">Super Cyclonic Storm</td>
                <td className="py-2 px-3">&ge; 120 kts</td>
                <td className="py-2 px-3">&ge; 222 km/h</td>
                <td className="py-2 px-3">&ge; T6.5</td>
                <td className="py-2 px-3 text-purple-400 font-bold">Red (Great Catastrophe)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Future Model Integration Guide */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Code className="w-5 h-5 text-cyan-400" />
          <span>4. Guide: Plugging in Real PyTorch / ONNX Models</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          To integrate trained deep learning models in the future, simply inherit from <code className="text-cyan-300 font-mono">AbstractAIModel</code> located at <code className="text-cyan-300 font-mono">backend/app/ai_modules/base.py</code>:
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800">
{`from app.ai_modules.base import AbstractAIModel
import torch

class PyTorchTransformerTrackModel(AbstractAIModel):
    def __init__(self, weights_path="models/track_transformer.pt"):
        super().__init__(model_name="TrackTransformer-Prod", version="3.0.0")
        self.load_weights(weights_path)

    def load_weights(self, weights_path: str):
        self.model = torch.jit.load(weights_path)
        self.model.eval()
        self.is_loaded = True
        return True

    def preprocess(self, inputs):
        # Convert lat/lon, pressure, wind sequences to torch.Tensor
        return torch.tensor(inputs["sequence"]).unsqueeze(0)

    def predict(self, inputs):
        x = self.preprocess(inputs)
        with torch.no_grad():
            output = self.model(x)
        return self.postprocess(output)

    def postprocess(self, raw_outputs):
        # Format forecasted coordinates and uncertainty envelope
        return formatted_predictions`}
        </pre>
      </div>
    </div>
  );
};
