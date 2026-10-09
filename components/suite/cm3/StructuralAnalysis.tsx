
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SynapseForgeAnalysis } from '../../../services/mathLabService';
import { unitService } from '../../../services/unitService';
import { CadViewerModal } from '../../cad/CadViewerModal';
import { CadData, Material } from '../../../types';

interface StructuralAnalysisProps {
    activeMaterial?: Material | null;
}

export const StructuralAnalysis: React.FC<StructuralAnalysisProps> = ({ activeMaterial }) => {
    const [mode, setMode] = useState<'Structural' | 'Thermal'>('Structural');

    // Structural State
    const [load, setLoad] = useState(15);
    const [loadUnit, setLoadUnit] = useState('kN');
    const [length, setLength] = useState(5.0);
    const [lengthUnit, setLengthUnit] = useState('m');
    const [inertia, setInertia] = useState(500);
    const [inertiaUnit, setInertiaUnit] = useState('in4');

    // Thermal State
    const [tempDelta, setTempDelta] = useState(100);

    const [targetUnit, setTargetUnit] = useState('mm');
    const [result, setResult] = useState<{ value: number, unit: string, metadata: any } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 3D Visualization State
    const [show3D, setShow3D] = useState(false);
    const [cadData, setCadData] = useState<CadData | null>(null);

    const handleCalculate = useCallback(() => {
        if (!activeMaterial?.materialData) {
            setError("Disciplinary error: Active Material Context required for NAL solving.");
            return;
        }

        try {
            setError(null);
            if (mode === 'Structural') {
                const output = SynapseForgeAnalysis.calculateBeamDeflection(
                    { value: load, unitId: loadUnit },
                    { value: length, unitId: lengthUnit },
                    activeMaterial.materialData,
                    { value: inertia, unitId: inertiaUnit },
                    targetUnit
                );
                setResult(output);
            } else {
                const output = SynapseForgeAnalysis.calculateThermalConstraint(
                    activeMaterial.materialData,
                    tempDelta,
                    'MPa'
                );
                setResult(output);
            }
        } catch (err: any) {
            setError(err.message);
            setResult(null);
        }
    }, [load, loadUnit, length, lengthUnit, inertia, inertiaUnit, targetUnit, activeMaterial, mode, tempDelta]);

    useEffect(() => {
        handleCalculate();
    }, [handleCalculate]);

    const handleVisualize = () => {
        const beamLengthMM = length * (lengthUnit === 'm' ? 1000 : (lengthUnit === 'ft' ? 304.8 : (lengthUnit === 'in' ? 25.4 : 1)));
        const beamWidthMM = beamLengthMM / 20; 

        const data: CadData = {
            assemblyName: `NAL Solve: ${activeMaterial?.name}`,
            units: 'mm',
            components: [
                {
                    name: "Cantilever Beam",
                    shape: 'cube',
                    dimensions: { x: beamLengthMM, y: beamWidthMM, z: beamWidthMM },
                    position: { x: beamLengthMM / 2, y: 0, z: 0 }
                },
                {
                    name: "Fixed Support",
                    shape: 'cube',
                    dimensions: { x: beamWidthMM / 2, y: beamWidthMM * 3, z: beamWidthMM * 3 },
                    position: { x: -beamWidthMM / 4, y: 0, z: 0 }
                }
            ]
        };
        setCadData(data);
        setShow3D(true);
    };

    return (
        <div className="h-full flex flex-col animate-fade-in">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-brand-light uppercase italic tracking-tighter">Structural Analysis</h1>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Tier-2 Numerical Abstraction Layer (NAL) active</p>
                </div>
                <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800 shadow-inner">
                    <button onClick={() => setMode('Structural')} className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Structural' ? 'bg-brand-cyan text-gray-900 shadow-lg' : 'text-gray-500 hover:text-white'}`}>Deflection</button>
                    <button onClick={() => setMode('Thermal')} className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Thermal' ? 'bg-brand-cyan text-gray-900 shadow-lg' : 'text-gray-500 hover:text-white'}`}>Thermal Stress</button>
                </div>
            </header>

            {!activeMaterial && (
                <div className="bg-indigo-900/10 border border-indigo-500/20 p-8 rounded-2xl text-center space-y-4 mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-full w-fit mx-auto border border-indigo-500/30">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-indigo-300 uppercase tracking-widest">Library Handshake Required</h4>
                        <p className="text-xs text-gray-500 mt-2">Inject a material from the <span className="text-brand-cyan font-bold">Material Selector</span> to enable NAL physical solves.</p>
                    </div>
                </div>
            )}

            <div className={`flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-300 ${!activeMaterial ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                {/* Input Panel */}
                <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-2xl p-8 space-y-8 shadow-xl">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-brand-cyan uppercase tracking-widest flex items-center gap-3 italic">
                             <span className="w-2 h-2 bg-brand-cyan rounded-full shadow-[0_0_10px_#06b6d4]"></span>
                             Scenario Parameters
                        </h3>
                        <button onClick={handleVisualize} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-gray-600">
                            Render Physical Setup
                        </button>
                    </div>
                    
                    {mode === 'Structural' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4 items-center bg-black/20 p-4 rounded-xl border border-gray-800">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Applied Load</label>
                                <input type="number" value={load} onChange={e => setLoad(parseFloat(e.target.value))} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm font-mono focus:border-brand-cyan outline-none" />
                                <select value={loadUnit} onChange={e => setLoadUnit(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-[10px] font-black uppercase tracking-widest outline-none">
                                    <option value="N">N</option><option value="kN">kN</option><option value="lbf">lbf</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4 items-center bg-black/20 p-4 rounded-xl border border-gray-800">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Beam Length</label>
                                <input type="number" value={length} onChange={e => setLength(parseFloat(e.target.value))} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm font-mono focus:border-brand-cyan outline-none" />
                                <select value={lengthUnit} onChange={e => setLengthUnit(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-[10px] font-black uppercase tracking-widest outline-none">
                                    <option value="m">m</option><option value="mm">mm</option><option value="ft">ft</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4 items-center bg-black/20 p-4 rounded-xl border border-gray-800">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Area Inertia</label>
                                <input type="number" value={inertia} onChange={e => setInertia(parseFloat(e.target.value))} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm font-mono focus:border-brand-cyan outline-none" />
                                <select value={inertiaUnit} onChange={e => setInertiaUnit(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-[10px] font-black uppercase tracking-widest outline-none">
                                    <option value="m4">m⁴</option><option value="mm4">mm⁴</option><option value="in4">in⁴</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-black/20 p-6 rounded-xl border border-gray-800">
                                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Temperature Gradient (ΔT Celsius)</label>
                                <input type="range" min="-200" max="1500" value={tempDelta} onChange={e => setTempDelta(parseInt(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan" />
                                <div className="flex justify-between mt-2 font-mono text-lg font-bold text-white italic">
                                    <span>{tempDelta}°C</span>
                                    <span className="text-[10px] text-gray-600 uppercase font-black self-end mb-1">Thermal Delta</span>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl">
                                <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-1">Thermal Solver Note</p>
                                <p className="text-xs text-gray-500 leading-relaxed italic">"Calculating internal stresses based on thermal expansion coefficient alpha extracted from the material library."</p>
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-purple-900/10 rounded-2xl border border-purple-500/30 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.944l-2.09 3.908a1 1 0 01-1.323.407L3.582 5.897a1 1 0 00-1.447.384 1 1 0 00.384 1.446l3.13 1.53a1 1 0 01.407 1.323l-2.09 3.908a1 1 0 001.066 1.508 1 1 0 00.767-.744l2.09-3.908a1 1 0 011.323-.407l3.13 1.53a1 1 0 001.447-.384 1 1 0 00-.384-1.446l-3.13-1.53a1 1 0 01-.407-1.323l2.09-3.908a1 1 0 00-.385-1.45z" clipRule="evenodd" /></svg>
                             </div>
                             <div>
                                 <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">NAL Material Feed</p>
                                 <p className="text-sm font-bold text-white leading-none mt-1">{activeMaterial?.name}</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <span className="text-[8px] font-black text-gray-500 uppercase block mb-1">Young's Modulus</span>
                             <span className="text-xs font-mono text-purple-400 font-bold">{activeMaterial?.materialData?.youngsModulus} GPa</span>
                         </div>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-10 flex flex-col justify-center items-center text-center shadow-inner relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-brand-cyan/5 blur-3xl pointer-events-none"></div>

                    {error ? (
                        <div className="bg-red-900/30 border border-red-500 text-red-200 p-6 rounded-2xl animate-fade-in relative z-10">
                            <h4 className="font-black uppercase tracking-widest mb-2">Computational Error</h4>
                            <p className="text-sm italic">"{error}"</p>
                        </div>
                    ) : result ? (
                        <div className="space-y-8 animate-fade-in relative z-10 w-full">
                            <div>
                                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{mode === 'Structural' ? 'Max Elastic Deflection' : 'Internal Thermal Stress'}</h3>
                                <div className="flex items-baseline justify-center gap-4">
                                    <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{result.value.toFixed(4)}</span>
                                    <span className="text-2xl font-black text-brand-cyan uppercase tracking-widest italic">{result.unit}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 text-left">
                                <div className="p-5 bg-black/40 rounded-2xl border border-gray-800 space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">NAL SOLVER PROOF</p>
                                        <span className="text-[9px] font-mono text-brand-cyan/60">{result.metadata.source}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(result.metadata.constantsPull || result.metadata).map(([k, v]) => {
                                            if (typeof v === 'object') return null;
                                            return (
                                                <div key={k}>
                                                    <span className="block text-[8px] font-bold text-gray-600 uppercase tracking-tighter mb-1">{k.replace(/_/g, ' ')}</span>
                                                    <span className="text-xs font-mono text-gray-300">{String(v)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter block mb-1">Ledger Sync</span>
                                        <span className="text-[9px] font-mono text-gray-500">{new Date(result.metadata.timestamp).toLocaleTimeString()} // AES_256_ACTIVE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-600 space-y-4 animate-pulse">
                            <svg className="w-16 h-16 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Physical Calibration</p>
                        </div>
                    )}
                </div>
            </div>
            
            {cadData && (
                <CadViewerModal
                    isOpen={show3D}
                    onClose={() => setShow3D(false)}
                    cadData={cadData}
                    isViewer={false}
                />
            )}
        </div>
    );
};
