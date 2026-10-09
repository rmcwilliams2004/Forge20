import React, { useState, useEffect, useRef } from 'react';
import { BillOfMaterialsItem, SimulationResult, SimulationType, User, CadData, LogEntry } from '../../types';
import { useSimulation } from '../../hooks/useSimulation';
import { useTts } from '../../hooks/useTts';
import { useDeVinci } from '../../hooks/useDeVinci';
import { 
  Mic, Play, Square, MessageSquare, Wrench, ArrowRight, Save, CheckCircle, 
  Activity, Wind, Thermometer, Radio, Zap, Layers, AlertTriangle, Loader2, Settings
} from 'lucide-react';

interface AdvancedSimulationProps {
    bom: BillOfMaterialsItem[];
    simulation: ReturnType<typeof useSimulation>;
    productContext: string;
    isViewer: boolean;
    cadData: CadData | null;
    onOpenCadViewer?: () => void;
    addLog?: (level: LogEntry['level'], message: string) => void;
    onSaveSimulation?: (result: SimulationResult) => void;
    savedSimulations?: SimulationResult[];
    tts: ReturnType<typeof useTts>;
    authenticatedUser: User;
}

const SimulationTypeButton = ({ type, currentType, setType, icon: Icon, label, desc }: any) => {
    const isActive = type === currentType;
    return (
        <button 
            onClick={() => setType(type)} 
            className={`relative flex flex-col items-start p-4 rounded-xl border transition-all duration-200 w-full text-left group ${
                isActive 
                ? 'bg-cyan-900/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 hover:border-brand-cyan dark:hover:border-slate-500'
            }`}
        >
            <div className={`p-2 rounded-lg mb-3 ${isActive ? 'bg-cyan-50 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 group-hover:text-brand-cyan'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`text-sm font-bold mb-1 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'}`}>{label}</span>
            <span className="text-[10px] text-gray-500 dark:text-slate-500 leading-tight">{desc}</span>
        </button>
    );
};

export const AdvancedSimulation: React.FC<AdvancedSimulationProps> = ({ 
    bom, simulation, productContext, isViewer, cadData, onOpenCadViewer, addLog, onSaveSimulation, savedSimulations = [], tts, authenticatedUser 
}) => {
    const [selectedType, setSelectedType] = useState<SimulationType>('FEA');
    const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
    const [status, setStatus] = useState<string[]>([]);
    
    const [consultantAnalysis, setConsultantAnalysis] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<{label: string, action: () => void}[]>([]);
    const analysisRef = useRef<HTMLDivElement>(null);

    const devinci = useDeVinci();
    const { simulationResult, isPhysicsActive, physicsResult, runSimulation, runGenesisVerification } = simulation;

    const handleStartDeVinciSession = () => {
        devinci.startConversation({
            authenticatedUser,
            voice: 'Zephyr',
            systemInstruction: `You are the Holo-Simulation Consultant for ${productContext}. 
            You are reviewing the results of a ${selectedType} simulation. 
            If a failure is detected in telemetry, suggest geometric reinforcements. 
            Be professional, highly technical, and use physics-based reasoning.`,
            activeCad: cadData
        });
    };

    const generateConsultantReport = () => {
        let report = "";
        let newSuggestions = [];

        if (physicsResult) {
            const stress = physicsResult.telemetry?.max_stress || 0;
            const stability = physicsResult.telemetry?.stability_index || 0;
            const isStable = physicsResult.status === 'STABLE';

            if (!isStable) {
                report = `Critical failure detected in the nodal lattice. The maximum stress of ${stress.toFixed(2)} Gigapascals exceeds the material's current yield limit. Immediate rupture risk under operating loads. I suggest increasing structural thickness or evaluating high-density composites.`;
                newSuggestions.push({ label: "Auto-Reinforce (+15% Thickness)", action: () => alert("Geometry reinforcement queued in Foundry.") });
            } else {
                report = `Excellent results. The assembly is holding stable with a calculated stability index of ${stability.toFixed(2)}. Thermal dissipation vectors are optimized. We are clear for manufacturing protocol initiation.`;
                newSuggestions.push({ label: "Export Manufacturing Blueprint", action: () => alert("Packaging blueprint for export...") });
            }
        } else if (simulationResult && !simulationResult.isLoading) {
            report = simulationResult.summary || "Analysis complete. Reviewing the telemetry, the results are within nominal operating parameters for the selected components.";
        }

        if (report) {
            setConsultantAnalysis(report);
            tts.speak(report, 'Zephyr');
        }
        setSuggestions(newSuggestions);
    };

    useEffect(() => {
        if ((physicsResult || (simulationResult && !simulationResult.isLoading)) && !isPhysicsActive && !simulationResult?.isLoading) {
            analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
            generateConsultantReport();
        }
    }, [physicsResult, simulationResult?.isLoading, isPhysicsActive]);

    const handleRunRealWorldTest = () => {
        if (!cadData) {
            alert("Synthesize CAD mesh before running Genesis 4D Audit.");
            return;
        }
        setConsultantAnalysis(null);
        setSuggestions([]);
        runGenesisVerification(cadData, 'SAA_LEO_ORBIT');
    };

    const handleToggleComponent = (name: string) => {
        setSelectedComponents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(name)) newSet.delete(name);
            else newSet.add(name);
            return newSet;
        });
    };

    const triggerRun = async () => {
        const componentNames = Array.from(selectedComponents);
        if (componentNames.length === 0) return;
        
        setConsultantAnalysis(null);
        setSuggestions([]);

        const updateInterval = setInterval(() => {
            const messages = {
                'FEA': ['Generating mesh...', 'Solving stress tensors...', 'Synthesizing report...'],
                'CFD': ['Building fluid volume...', 'Solving Navier-Stokes...', 'Visualizing flow...'],
                'THERMAL': ['Applying thermal loads...', 'Calculating heat transfer...', 'Mapping hotspots...'],
                'MODAL': ['Extracting eigenvalues...', 'Calculating natural frequencies...', 'Identifying resonance...'],
                'FATIGUE': ['Analyzing cyclic loading...', 'Predicting crack initiation...', 'Estimating lifecycle...'],
                'IMPACT': ['Simulating kinetic collision...', 'Calculating deformation...', 'Checking integrity...'],
                'EM_FIELD': ['Mapping magnetic flux...', 'Checking EMI interference...', 'Verifying shielding...'],
                'OPTIMIZATION': ['Running topology solver...', 'Reducing mass...', 'Maximizing stiffness...'],
                'PHYSICS_VALIDATION': ['Handshaking Genesis...', '4D Solve in progress...', 'Consultant analyzing...']
            };
            const currentMsgs = messages[selectedType] || ['Processing...'];
            setStatus(prev => prev.length < currentMsgs.length ? [...prev, currentMsgs[prev.length]] : prev);
        }, 1500);

        await runSimulation(selectedType, componentNames, productContext);
        clearInterval(updateInterval);
        setStatus([]);
    };

    return (
        <div className="mb-6 animate-fade-in text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div>
                    <h3 className="text-2xl font-black text-brand-cyan flex items-center gap-2 uppercase tracking-tighter italic">
                        <Wrench className="w-6 h-6" />
                        Simulation Studio
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Multi-physics validation & environmental testing.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleStartDeVinciSession}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${devinci.state !== 'idle' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
                    >
                        <Mic className={`w-4 h-4 ${devinci.state !== 'idle' ? 'animate-pulse' : ''}`} /> 
                        {devinci.state !== 'idle' ? 'Consultant Linked' : 'Voice Consultant'}
                    </button>
                    {cadData && !isViewer && (
                        <button 
                            onClick={handleRunRealWorldTest}
                            disabled={isPhysicsActive}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-cyan hover:text-white transition-all shadow-lg animate-pulse"
                        >
                            <Layers className="w-4 h-4" /> Run Genesis 4D Audit
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3">
                     <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 h-full shadow-sm">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Target Assembly
                        </h4>
                        <div className="max-h-[500px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            {bom.map(item => (
                                <label key={item.part_number} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedComponents.has(item.name) ? 'bg-cyan-50 dark:bg-cyan-900/20 border-brand-cyan shadow-sm' : 'bg-gray-50 dark:bg-slate-800 border-transparent hover:border-gray-300 dark:hover:border-slate-600'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedComponents.has(item.name)}
                                        onChange={() => handleToggleComponent(item.name)}
                                        className="rounded border-gray-300 dark:border-slate-600 text-cyan-500 focus:ring-brand-cyan dark:bg-slate-700"
                                    />
                                    <span className="text-xs text-gray-700 dark:text-slate-200 font-bold truncate">{item.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6">Simulation Core Control</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <SimulationTypeButton type="FEA" currentType={selectedType} setType={setSelectedType} icon={Activity} label="FEA" desc="Structural Stress" />
                            <SimulationTypeButton type="CFD" currentType={selectedType} setType={setSelectedType} icon={Wind} label="CFD" desc="Fluid Dynamics" />
                            <SimulationTypeButton type="THERMAL" currentType={selectedType} setType={setSelectedType} icon={Thermometer} label="Thermal" desc="Heat Transfer" />
                            <SimulationTypeButton type="MODAL" currentType={selectedType} setType={setSelectedType} icon={Radio} label="Modal" desc="Vibration & Freq" />
                            <SimulationTypeButton type="FATIGUE" currentType={selectedType} setType={setSelectedType} icon={AlertTriangle} label="Fatigue" desc="Lifecycle Audit" />
                            <SimulationTypeButton type="IMPACT" currentType={selectedType} setType={setSelectedType} icon={Layers} label="Impact" desc="Crash/Drop Test" />
                            <SimulationTypeButton type="EM_FIELD" currentType={selectedType} setType={setSelectedType} icon={Zap} label="EM Field" desc="Electromagnetic" />
                            <SimulationTypeButton type="OPTIMIZATION" currentType={selectedType} setType={setSelectedType} icon={CheckCircle} label="Topology" desc="Mass Reduction" />
                        </div>
                        
                        <div className="mt-8 flex justify-end">
                             <button
                                onClick={triggerRun}
                                disabled={selectedComponents.size === 0 || simulationResult?.isLoading || isPhysicsActive}
                                className="px-10 py-4 bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-purple-900/40 hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 relative overflow-hidden"
                            >
                                {simulationResult?.isLoading || isPhysicsActive ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="relative z-10 animate-breathe">Synthesizing Protocol...</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer -translate-x-full"></div>
                                    </>
                                ) : (
                                    <><Play className="w-5 h-5 fill-current" /> Initialize Analysis</>
                                )}
                            </button>
                        </div>
                    </div>

                    <div ref={analysisRef} className="space-y-6">
                         {(simulationResult?.isLoading || isPhysicsActive) && (
                            <div className="bg-gray-100 dark:bg-black/40 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 font-mono text-xs space-y-2 relative overflow-hidden">
                                {status.map((msg, i) => (
                                    <div key={i} className="text-cyan-600 dark:text-cyan-400 animate-fade-in flex items-center gap-2">
                                        <span className="opacity-50">>></span> {msg}
                                    </div>
                                ))}
                                <div className="animate-pulse text-cyan-800 dark:text-cyan-200">_</div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-cyan/5 to-transparent h-20 w-full -translate-y-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
                            </div>
                        )}

                        {(simulationResult || physicsResult) && !simulationResult?.isLoading && !isPhysicsActive && (
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-brand-cyan/30 shadow-2xl animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-cyan"></div>
                                
                                <div className="flex justify-between items-start mb-6">
                                    <h4 className="text-xl font-black text-brand-cyan flex items-center gap-3 uppercase tracking-tighter italic">
                                        <MessageSquare className="w-6 h-6" />
                                        Consultant Insights
                                    </h4>
                                    <div className="flex gap-3">
                                        {onSaveSimulation && (
                                            <button 
                                                onClick={() => {
                                                    const res = simulationResult || {
                                                        type: 'PHYSICS_VALIDATION',
                                                        componentName: 'Assembly Centroid',
                                                        summary: 'Genesis Physics Audit Result',
                                                        keyFindings: [],
                                                        imagePrompt: '',
                                                        imageUrl: null,
                                                        isLoading: false,
                                                        error: null,
                                                        physicsTelemetry: physicsResult
                                                    };
                                                    onSaveSimulation(res);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/30"
                                            >
                                                <Save className="w-4 h-4" /> Commit to Vault
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => tts.isPlaying ? tts.stop() : tts.speak(consultantAnalysis || '')}
                                            className={`p-2 rounded-full transition-all ${tts.isPlaying ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 animate-pulse' : 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400'}`}
                                        >
                                            {tts.isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                
                                <p className="text-gray-700 dark:text-slate-200 leading-relaxed text-lg mb-6 italic">"{consultantAnalysis}"</p>
                                
                                {physicsResult?.video_url && (
                                    <div className="mb-8 rounded-2xl overflow-hidden border-2 border-brand-cyan shadow-[0_0_30px_rgba(6,182,212,0.3)] relative group">
                                        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse z-10 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                            Live Genesis Feed
                                        </div>
                                        
                                        <video 
                                            src={physicsResult.video_url} 
                                            controls 
                                            autoPlay 
                                            loop 
                                            muted
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                )}

                                {simulationResult?.imageUrl && !physicsResult?.video_url && (
                                    <div className="mb-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xl group relative">
                                        <img src={simulationResult.imageUrl} alt="Simulation Visualization" className="w-full h-64 object-cover transform transition-transform duration-700 group-hover:scale-110" />
                                    </div>
                                )}

                                {physicsResult && (
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                         <div className="bg-gray-50 dark:bg-black/40 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-inner">
                                            <span className="text-gray-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Stability Status</span>
                                            <div className={`font-black text-xl italic uppercase tracking-tighter ${physicsResult.status === 'STABLE' ? 'text-green-500' : 'text-red-500'}`}>{physicsResult.status.replace('_', ' ')}</div>
                                         </div>
                                         <div className="bg-gray-50 dark:bg-black/40 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-inner">
                                            <span className="text-gray-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Peak Load</span>
                                            <div className="font-black text-xl text-gray-900 dark:text-white">{physicsResult.telemetry?.max_stress?.toFixed(2) || physicsResult.telemetry?.max_stress_gpa?.toFixed(2)} <span className="text-xs text-gray-400 font-sans">GPa</span></div>
                                         </div>
                                    </div>
                                )}

                                {suggestions.length > 0 && (
                                    <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-800">
                                        <h5 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Autonomous Correction Proposals</h5>
                                        <div className="flex flex-wrap gap-3">
                                            {suggestions.map((sugg, idx) => (
                                                <button 
                                                    key={idx} 
                                                    onClick={sugg.action}
                                                    className="flex items-center gap-3 px-5 py-2.5 bg-brand-cyan/10 border border-brand-cyan/30 hover:bg-brand-cyan hover:text-white text-brand-cyan rounded-xl transition-all text-xs font-black uppercase tracking-widest group"
                                                >
                                                    <Wrench className="w-4 h-4" />
                                                    {sugg.label}
                                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>
        </div>
    );
};