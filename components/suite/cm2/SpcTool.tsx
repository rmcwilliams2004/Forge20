
import React, { useEffect, useRef, useMemo } from 'react';
import { MOCK_SPC_DATA } from '../../../constants';

declare const Plotly: any;

const calculateStats = (data: number[][]) => {
    const subgroupAverages = data.map(subgroup => subgroup.reduce((a, b) => a + b, 0) / subgroup.length);
    const subgroupRanges = data.map(subgroup => Math.max(...subgroup) - Math.min(...subgroup));

    const grandAverage = subgroupAverages.reduce((a, b) => a + b, 0) / subgroupAverages.length;
    const averageRange = subgroupRanges.reduce((a, b) => a + b, 0) / subgroupRanges.length;

    // A2, D3, D4 constants for subgroup size of 5
    const A2 = 0.577;
    const D3 = 0;
    const D4 = 2.114;

    const xBarUCL = grandAverage + A2 * averageRange;
    const xBarLCL = grandAverage - A2 * averageRange;
    const rChartUCL = D4 * averageRange;
    const rChartLCL = D3 * averageRange;
    
    // Process Capability
    const USL = 12; // Upper Spec Limit
    const LSL = 8;  // Lower Spec Limit
    
    // Estimate standard deviation
    const d2 = 2.326; // for n=5
    const stdDev = averageRange / d2;

    const cp = (USL - LSL) / (6 * stdDev);
    const cpk = Math.min((USL - grandAverage) / (3 * stdDev), (grandAverage - LSL) / (3 * stdDev));

    return {
        subgroupAverages,
        subgroupRanges,
        grandAverage,
        averageRange,
        xBarUCL,
        xBarLCL,
        rChartUCL,
        rChartLCL,
        cp, cpk
    };
};

interface SpcToolProps {
    onOutlierDetected?: () => void;
}

export const SpcTool: React.FC<SpcToolProps> = ({ onOutlierDetected }) => {
    const xBarChartRef = useRef<HTMLDivElement>(null);
    const rChartRef = useRef<HTMLDivElement>(null);

    const data = useMemo(() => MOCK_SPC_DATA.map(subgroup => subgroup.map(d => d.value)), []);
    const stats = useMemo(() => calculateStats(data), [data]);

    useEffect(() => {
        if (xBarChartRef.current && rChartRef.current) {
            const outOfControlX = stats.subgroupAverages.map((avg, i) => (avg > stats.xBarUCL || avg < stats.xBarLCL) ? {x: i+1, y: avg} : null).filter(Boolean);
            const outOfControlR = stats.subgroupRanges.map((r, i) => (r > stats.rChartUCL || r < stats.rChartLCL) ? {x: i+1, y: r} : null).filter(Boolean);

            const commonLayout = {
                paper_bgcolor: 'transparent',
                plot_bgcolor: '#1f2937', // gray-800
                font: { color: '#e2e8f0' },
                xaxis: { title: 'Subgroup', gridcolor: '#4b5563' },
                yaxis: { gridcolor: '#4b5563' },
                showlegend: false,
                margin: { l: 40, r: 20, t: 40, b: 40 },
            };

            // X-bar Chart
            Plotly.newPlot(xBarChartRef.current, [{
                x: Array.from({ length: stats.subgroupAverages.length }, (_, i) => i + 1),
                y: stats.subgroupAverages,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'Avg',
                marker: { color: '#06b6d4' }
            }, {
                x: outOfControlX.map(p => p?.x),
                y: outOfControlX.map(p => p?.y),
                mode: 'markers',
                type: 'scatter',
                name: 'Out of Control',
                marker: { color: 'red', size: 10, symbol: 'x' }
            }], { 
                ...commonLayout, 
                title: 'X-bar Chart', 
                shapes: [
                    { type: 'line', x0: 0, x1: 1, xref: 'paper', y0: stats.xBarUCL, y1: stats.xBarUCL, line: { color: 'red', dash: 'dash' } },
                    { type: 'line', x0: 0, x1: 1, xref: 'paper', y0: stats.grandAverage, y1: stats.grandAverage, line: { color: 'green' } },
                    { type: 'line', x0: 0, x1: 1, xref: 'paper', y0: stats.xBarLCL, y1: stats.xBarLCL, line: { color: 'red', dash: 'dash' } },
                ]
            });

            // R Chart
            Plotly.newPlot(rChartRef.current, [{
                x: Array.from({ length: stats.subgroupRanges.length }, (_, i) => i + 1),
                y: stats.subgroupRanges,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'Range',
                marker: { color: '#a78bfa' }
            },{
                 x: outOfControlR.map(p => p?.x),
                y: outOfControlR.map(p => p?.y),
                mode: 'markers',
                type: 'scatter',
                name: 'Out of Control',
                marker: { color: 'red', size: 10, symbol: 'x' }
            }], { 
                ...commonLayout, 
                title: 'R Chart',
                shapes: [
                    { type: 'line', x0: 0, x1: 1, xref: 'paper', y0: stats.rChartUCL, y1: stats.rChartUCL, line: { color: 'red', dash: 'dash' } },
                    { type: 'line', x0: 0, x1: 1, xref: 'paper', y0: stats.averageRange, y1: stats.averageRange, line: { color: 'green' } },
                ]
            });
        }
    }, [stats]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-brand-light">Statistical Process Control (SPC)</h1>
                {onOutlierDetected && (
                    <button 
                        onClick={onOutlierDetected}
                        className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition active:scale-95 text-sm flex items-center gap-2"
                        title="Simulate a production anomaly to trigger the Closed-Loop Quality System"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                        Simulate Out-of-Control Event
                    </button>
                )}
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-rows-2 gap-6">
                    <div ref={xBarChartRef} className="bg-gray-800/50 border border-gray-700 rounded-lg p-2" />
                    <div ref={rChartRef} className="bg-gray-800/50 border border-gray-700 rounded-lg p-2" />
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-6">
                    <h2 className="text-xl font-bold text-brand-cyan">Process Metrics</h2>
                    <div className="text-center bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Process Capability (Cp)</p>
                        <p className={`text-4xl font-bold ${stats.cp < 1 ? 'text-red-400' : 'text-green-400'}`}>{stats.cp.toFixed(3)}</p>
                    </div>
                     <div className="text-center bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Process Capability (Cpk)</p>
                        <p className={`text-4xl font-bold ${stats.cpk < 1 ? 'text-red-400' : 'text-green-400'}`}>{stats.cpk.toFixed(3)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
