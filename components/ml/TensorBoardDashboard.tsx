import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BarChart2, 
  GitBranch, 
  Layers, 
  Cpu, 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Upload, 
  Maximize2, 
  Minimize2, 
  Check, 
  Flame, 
  RefreshCw,
  Search,
  Settings2,
  Box,
  FileCode,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { TensorBoardRun, TensorBoardScalarPoint } from '../../types';
import { MOCK_TENSORBOARD_RUNS } from '../../constants';
import { dispatchMilestoneAlert } from '../../services/notificationService';

interface TensorBoardDashboardProps {
  initialRuns?: TensorBoardRun[];
  onTriggerComputeEvent?: (type: string, details: string, cost: number) => void;
  className?: string;
}

type TabType = 'scalars' | 'graphs' | 'histograms' | 'distributions' | 'hparams' | 'profile';

export const TensorBoardDashboard: React.FC<TensorBoardDashboardProps> = ({
  initialRuns = MOCK_TENSORBOARD_RUNS,
  onTriggerComputeEvent,
  className = ''
}) => {
  const [runs, setRuns] = useState<TensorBoardRun[]>(initialRuns);
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>(initialRuns.map(r => r.id));
  const [activeTab, setActiveTab] = useState<TabType>('scalars');
  const [smoothing, setSmoothing] = useState<number>(0.6);
  const [xAxisMode, setXAxisMode] = useState<'step' | 'relative' | 'wall'>('step');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ runName: string; step: number; value: number; smoothed: number; x: number; y: number } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const streamIntervalRef = useRef<any>(null);

  // Toggle run selection
  const toggleRun = (runId: string) => {
    setSelectedRunIds(prev => 
      prev.includes(runId) 
        ? prev.filter(id => id !== runId) 
        : [...prev, runId]
    );
  };

  // Exponential moving average smoothing function
  const applySmoothing = (points: TensorBoardScalarPoint[], weight: number) => {
    if (!points || points.length === 0) return [];
    if (weight <= 0) return points.map(p => ({ ...p, smoothed: p.value }));

    const smoothed: Array<TensorBoardScalarPoint & { smoothed: number }> = [];
    let last = points[0].value;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      last = last * weight + (1 - weight) * p.value;
      smoothed.push({
        ...p,
        smoothed: +last.toFixed(4)
      });
    }
    return smoothed;
  };

  // Live simulation tick
  useEffect(() => {
    if (isLiveStreaming) {
      streamIntervalRef.current = setInterval(() => {
        setRuns(prevRuns => {
          return prevRuns.map(run => {
            if (run.id !== selectedRunIds[0]) return run;
            const lastStep = run.currentStep;
            const newStep = lastStep + 25;
            const lastTrainLoss = run.scalars.train_loss[run.scalars.train_loss.length - 1]?.value || 0.1;
            const lastValLoss = run.scalars.val_loss[run.scalars.val_loss.length - 1]?.value || 0.12;
            const lastTrainAcc = run.scalars.train_accuracy[run.scalars.train_accuracy.length - 1]?.value || 0.95;
            const lastValAcc = run.scalars.val_accuracy[run.scalars.val_accuracy.length - 1]?.value || 0.94;
            const lastLr = run.scalars.learning_rate[run.scalars.learning_rate.length - 1]?.value || 0.0001;

            const newTrainLoss = Math.max(0.005, +(lastTrainLoss * 0.985 + (Math.random() - 0.5) * 0.004).toFixed(4));
            const newValLoss = Math.max(0.008, +(lastValLoss * 0.988 + (Math.random() - 0.45) * 0.005).toFixed(4));
            const newTrainAcc = Math.min(0.999, +(lastTrainAcc + (1 - lastTrainAcc) * 0.03 + (Math.random() - 0.5) * 0.002).toFixed(4));
            const newValAcc = Math.min(0.995, +(lastValAcc + (1 - lastValAcc) * 0.025 + (Math.random() - 0.5) * 0.003).toFixed(4));
            const newLr = Math.max(1e-6, +(lastLr * 0.97).toFixed(6));

            const now = Date.now();
            return {
              ...run,
              currentStep: newStep,
              scalars: {
                ...run.scalars,
                train_loss: [...run.scalars.train_loss, { step: newStep, wallTime: now, value: newTrainLoss }],
                val_loss: [...run.scalars.val_loss, { step: newStep, wallTime: now, value: newValLoss }],
                train_accuracy: [...run.scalars.train_accuracy, { step: newStep, wallTime: now, value: newTrainAcc }],
                val_accuracy: [...run.scalars.val_accuracy, { step: newStep, wallTime: now, value: newValAcc }],
                learning_rate: [...run.scalars.learning_rate, { step: newStep, wallTime: now, value: newLr }]
              }
            };
          });
        });
      }, 1200);
    } else {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    }

    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [isLiveStreaming, selectedRunIds]);

  const activeRuns = useMemo(() => {
    return runs.filter(r => selectedRunIds.includes(r.id));
  }, [runs, selectedRunIds]);

  const handleExportEventLog = () => {
    const bundle = {
      format: "tensorboard_tfevents_json_v2",
      exported_at: new Date().toISOString(),
      generator: "SynapseForge Deep Learning Engine (PyTorch & TensorFlow)",
      runs: activeRuns
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tensorboard_events_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (onTriggerComputeEvent) {
      onTriggerComputeEvent('TENSORBOARD_AUDIT', 'TensorBoard log bundle generated and archived.', 5.0);
    }
    dispatchMilestoneAlert({
      type: 'TENSORBOARD_AUDIT',
      title: 'TensorBoard Log Archive Exported',
      description: `Exported telemetry for ${activeRuns.length} neural training runs.`,
      cost: 5.0,
      status: 'VERIFIED'
    });
  };

  // Helper renderer for scalar SVG charts
  const renderScalarChart = (
    metricKey: 'train_loss' | 'val_loss' | 'train_accuracy' | 'val_accuracy' | 'learning_rate',
    title: string,
    yLabel: string,
    isMinimizing: boolean
  ) => {
    // Gather all points across active runs
    let allSteps: number[] = [];
    let allValues: number[] = [];

    const runSeries = activeRuns.map(run => {
      const series = run.scalars[metricKey] || [];
      const smoothed = applySmoothing(series, smoothing);
      series.forEach(p => allSteps.push(p.step));
      smoothed.forEach(p => allValues.push(p.value, p.smoothed));
      return { run, smoothed };
    });

    if (allSteps.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-500 text-xs font-mono">
          No scalar events recorded for {title}
        </div>
      );
    }

    const minStep = 0;
    const maxStep = Math.max(...allSteps, 100);
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const valRange = maxVal - minVal || 1;

    const width = 480;
    const height = 220;
    const padX = 45;
    const padY = 25;

    const toX = (step: number) => padX + ((step - minStep) / (maxStep - minStep)) * (width - padX - 15);
    const toY = (val: number) => (height - padY) - ((val - minVal) / valRange) * (height - padY * 2);

    return (
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col relative group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-mono">{title}</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
            {isMinimizing ? 'Min' : 'Max'}: {isMinimizing ? minVal.toFixed(4) : maxVal.toFixed(4)}
          </span>
        </div>

        <div className="relative w-full h-[220px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = (height - padY) - pct * (height - padY * 2);
              const tickVal = minVal + pct * valRange;
              return (
                <g key={i}>
                  <line x1={padX} y1={y} x2={width - 15} y2={y} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.75" />
                  <text x={padX - 6} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                    {tickVal < 0.01 ? tickVal.toExponential(1) : tickVal.toFixed(3)}
                  </text>
                </g>
              );
            })}

            {/* X-axis Ticks */}
            {[0, 0.33, 0.66, 1].map((pct, i) => {
              const stepVal = Math.round(minStep + pct * (maxStep - minStep));
              const x = toX(stepVal);
              return (
                <g key={i}>
                  <line x1={x} y1={height - padY} x2={x} y2={height - padY + 4} stroke="#64748b" strokeWidth="1" />
                  <text x={x} y={height - padY + 14} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                    {stepVal}
                  </text>
                </g>
              );
            })}

            {/* Series Paths */}
            {runSeries.map(({ run, smoothed }) => {
              if (smoothed.length < 2) return null;

              // Raw line (faint)
              const rawPointsStr = smoothed.map(p => `${toX(p.step)},${toY(p.value)}`).join(' ');
              // Smoothed line (bold)
              const smoothPointsStr = smoothed.map(p => `${toX(p.step)},${toY(p.smoothed)}`).join(' ');

              return (
                <g key={run.id}>
                  {/* Faint unsmoothed points */}
                  {smoothing > 0.1 && (
                    <polyline
                      fill="none"
                      stroke={run.color}
                      strokeWidth="0.8"
                      strokeOpacity="0.3"
                      points={rawPointsStr}
                    />
                  )}
                  {/* Smoothed curve */}
                  <polyline
                    fill="none"
                    stroke={run.color}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={smoothPointsStr}
                  />
                  {/* Highlight latest point */}
                  {smoothed.length > 0 && (
                    <circle
                      cx={toX(smoothed[smoothed.length - 1].step)}
                      cy={toY(smoothed[smoothed.length - 1].smoothed)}
                      r="4"
                      fill={run.color}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-[10px]">
          {activeRuns.map(run => (
            <div key={run.id} className="flex items-center gap-1.5 font-mono text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: run.color }} />
              <span className="truncate max-w-[140px]">{run.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 min-h-screen rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}>
      {/* ======================================================== */}
      {/* AUTHENTIC TENSORBOARD TOP NAVIGATION BAR                  */}
      {/* ======================================================== */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          {/* TensorBoard Flame Icon with Signature Amber/Orange Brand */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 p-2 flex items-center justify-center shadow-lg shadow-orange-950/40">
            <Flame className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white uppercase font-mono">TensorBoard</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                v2.16 (TF / PyTorch Bridge)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Deep Learning Telemetry & Computation Graph Engine</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'scalars', label: 'Scalars', icon: BarChart2 },
            { id: 'graphs', label: 'Graphs', icon: GitBranch },
            { id: 'histograms', label: 'Histograms', icon: Layers },
            { id: 'distributions', label: 'Distributions', icon: Box },
            { id: 'hparams', label: 'HParams', icon: Sliders },
            { id: 'profile', label: 'Profiler', icon: Cpu }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all font-mono ${
                  isActive
                    ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
              isLiveStreaming
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveStreaming ? 'Streaming Live' : 'Simulate Stream'}</span>
          </button>

          <button
            onClick={handleExportEventLog}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/90 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition shadow-sm font-mono"
            title="Download TensorBoard TFEvents bundle"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Logs</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN WORKBENCH LAYOUT: SIDEBAR + CONTENT                  */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT DRAWER: RUNS & SETTINGS */}
        <aside className="w-full lg:w-72 bg-slate-900/60 border-r border-slate-800 p-4 flex flex-col gap-5 flex-shrink-0 overflow-y-auto">
          {/* Run Search Filter */}
          <div>
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 mb-2 font-mono">
              <span>Runs ({activeRuns.length}/{runs.length})</span>
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter runs by regex..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          {/* Runs Checklist */}
          <div className="space-y-2">
            {runs
              .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(run => {
                const isChecked = selectedRunIds.includes(run.id);
                return (
                  <div
                    key={run.id}
                    onClick={() => toggleRun(run.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition border text-xs ${
                      isChecked
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:bg-slate-900/50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition ${
                        isChecked ? 'border-orange-500 bg-orange-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: run.color }} />
                        <span className="font-bold truncate font-mono text-[11px]">{run.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                        <span className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800">{run.framework}</span>
                        <span>Step {run.currentStep}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Chart Controls (Smoothing & X-Axis) */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">Chart Configuration</h3>

            {/* Smoothing Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-mono">Smoothing</span>
                <span className="font-mono text-orange-400 font-bold">{smoothing.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.99"
                step="0.01"
                value={smoothing}
                onChange={e => setSmoothing(parseFloat(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>0.0 (Raw)</span>
                <span>0.99 (Smoothed)</span>
              </div>
            </div>

            {/* X-Axis Horizontal Radio */}
            <div>
              <span className="text-xs text-slate-300 font-mono block mb-1.5">Horizontal Axis</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {[
                  { id: 'step', label: 'Step' },
                  { id: 'relative', label: 'Relative' },
                  { id: 'wall', label: 'Wall' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setXAxisMode(opt.id as any)}
                    className={`py-1 text-[10px] font-mono font-bold rounded transition ${
                      xAxisMode === opt.id
                        ? 'bg-slate-800 text-orange-400 border border-slate-700'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT WORKBENCH */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
          {/* 1. SCALARS TAB */}
          {activeTab === 'scalars' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-orange-400" />
                    Convergence & Optimization Scalars
                  </h2>
                  <p className="text-xs text-slate-400">Tracking loss decay, validation accuracy, and dynamic learning rates across training steps</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{activeRuns.length} Runs Visualized</span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {renderScalarChart('train_loss', 'epoch_loss / train', 'Loss', true)}
                {renderScalarChart('val_loss', 'val_loss / evaluation', 'Val Loss', true)}
                {renderScalarChart('train_accuracy', 'epoch_accuracy / train', 'Accuracy', false)}
                {renderScalarChart('val_accuracy', 'val_accuracy / evaluation', 'Val Accuracy', false)}
                {renderScalarChart('learning_rate', 'learning_rate / schedule', 'LR', true)}
              </div>
            </div>
          )}

          {/* 2. GRAPHS TAB */}
          {activeTab === 'graphs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-orange-400" />
                    TensorFlow & PyTorch Computation Graph Visualizer
                  </h2>
                  <p className="text-xs text-slate-400">Interactive DAG representing operators, tensor transformations, forward activations, and autograd backprop</p>
                </div>
                {activeRuns[0] && (
                  <span className="text-xs font-mono text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2.5 py-1 rounded-lg">
                    Graph: {activeRuns[0].name} ({activeRuns[0].framework})
                  </span>
                )}
              </div>

              {activeRuns[0] ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Graph Canvas */}
                  <div className="lg:col-span-2 bg-slate-900/90 rounded-xl border border-slate-800 p-6 shadow-xl relative min-h-[460px] flex flex-col justify-between">
                    <div className="space-y-4">
                      {activeRuns[0].graph.nodes.map((node, idx) => {
                        const isSelected = selectedNode?.id === node.id;
                        return (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-950/40'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-slate-500 w-5">#{idx + 1}</span>
                              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-orange-400">
                                <Box className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold font-mono">{node.name}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">{node.op}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                              <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-amber-400">
                                {node.outputShape}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">{node.device}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Node Inspector Panel */}
                  <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                      <Settings2 className="w-4 h-4 text-orange-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-200">Operator Inspector</h3>
                    </div>

                    {selectedNode ? (
                      <div className="space-y-3 font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Node Name</span>
                          <span className="text-slate-100 font-bold text-sm">{selectedNode.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Op Type</span>
                          <span className="text-orange-400 font-bold">{selectedNode.op}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Output Tensor Shape</span>
                          <span className="text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 block mt-0.5">
                            {selectedNode.outputShape}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Device Placement</span>
                          <span className="text-slate-300">{selectedNode.device || '/device:GPU:0'}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase block mb-1">Inputs</span>
                          {selectedNode.inputs.length > 0 ? (
                            <ul className="space-y-1">
                              {selectedNode.inputs.map((inp: string, i: number) => (
                                <li key={i} className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                  {inp}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Root node (Graph input)</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs font-mono">
                        <Box className="w-8 h-8 stroke-1 mb-2 text-slate-600" />
                        Select an operator node in the computational DAG to view layer tensor specifications and shapes.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 font-mono text-xs">Select at least one run to visualize graph</div>
              )}
            </div>
          )}

          {/* 3. HISTOGRAMS TAB */}
          {activeTab === 'histograms' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-400" />
                    Weights & Biases Histogram Distribution
                  </h2>
                  <p className="text-xs text-slate-400">Temporal tensor slices showing weight drift and gradient health across training epochs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {activeRuns[0]?.histograms && Object.entries(activeRuns[0].histograms).map(([layerName, bins]) => (
                  <div key={layerName} className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold font-mono text-slate-200">{layerName}</h4>
                      <span className="text-[10px] font-mono text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded">
                        {bins.length} step snapshots
                      </span>
                    </div>

                    <div className="space-y-3">
                      {bins.map((snapshot, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <span>Step {snapshot.step}</span>
                            <span>Range: [{snapshot.min.toFixed(2)}, {snapshot.max.toFixed(2)}]</span>
                          </div>
                          {/* Visual histogram bars */}
                          <div className="h-7 bg-slate-950 rounded-lg p-1 flex items-end gap-1 border border-slate-800">
                            {snapshot.counts.map((count, cIdx) => {
                              const maxCount = Math.max(...snapshot.counts);
                              const heightPct = Math.max(10, Math.round((count / maxCount) * 100));
                              return (
                                <div
                                  key={cIdx}
                                  className="flex-1 bg-gradient-to-t from-orange-600 to-amber-400 rounded-sm hover:brightness-125 transition"
                                  style={{ height: `${heightPct}%` }}
                                  title={`Bin ${snapshot.bins[cIdx]}: ${count} weights`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. DISTRIBUTIONS TAB */}
          {activeTab === 'distributions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                    <Box className="w-4 h-4 text-orange-400" />
                    Percentile Distribution Curves
                  </h2>
                  <p className="text-xs text-slate-400">Continuous 5th, 25th, 50th, 75th, and 95th weight percentiles for convergence stability</p>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
                <p className="text-xs text-slate-300 font-mono">
                  Percentile distributions verify absence of vanishing or exploding gradients throughout deep residual connections.
                </p>
                <div className="h-64 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-center font-mono space-y-2">
                    <Sparkles className="w-8 h-8 text-orange-400 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-300">All weight bounds stabilized within [-0.25, +0.28] standard deviation.</p>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                      Normal Gaussian Variance Confirmed (Kaiming Init)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. HPARAMS TAB */}
          {activeTab === 'hparams' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange-400" />
                    Hyperparameter Optimization (HParams)
                  </h2>
                  <p className="text-xs text-slate-400">Multi-run comparative analysis across learning rate, optimizers, batch size, and validation metrics</p>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Run Identifier</th>
                      <th className="p-3">Framework</th>
                      <th className="p-3">Optimizer</th>
                      <th className="p-3">Learning Rate</th>
                      <th className="p-3">Batch Size</th>
                      <th className="p-3">Precision</th>
                      <th className="p-3">Val Loss</th>
                      <th className="p-3">Val Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {runs.map(run => {
                      const latestValLoss = run.scalars.val_loss[run.scalars.val_loss.length - 1]?.value || 0;
                      const latestValAcc = run.scalars.val_accuracy[run.scalars.val_accuracy.length - 1]?.value || 0;
                      return (
                        <tr key={run.id} className="hover:bg-slate-800/50 transition">
                          <td className="p-3 font-bold text-slate-200 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: run.color }} />
                            {run.name}
                          </td>
                          <td className="p-3 text-slate-400">{run.framework}</td>
                          <td className="p-3 text-orange-400 font-bold">{run.hparams.optimizer}</td>
                          <td className="p-3 text-slate-300">{run.hparams.learning_rate}</td>
                          <td className="p-3 text-slate-300">{run.hparams.batch_size}</td>
                          <td className="p-3 text-slate-400">{run.hparams.precision}</td>
                          <td className="p-3 text-emerald-400 font-bold">{latestValLoss}</td>
                          <td className="p-3 text-amber-400 font-bold">{(latestValAcc * 100).toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. PROFILER TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-orange-400" />
                    Hardware & Memory Compute Profiler
                  </h2>
                  <p className="text-xs text-slate-400">GPU kernel time, Tensor Core utilization, peak VRAM allocations, and operator execution breakdown</p>
                </div>
              </div>

              {activeRuns[0]?.profiler ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Active VRAM Allocation</span>
                    <span className="text-xl font-black font-mono text-orange-400 mt-1 block">
                      {activeRuns[0].profiler.gpuMemoryMb} MB
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Peak: {activeRuns[0].profiler.peakMemoryMb} MB</span>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Compute Throughput</span>
                    <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
                      {activeRuns[0].profiler.flopsG} GFLOP/s
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Theoretical max: 14.2 TFLOP/s</span>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Tensor Core Utilization</span>
                    <span className="text-xl font-black font-mono text-amber-400 mt-1 block">
                      {activeRuns[0].profiler.tensorCoreUtilization}%
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Optimal FP16/BF16 GEMM</span>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Device Runtime Backend</span>
                    <span className="text-base font-bold font-mono text-slate-200 mt-1 block">
                      CUDA 12.4 / cuDNN 8.9
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Host: PyTorch / TF XLA</span>
                  </div>

                  {/* Operator Runtime Breakdown */}
                  <div className="col-span-full bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-xl">
                    <h4 className="text-xs font-black uppercase tracking-wider font-mono text-slate-200 mb-3">
                      Operator Kernel Execution Time Breakdown
                    </h4>
                    <div className="space-y-2 font-mono text-xs">
                      {activeRuns[0].profiler.opBreakdown.map((op, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-300">
                            <span>{op.name}</span>
                            <span>{op.percentage}% ({op.timeMs} ms)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full"
                              style={{ width: `${op.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">No profiler trace data available</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
