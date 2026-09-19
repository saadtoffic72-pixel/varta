import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AIModel, DatasetSource } from '../types';
import { Sliders, Cpu, Database, CheckCircle2, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export const AdminPanelPage: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [datasets, setDatasets] = useState<DatasetSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [mRes, dRes] = await Promise.all([api.getModels(), api.getDatasets()]);
      setModels(mRes);
      setDatasets(dRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActivateModel = async (modelId: number) => {
    setActivatingId(modelId);
    setFeedback(null);
    try {
      const res = await api.activateModel(modelId);
      setFeedback(`Model ${res.activated_model} is now active in production!`);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActivatingId(null);
    }
  };

  const handleSyncDataset = async (datasetId: number) => {
    setSyncingId(datasetId);
    setFeedback(null);
    try {
      const res = await api.syncDataset(datasetId);
      setFeedback(`Dataset ${res.dataset} successfully synchronized (${res.records_count} records).`);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
          <Sliders className="w-6 h-6 text-cyan-400" />
          <span>Model Registry & Dataset Pipeline Administration</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage pluggable AI/ML neural networks, active deployment weights, and real-time meteorological data feeds.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. Pluggable AI Model Registry */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI/ML Model Registry</span>
          </h2>
          <span className="text-xs text-slate-400">Total Registered Models: {models.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-4 rounded-xl border transition ${
                model.active_in_prod
                  ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">
                  TASK: {model.task}
                </span>
                {model.active_in_prod ? (
                  <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE IN PROD</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">STANDBY</span>
                )}
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{model.name}</h3>
              <p className="text-xs text-cyan-400/80 font-mono mb-2">
                Architecture: {model.architecture} (v{model.version})
              </p>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{model.description}</p>

              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono py-2 border-t border-slate-800/80 text-slate-300">
                <div>
                  <span className="text-slate-400 text-[10px] block">PARAMS</span>
                  {model.parameters_count}
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">LATENCY</span>
                  {model.inference_latency_ms} ms
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">ERROR METRIC</span>
                  {model.track_mae_nm ? `${model.track_mae_nm} nm MAE` : model.intensity_rmse_knots ? `${model.intensity_rmse_knots} kts RMSE` : '93% POD'}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                {!model.active_in_prod ? (
                  <button
                    onClick={() => handleActivateModel(model.id)}
                    disabled={activatingId === model.id}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-semibold transition"
                  >
                    {activatingId === model.id ? 'Deploying...' : 'Switch to Active Model'}
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400">Default Model</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. External Dataset Pipelines */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Dataset Ingestion Pipelines</span>
          </h2>
          <span className="text-xs text-slate-400">External Repositories & Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Repository Name</th>
                <th className="py-2.5 px-3">Provider Agency</th>
                <th className="py-2.5 px-3">Coverage & Format</th>
                <th className="py-2.5 px-3">Records Ingested</th>
                <th className="py-2.5 px-3">Pipeline Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {datasets.map((ds) => (
                <tr key={ds.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans font-bold text-white">{ds.source_name}</td>
                  <td className="py-2.5 px-3 font-sans text-cyan-300">{ds.provider}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{ds.file_format}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{ds.records_count.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {ds.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => handleSyncDataset(ds.id)}
                      disabled={syncingId === ds.id}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingId === ds.id ? 'animate-spin text-cyan-400' : ''}`} />
                      <span>{syncingId === ds.id ? 'Syncing...' : 'Sync Feed'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
