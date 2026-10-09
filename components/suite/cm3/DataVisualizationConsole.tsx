
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CHART_DATA } from '../../../constants';
import { ChartData, PhysicsValidationResult } from '../../../types';

declare const Plotly: any;

interface DataVisualizationConsoleProps {
    physicsTelemetry?: PhysicsValidationResult | null;
}

export const DataVisualizationConsole: React.FC<DataVisualizationConsoleProps> = ({ physicsTelemetry }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [selectedChartId, setSelectedChartId] = useState<string>(MOCK_CHART_DATA[0].id);
    const [viewMode, setViewMode] = useState<'standard' | 'physics'>('standard');

    useEffect(() => {
        if (physicsTelemetry) setViewMode('physics');
    }, [physicsTelemetry]);

    useEffect(() => {
        if (chartRef.current && viewMode === 'standard') {
            const selectedChart = MOCK_CHART_DATA.find(c => c.id === selectedChartId);
            if (!selectedChart) return;

            let data: any;
            let layout: any;

            const commonLayout = {
                paper_bgcolor: 'transparent',
                plot_bgcolor: '#111827', // gray-900
                font: { color: '#e2e8f0' },
                xaxis: { gridcolor: '#374151' },
                yaxis: { gridcolor: '#374151' },
                margin: { l: 60, r: 20, t: 60, b: 60 },
            };

            switch (selectedChart.type) {
                case 'bode':
                    data = [
                        { x: selectedChart.data.freq, y: selectedChart.data.magnitude, type: 'scatter', mode: 'lines', name: 'Magnitude', line: { color: '#06b6d4' } },
                        { x: selectedChart.data.freq, y: selectedChart.data.phase, type: 'scatter', mode: 'lines', name: 'Phase', yaxis: 'y2', line: { color: '#a78bfa'} }
                    ];
                    layout = { 
                        ...commonLayout, 
                        title: selectedChart.name, 
                        xaxis: { type: 'log', title: 'Frequency (Hz)' }, 
                        yaxis: { title: 'Magnitude (dB)' }, 
                        yaxis2: { title: 'Phase (deg)', overlaying: 'y', side: 'right' },
                        legend: { orientation: 'h', y: -0.2 }
                    };
                    break;
                case 'stress-strain':
                    data = [{ x: selectedChart.data.strain, y: selectedChart.data.stress, type: 'scatter', mode: 'lines', line: { color: '#06b6d4' } }];
                    layout = { ...commonLayout, title: selectedChart.name, xaxis: { title: 'Strain (in/in)' }, yaxis: { title: 'Stress (MPa)' } };
                    break;
                default:
                    data = [];
                    layout = {};
            }
            Plotly.newPlot(chartRef.current, data, layout, {responsive: true, displaylogo: false});
        }
    }, [selectedChartId, viewMode]);

    return (
         <div className="h-full flex flex-col animate-fade-in bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-brand-light uppercase tracking-tighter italic">Data Console</h1>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real-Time Telemetry Feed</p>
                </div>
                <div className="flex gap-2 p-1 bg-gray-800 rounded-xl border border-gray-700 shadow-inner">
                    <button 
                        onClick={() => setViewMode('standard')} 
                        className={`px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'standard' ? 'bg-brand-cyan text-gray-900 shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Analytical
                    </button>
                    <button 
                        onClick={() => setViewMode('physics')} 
                        className={`px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${viewMode === 'physics' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${physicsTelemetry ? 'bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]' : 'bg-gray-600'}`}></div>
                        Genesis (4D)
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {viewMode === 'standard' ? (
                    <>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between shadow-inner">
                            <div className="w-full max-w-xs">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Metric Stream</label>
                                <select
                                    value={selectedChartId}
                                    onChange={(e) => setSelectedChartId(e.target.value)}
                                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white focus:border-brand-cyan outline-none font-bold"
                                >
                                    {MOCK_CHART_DATA.map(chart => <option key={chart.id} value={chart.id}>{chart.name}</option>)}
                                </select>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest block">Stream Health</span>
                                <span className="text-xs font-mono text-gray-400">NOMINAL // 124ms</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                            <div ref={chartRef} className="w-full h-full" />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 bg-black/40 border border-gray-800 rounded-2xl p-8 overflow-y-auto custom-scrollbar shadow-inner relative">
                        {!physicsTelemetry ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                                <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center text-gray-600 border border-gray-700 transform rotate-12 shadow-2xl">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-300 uppercase tracking-tighter italic">Genesis Solver Standby</h3>
                                    <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 font-medium">Trigger a 'Real-World Test' from the simulation dashboard to stream 4D physics telemetry into this terminal.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-10 animate-fade-in">
                                <div className="flex justify-between items-end border-b border-gray-800 pb-8">
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.3em] leading-none">Live Solve ID: {physicsTelemetry.simulation_id}</h3>
                                        <div className="flex items-baseline gap-4">
                                            <span className={`text-6xl font-black italic tracking-tighter leading-none ${physicsTelemetry.status === 'STABLE' ? 'text-green-500' : 'text-red-500'}`}>
                                                {physicsTelemetry.status.replace('_', ' ')}
                                            </span>
                                            <span className="px-3 py-1 bg-gray-800 rounded-lg text-[10px] font-black text-gray-400 border border-gray-700 uppercase tracking-widest">
                                                {new Date(physicsTelemetry.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Solver Algorithm</p>
                                        <p className="text-sm font-mono text-white bg-gray-800 px-3 py-1 rounded-lg border border-gray-700 inline-block">{physicsTelemetry.solver_path}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></span>
                                            Failure Coordinate Matrix
                                        </h4>
                                        <div className="space-y-3">
                                            {physicsTelemetry.failure_telemetry ? (
                                                physicsTelemetry.failure_telemetry.map((fail, i) => (
                                                    <div key={i} className="p-5 bg-gray-900 border border-gray-800 rounded-2xl group hover:border-red-500/50 transition-all shadow-xl">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="px-2 py-0.5 bg-red-900/30 border border-red-500/30 rounded text-[10px] font-black text-red-400 uppercase tracking-widest">{fail.type}</div>
                                                            <span className="text-[11px] font-black text-gray-500 font-mono">M_LOAD: {fail.magnitude || fail.delta_t}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                                            <div className="p-2 bg-black/50 rounded-xl text-[11px] text-center font-black font-mono text-gray-300 border border-gray-800 group-hover:border-red-900/50">X: {fail.coordinates.x}</div>
                                                            <div className="p-2 bg-black/50 rounded-xl text-[11px] text-center font-black font-mono text-gray-300 border border-gray-800 group-hover:border-red-900/50">Y: {fail.coordinates.y}</div>
                                                            <div className="p-2 bg-black/50 rounded-xl text-[11px] text-center font-black font-mono text-gray-300 border border-gray-800 group-hover:border-red-900/50">Z: {fail.coordinates.z}</div>
                                                        </div>
                                                        <p className="text-xs text-gray-400 font-medium leading-relaxed italic">"{fail.description}"</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-10 bg-green-900/10 border border-green-500/20 rounded-3xl text-center shadow-inner">
                                                    <p className="text-sm text-green-400 font-black uppercase tracking-widest">Nodal Lattice Verified</p>
                                                    <p className="text-[10px] text-gray-500 mt-2">Zero structural breaches detected in current environmental domain.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-brand-cyan uppercase tracking-[0.25em] flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full shadow-[0_0_8px_#06b6d4]"></span>
                                            Solver Constraint Profile
                                        </h4>
                                        <div className="p-8 bg-gray-900 rounded-3xl border border-gray-800 space-y-6 shadow-2xl">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-bold uppercase tracking-widest">Elasticity (NAL)</span>
                                                <span className="text-white font-black font-mono bg-gray-800 px-2 py-1 rounded">1.2 TPa</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-bold uppercase tracking-widest">Mesh Density</span>
                                                <span className="text-white font-black font-mono bg-gray-800 px-2 py-1 rounded">2100 kg/m³</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-bold uppercase tracking-widest">Compute Cycle</span>
                                                <span className="text-white font-black font-mono bg-gray-800 px-2 py-1 rounded">100 / 100</span>
                                            </div>
                                            
                                            <div className="pt-8 border-t border-gray-800">
                                                <div className="flex justify-between items-end mb-3">
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Stability Probability</span>
                                                        <span className="text-2xl font-black text-brand-cyan italic">94.2%</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">Confidence High</span>
                                                </div>
                                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden shadow-inner">
                                                    <div className="bg-brand-cyan h-full w-[94.2%] shadow-[0_0_15px_#06b6d4] transition-all duration-1000 ease-out"></div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-indigo-900/10 rounded-2xl border border-indigo-500/20">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Handshake Status</p>
                                                <p className="text-[10px] font-bold text-gray-300 uppercase leading-tight font-mono">{physicsTelemetry.engine_handshake}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
            `}</style>
        </div>
    );
};
