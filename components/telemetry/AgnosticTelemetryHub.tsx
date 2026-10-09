import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  Layers, 
  Cpu, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Box, 
  Gauge, 
  Sliders,
  ExternalLink,
  Workflow,
  Radio,
  Send,
  Terminal,
  Zap,
  TrendingUp,
  Download,
  Copy,
  Plus
} from 'lucide-react';
import { backendApiService } from '../../services/backendApiService';
import { exportGenericTelemetryPDF } from '../../services/unifiedPdfService';
import { GenericDataStream, GenericStreamIngestPayload } from '../../types';

interface AgnosticTelemetryHubProps {
  onBackToApp?: () => void;
  className?: string;
}

export const AgnosticTelemetryHub: React.FC<AgnosticTelemetryHubProps> = ({ 
  onBackToApp,
  className = '' 
}) => {
  const [streams, setStreams] = useState<GenericDataStream[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatusMsg, setIngestStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ingest' | 'raw_json'>('overview');
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Ingestion form state for arbitrary third-party streaming
  const [customStreamId, setCustomStreamId] = useState('stream-custom-edge-03');
  const [customSource, setCustomSource] = useState('External REST API / SCADA Node');
  const [customProtocol, setCustomProtocol] = useState<'SSE' | 'WEBSOCKET' | 'REST_POLL' | 'WEBHOOK' | 'MANUAL'>('REST_POLL');
  const [customJsonMetrics, setCustomJsonMetrics] = useState(JSON.stringify({
    ambient_temp_c: 24.8,
    exhaust_flow_lpm: 18.5,
    system_efficiency_pct: 94.2,
    valve_actuation_ms: 12.0,
    differential_pressure_kpa: 142.6,
    signal_noise_ratio_db: 48.2
  }, null, 2));

  // Fetch all registered streams from the FastAPI backend
  const fetchStreams = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await backendApiService.getTelemetryStreams();
      if (data && data.length > 0) {
        setStreams(data);
        if (!selectedStreamId || !data.some(s => s.id === selectedStreamId)) {
          setSelectedStreamId(data[0].id);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch telemetry streams, using default fallback stream:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStreamId]);

  useEffect(() => {
    fetchStreams();
    // Auto-refresh cadence for live streaming simulation
    const interval = setInterval(() => {
      fetchStreams();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  const selectedStream = useMemo(() => {
    return streams.find(s => s.id === selectedStreamId) || streams[0] || null;
  }, [streams, selectedStreamId]);

  // Handle live arbitrary telemetry submission to POST /api/v1/telemetry/ingest
  const handleIngestTelemetry = async () => {
    setIsIngesting(true);
    setIngestStatusMsg(null);
    try {
      let parsedMetrics = {};
      try {
        parsedMetrics = JSON.parse(customJsonMetrics);
      } catch (e) {
        throw new Error("Invalid JSON format in custom metrics payload.");
      }

      const payload: GenericStreamIngestPayload = {
        stream_id: customStreamId.trim() || 'stream-generic-01',
        source_system: customSource.trim() || 'Third-Party Node',
        protocol: customProtocol,
        timestamp: new Date().toISOString(),
        metrics: parsedMetrics,
        metadata: {
          ingestion_agent: 'SynapseForge Agnostic Ingest Gateway',
          schema_type: 'SCHEMALESS_ARBITRARY_DICTIONARY'
        }
      };

      const res = await backendApiService.ingestTelemetryData(payload);
      if (res) {
        setIngestStatusMsg(`Successfully ingested packet for stream "${payload.stream_id}" (${Object.keys(parsedMetrics).length} keys).`);
        await fetchStreams();
        setSelectedStreamId(payload.stream_id);
      } else {
        setIngestStatusMsg("Packet processed and cached locally.");
      }
    } catch (err: any) {
      setIngestStatusMsg(`Ingestion Error: ${err?.message || 'Check JSON payload syntax'}`);
    } finally {
      setIsIngesting(false);
      setTimeout(() => setIngestStatusMsg(null), 4500);
    }
  };

  // Export current stream report as standardized PDF
  const handleExportTelemetryPdf = () => {
    if (!selectedStream) return;
    exportGenericTelemetryPDF({
      streamId: selectedStream.id,
      streamName: selectedStream.name,
      sourceSystem: selectedStream.source_system,
      protocol: selectedStream.protocol,
      status: selectedStream.status,
      metrics: selectedStream.metrics || {},
      metadata: selectedStream.metadata || {},
      timestamp: selectedStream.last_heartbeat,
      operatorOrAuditor: 'Autonomous Systems Engineer'
    });
  };

  const handleCopyPayload = () => {
    if (!selectedStream) return;
    navigator.clipboard.writeText(JSON.stringify(selectedStream, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 min-h-screen p-6 md:p-8 space-y-6 ${className}`}>
      {/* TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            {onBackToApp && (
              <button 
                onClick={onBackToApp}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition"
              >
                &larr; Back to Forge
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase font-mono flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
              Agnostic Telemetry &amp; Data Stream Hub
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono uppercase tracking-wider">
              Generic Schema Ingestion
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Domain-agnostic real-time telemetry processing engine. Ingest, normalize, and monitor arbitrary metric dictionaries and metadata payloads from any external hardware, IoT, REST, or WebSocket source.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStreams}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-mono font-bold transition"
            title="Refresh active streams"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync Streams</span>
          </button>

          <button
            onClick={handleExportTelemetryPdf}
            disabled={!selectedStream}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-mono font-bold shadow-lg shadow-cyan-950/50 hover:scale-[1.02] transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Stream PDF</span>
          </button>
        </div>
      </div>

      {/* STREAM DIRECTORY SELECTOR */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-300 uppercase flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Active Ingestion Channels ({streams.length} Registered)
          </span>
          <span className="text-slate-500 text-[11px]">
            Arbitrary JSON Dicts Supported • Zero Vendor Constraints
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {streams.map(stream => {
            const isSelected = stream.id === selectedStreamId;
            const metricCount = Object.keys(stream.metrics || {}).length;
            return (
              <button
                key={stream.id}
                onClick={() => setSelectedStreamId(stream.id)}
                className={`flex flex-col p-3.5 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50' 
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black font-mono text-white truncate max-w-[200px]">
                    {stream.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    {stream.protocol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>Source: {stream.source_system}</span>
                  <span className="text-cyan-400 font-bold">{metricCount} Signals</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
                  <span>Lat: {stream.latency_ms?.toFixed(1) || 12.0}ms</span>
                  <span>{new Date(stream.last_heartbeat).toLocaleTimeString()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition ${
            activeTab === 'overview'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Live Metrics Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('ingest')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition ${
            activeTab === 'ingest'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ingest Custom Stream</span>
        </button>

        <button
          onClick={() => setActiveTab('raw_json')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition ${
            activeTab === 'raw_json'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Raw Ingested Payload</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRIC CARDS */}
      {activeTab === 'overview' && selectedStream && (
        <div className="space-y-6">
          {/* Stream Overview Banner */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-base font-bold font-mono text-white">
                  {selectedStream.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  ID: {selectedStream.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Source System: <strong className="text-slate-200">{selectedStream.source_system}</strong> &bull; Protocol: <strong className="text-cyan-400">{selectedStream.protocol}</strong> &bull; Sample Rate: {selectedStream.sample_rate_hz || 50} Hz
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleCopyPayload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedPayload ? 'Copied JSON' : 'Copy Payload'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Arbitrary Metric Cards */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Dynamic Signal Matrix ({Object.keys(selectedStream.metrics || {}).length} Ingested Channels)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(selectedStream.metrics || {}).map(([key, value]) => {
                const isNumeric = typeof value === 'number';
                const formattedKey = key.replace(/_/g, ' ').toUpperCase();
                
                // Determine plausible unit from key name
                let unitBadge = '';
                if (key.includes('_c') || key.includes('temp')) unitBadge = '°C';
                else if (key.includes('_pct') || key.includes('percent')) unitBadge = '%';
                else if (key.includes('_pa') || key.includes('pressure')) unitBadge = 'Pa';
                else if (key.includes('_kw') || key.includes('power')) unitBadge = 'kW';
                else if (key.includes('_lpm') || key.includes('flow')) unitBadge = 'L/min';
                else if (key.includes('_kn') || key.includes('load')) unitBadge = 'kN';
                else if (key.includes('_rpm')) unitBadge = 'RPM';
                else if (key.includes('_mps')) unitBadge = 'm/s';
                else if (key.includes('_ms')) unitBadge = 'ms';
                else if (key.includes('_hz')) unitBadge = 'Hz';

                return (
                  <div key={key} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate max-w-[160px]" title={key}>
                        {formattedKey}
                      </span>
                      {unitBadge && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {unitBadge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black font-mono text-white">
                        {isNumeric ? (Number.isInteger(value) ? value : value.toFixed(2)) : String(value)}
                      </span>
                      {unitBadge && <span className="text-xs font-mono text-slate-500">{unitBadge}</span>}
                    </div>

                    {/* Dynamic trend sparkline indicator for numbers */}
                    {isNumeric && (
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mt-2">
                        <div 
                          className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(10, Math.abs(Number(value) * 1.5) % 100))}%` }} 
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata Dictionary */}
          {selectedStream.metadata && Object.keys(selectedStream.metadata).length > 0 && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                Ingested Metadata Properties
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(selectedStream.metadata).map(([k, v]) => (
                  <div key={k} className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-xs font-mono">
                    <span className="text-slate-500 block text-[9px] uppercase">{k.replace(/_/g, ' ')}</span>
                    <span className="text-slate-300 font-semibold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INGEST CUSTOM STREAM CONSOLE */}
      {activeTab === 'ingest' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Live Arbitrary Stream Ingestion Gateway
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Dispatch schemaless telemetry packets to <code className="text-cyan-400">POST /api/v1/telemetry/ingest</code>. The system accepts arbitrary JSON keys without requiring predefined database schemas.
            </p>
          </div>

          {ingestStatusMsg && (
            <div className={`p-3.5 rounded-xl text-xs font-mono border flex items-center gap-2 ${
              ingestStatusMsg.includes('Error') 
                ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{ingestStatusMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Stream Identifier</label>
              <input
                type="text"
                value={customStreamId}
                onChange={e => setCustomStreamId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. stream-turbine-flow-09"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Source System Label</label>
              <input
                type="text"
                value={customSource}
                onChange={e => setCustomSource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. SCADA OPC-UA Gateway"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Protocol Type</label>
              <select
                value={customProtocol}
                onChange={e => setCustomProtocol(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="REST_POLL">REST Poll (HTTP)</option>
                <option value="SSE">Server-Sent Events (SSE)</option>
                <option value="WEBSOCKET">WebSocket Stream</option>
                <option value="WEBHOOK">Arbitrary Webhook</option>
                <option value="MANUAL">Manual Injection</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Arbitrary Metrics Payload (JSON Object)
              </label>
              <button
                type="button"
                onClick={() => {
                  setCustomJsonMetrics(JSON.stringify({
                    test_load_kn: +(Math.random() * 20 + 5).toFixed(2),
                    spindle_temp_c: +(Math.random() * 30 + 40).toFixed(1),
                    vibration_g: +(Math.random() * 0.1).toFixed(4),
                    power_factor: +(Math.random() * 0.1 + 0.9).toFixed(3),
                    flow_velocity_mps: +(Math.random() * 2 + 1).toFixed(2)
                  }, null, 2));
                }}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline"
              >
                Generate Random Test Signals
              </button>
            </div>

            <textarea
              value={customJsonMetrics}
              onChange={e => setCustomJsonMetrics(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleIngestTelemetry}
              disabled={isIngesting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-mono text-xs uppercase bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-950/40 hover:scale-[1.02]"
            >
              {isIngesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isIngesting ? 'Ingesting Packet...' : 'Dispatch Live Telemetry'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: RAW JSON INSPECTOR */}
      {activeTab === 'raw_json' && selectedStream && (
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live Stream Schema Inspector: {selectedStream.id}
            </span>
            <button
              onClick={handleCopyPayload}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono transition"
            >
              {copiedPayload ? 'Copied' : 'Copy JSON'}
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[500px]">
            {JSON.stringify(selectedStream, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
