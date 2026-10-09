import React, { useState, useEffect, useRef } from 'react';
import { MOCK_SIMULATION_RUNS } from '../../../constants';
import { SimulationRun } from '../../../types';

declare const Plotly: any;

export const UniversalPrePostProcessor: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [runA, setRunA] = useState<SimulationRun>(MOCK_SIMULATION_RUNS[0]);
    const [runB, setRunB] = useState<SimulationRun>(MOCK_SIMULATION_RUNS[1]);

    useEffect(() => {
        if (chartRef.current && runA && runB) {
            Plotly.newPlot(chartRef.current, [
                {
                    ...runA.plotData,
                    type: 'surface',
                    name: runA.name,
                    showscale: false,
                    opacity: 0.9,
                    colorscale: 'Blues'
                },
                {
                    ...runB.plotData,
                    type: 'surface',
                    name: runB.name,
                    showscale: false,
                    opacity: 0.7,
                    colorscale: 'Reds'
                }
            ], {
                title: 'Simulation Comparison',
                paper_bgcolor: 'transparent',
                plot_bgcolor: '#1f2937', // gray-800
                font: { color: '#e2e8f0' },
                scene: {
                    xaxis: { title: 'X-axis', gridcolor: '#4b5563', backgroundcolor: '#0f172a' },
                    yaxis: { title: 'Y-axis', gridcolor: '#4b5563', backgroundcolor: '#0f172a' },
                    zaxis: { title: 'Stress (MPa)', gridcolor: '#4b5563', backgroundcolor: '#0f172a' },
                },
                legend: {
                    x: 0,
                    y: 1,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    bordercolor: '#4b5563'
                }
            }, {responsive: true});
        }
    }, [runA, runB]);

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold text-brand-light mb-4">Universal Pre/Post-Processor</h1>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Compare Run A:</label>
                        <select
                            value={runA.id}
                            onChange={(e) => setRunA(MOCK_SIMULATION_RUNS.find(r => r.id === e.target.value)!)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                        >
                            {MOCK_SIMULATION_RUNS.map(run => <option key={run.id} value={run.id}>{run.name}</option>)}
                        </select>
                        <p className="text-xs text-gray-400 mt-2">{runA.description}</p>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">With Run B:</label>
                        <select
                            value={runB.id}
                            onChange={(e) => setRunB(MOCK_SIMULATION_RUNS.find(r => r.id === e.target.value)!)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                        >
                            {MOCK_SIMULATION_RUNS.map(run => <option key={run.id} value={run.id}>{run.name}</option>)}
                        </select>
                         <p className="text-xs text-gray-400 mt-2">{runB.description}</p>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-lg min-h-[400px]">
                    <div ref={chartRef} className="w-full h-full" />
                </div>
            </div>
        </div>
    );
};
