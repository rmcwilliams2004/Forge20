import React, { useState } from 'react';
import { RcaData } from '../../../types';
import { MOCK_RCA_DATA } from '../../../constants';

const FiveWhys: React.FC<{ data: RcaData }> = ({ data }) => (
    <div className="space-y-4">
        {data.fiveWhys.map((why, index) => (
            <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-800 text-brand-cyan font-bold flex items-center justify-center">{index + 1}</div>
                <div className="pt-1 text-gray-300">{why.split('-')[1]}</div>
            </div>
        ))}
    </div>
);

const FishboneDiagram: React.FC<{ data: RcaData }> = ({ data }) => {
    const categories = Object.keys(data.fishbone) as (keyof typeof data.fishbone)[];
    return (
        <div className="w-full h-[500px] bg-gray-900/50 rounded-lg p-4 relative">
            <svg width="100%" height="100%" viewBox="0 0 800 400">
                {/* Main Spine */}
                <line x1="50" y1="200" x2="700" y2="200" stroke="#06b6d4" strokeWidth="3" />
                {/* Head (Problem) */}
                <rect x="690" y="175" width="100" height="50" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                <text x="740" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="12">{data.problem}</text>
                
                {categories.map((cat, i) => {
                    const isTop = i % 2 === 0;
                    const y = isTop ? 100 : 300;
                    const lineYEnd = 200 + (isTop ? -15 : 15);
                    const textY = isTop ? y - 10 : y + 20;
                    const x = 150 + i * 100;

                    return (
                        <g key={cat}>
                            {/* Main Bone */}
                            <line x1={x} y1={y} x2={x} y2={lineYEnd} stroke="#60a5fa" strokeWidth="2" />
                            <text x={x} y={textY} textAnchor="middle" fill="#93c5fd" fontWeight="bold">{cat}</text>
                            
                            {/* Sub-Bones (Causes) */}
                            {data.fishbone[cat].map((cause, j) => {
                                const causeY = y + (isTop ? 1 : -1) * (15 + j * 20);
                                const causeLineYEnd = y + (isTop ? 5 : -5);
                                return (
                                    <g key={j}>
                                        <line x1={x - 40} y1={causeY} x2={x} y2={causeLineYEnd} stroke="#a5b4fc" strokeWidth="1" />
                                        <text x={x - 45} y={causeY + 4} textAnchor="end" fill="#c7d2fe" fontSize="10">{cause}</text>
                                    </g>
                                )
                            })}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};


export const RcaTool: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'5whys' | 'fishbone'>('5whys');
    const [data] = useState<RcaData>(MOCK_RCA_DATA);

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold text-brand-light mb-2">Root Cause Analysis (RCA) Tool</h1>
            <p className="text-gray-400 mb-4">Problem: <span className="font-semibold text-brand-light">"{data.problem}"</span></p>

            <div className="flex border-b border-gray-600 mb-4">
                <button onClick={() => setActiveTab('5whys')} className={`flex-1 pb-2 font-semibold ${activeTab === '5whys' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-gray-400'}`}>5 Whys</button>
                <button onClick={() => setActiveTab('fishbone')} className={`flex-1 pb-2 font-semibold ${activeTab === 'fishbone' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-gray-400'}`}>Fishbone Diagram</button>
            </div>
            
            <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                {activeTab === '5whys' ? <FiveWhys data={data} /> : <FishboneDiagram data={data} />}
            </div>
        </div>
    );
};
