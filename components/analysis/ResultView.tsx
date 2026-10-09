import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AnalysisResult, Faction, MaterialSuggestion, BillOfMaterials, TestPlan, ComplianceAndSafety, Project, User, GeneratedDrawing, CadData, ProjectVersion, EngineeringChangeOrder, PreliminaryCostEstimate, GeneratedImage, RotorModel, RotorShaftElement, RotorDiskElement, RotorBearingElement, RotorMaterial, GoogleDocContent, EngineeringBranch, FoundryCadResult, IoStatus, ProcessFmeaEntry, SimulationResult, ProjectTask, Role, ComputeEvent } from '../../types';
import { exportFullReportPDF } from '../../services/pdfService';
import { Modal } from '../Modal';
import { useTts } from '../../hooks/useTts';
import { useSimulation } from '../../hooks/useSimulation';
import { AdvancedSimulation } from './AdvancedSimulation';
import { useCollaboration } from '../../hooks/useCollaboration';
import { CommentSidebar } from './CommentSidebar';
import { useCommentCounts } from '../../hooks/useCommentCounts';
import { useFabricationPlanner } from '../../hooks/useFabricationPlanner';
import { FabricationPlanner } from './FabricationPlanner';
import { useGCodeVisualizer } from '../../hooks/useGCodeVisualizer';
import { useSuggestionExplorer } from '../../hooks/useSuggestionExplorer';
import { useBomSourcing } from '../../hooks/useBomSourcing';
import { useLiveCosting } from '../../hooks/useLiveCosting';
import { LiveCostingDashboard } from './LiveCostingDashboard';
import { useNextStepAssistant } from '../../hooks/useNextStepAssistant';
import { NextStepAssistant } from './NextStepAssistant';
import { Section } from './Section';
import { ProjectDashboard } from './ProjectDashboard';
import { PatentModule } from './PatentModule';
import { usePatentGenerator } from '../../hooks/usePatentGenerator';
import { CadViewerModal } from '../cad/CadViewerModal';
import { MATERIAL_LIBRARY } from '../../constants/materialLibrary';
import { PhysicsViewport } from './PhysicsViewport';
import { TaskBoard } from './TaskBoard';
import { Flame, Box, BarChart2, Cpu, Sparkles, Zap } from 'lucide-react';
import { PyTorchStudio } from '../ml/PyTorchStudio';
import { TensorFlowStudio } from '../ml/TensorFlowStudio';
import { TensorBoardDashboard } from '../ml/TensorBoardDashboard';

const ReadAloudButton = ({ text, tts, voice }: { text: string, tts: any, voice: string }) => (
    <button onClick={() => tts.speak(text, voice)} className="p-2 text-gray-400 hover:text-brand-cyan transition" title="Read Aloud">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${tts.isPlaying ? 'text-brand-cyan' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>
    </button>
);

const CommentButton = ({ sectionId, sectionTitle, onToggle, count, isOpen }: any) => (
    <button onClick={() => onToggle(sectionId, sectionTitle)} className={`flex items-center gap-1.5 p-2 rounded-md transition-colors ${isOpen ? 'bg-brand-cyan/20 text-brand-cyan' : 'text-gray-400 hover:text-gray-600'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.023c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.023c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03 8.25-9 8.25s9 3.694 9 8.25Z" /></svg>
        {count > 0 && <span className="text-xs font-bold">{count}</span>}
    </button>
);

const ExportDropdown = ({ onExportPDF }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="py-2 px-4 bg-white dark:bg-slate-700 text-gray-800 dark:text-white font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 transition text-sm flex items-center gap-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Export Report
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-30 p-2">
                    <button onClick={() => { onExportPDF(); setIsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-sm text-gray-700 dark:text-gray-200">Export as PDF</button>
                </div>
            )}
        </div>
    );
};

export interface ResultViewProps {
  projectName: string;
  result: AnalysisResult;
  selectedFaction: Faction | null;
  onClear: () => void;
  isLoading: boolean;
  onGenerateVideo: (prompt: string, imageFile?: File, aspectRatio?: '16:9' | '9:16') => void;
  isVideoLoading: boolean;
  videoUrl: string | null;
  videoError: string | null;
  drawings: GeneratedDrawing[];
  onRequestDrawing: (prompt: string, result: AnalysisResult, fileUrls?: string[]) => void;
  onRequestDrawingFromImage: (imageFile: File, prompt: string) => void;
  onRemoveDrawing: (id: string) => void;
  onToggleDrawingReportInclusion: (id: string) => void;
  onSetCover: (id: string, type: 'drawing' | 'image') => void;
  inspirationalImages: GeneratedImage[];
  onRemoveInspirationalImage: (id: string) => void;
  onRequestInspirationalImage: (prompt: string, aspectRatio: string) => void;
  onToggleImageReportInclusion: (id: string) => void;
  onIncorporateSuggestions: (suggestionTexts: string[]) => void;
  onLaunchDeVinci: () => void;
  activeProject: Project | null;
  activeVersion: ProjectVersion | null;
  authenticatedUser: User;
  onGenerateSummary: (result: AnalysisResult) => Promise<string | null>;
  isSummaryLoading: boolean;
  summaryError: string | null;
  cadData: CadData | null;
  foundryResult: FoundryCadResult | null;
  onGenerateCad: (drawings: GeneratedDrawing[], result: AnalysisResult) => Promise<CadData | null>;
  isCadLoading: boolean;
  cadError: string | null;
  isCadViewerOpen: boolean;
  onOpenCadViewer: () => void;
  onAddLocalSnapshot?: (dataUrl: string, prompt: string) => void;
  // --- Google Exporter Related Props ---
  isGoogleExporterAuthenticated: boolean;
  googleExporterUser: { name: string; email: string } | null;
  isGoogleAuthLoading: boolean;
  onGoogleExporterSignIn: () => void;
  onGoogleExporterSignOut: () => void;
  isGoogleExporting: boolean;
  googleExportStatus: string;
  googleExportError: string | null;
  googleDocContent: GoogleDocContent | null;
  onOpenGoogleDocPreview: () => void;
  onExportToGoogle: () => void;
  // -------------------------------------
  rotorModel?: RotorModel;
  onRotorModelChange: (model: RotorModel) => void;
  rossAnalysis: {
    isRossReady: boolean;
    isRossRunning: boolean;
    rossStatus: string;
    rossResult: any;
    rossError: string | null;
    runAnalysis: (rotorModel: RotorModel, analysisType: 'critical_speed' | 'campbell') => void;
  };
  tts: ReturnType<typeof useTts>;
  inspirationalImageHistory: GeneratedImage[];
  onReinsertInspirationalImage: (image: GeneratedImage) => void;
  onDeleteInspirationalImageFromHistory: (imageId: string) => void;
  simulation: ReturnType<typeof useSimulation>;
  fabricationPlanner: ReturnType<typeof useFabricationPlanner>;
  gcodeVisualizer: ReturnType<typeof useGCodeVisualizer>;
  suggestionExplorer: ReturnType<typeof useSuggestionExplorer>;
  bomSourcing: ReturnType<typeof useBomSourcing>;
  liveCosting: ReturnType<typeof useLiveCosting>;
  nextStepAssistant: ReturnType<typeof useNextStepAssistant>;
  patentGenerator: ReturnType<typeof usePatentGenerator>;
  onSaveSimulation?: (result: SimulationResult) => void;
  onUpdateTasks?: (tasks: ProjectTask[]) => void;
  computeEvents?: ComputeEvent[];
  onRevertVersion?: (versionIndex: number) => void;
  onAddComputeEvent?: (event: ComputeEvent) => void;
}

export const ResultView: React.FC<ResultViewProps> = (props) => {
    const { projectName, result, tts, authenticatedUser, cadData, simulation } = props;
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [activeSectionTitle, setActiveSectionTitle] = useState('');
    const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
    const [conceptPrompt, setConceptPrompt] = useState('');
    const [activeNeuralTab, setActiveNeuralTab] = useState<'pytorch' | 'tensorflow' | 'tensorboard' | 'none'>('none');
    const commentCounts = useCommentCounts();
    const { comments, addComment } = useCollaboration(activeSection, authenticatedUser);

    const toggleComments = (sectionId: string, sectionTitle: string) => {
        if (activeSection === sectionId) {
            setActiveSection(null);
        } else {
            setActiveSection(sectionId);
            setActiveSectionTitle(sectionTitle);
        }
    };

    const handleExportPDF = () => {
        if (props.activeProject) {
            exportFullReportPDF(props.activeProject, props.drawings, props.inspirationalImages);
        }
    };

    const handleInspirationalImageRequest = () => {
        const finalPrompt = conceptPrompt.trim() || `Technical render of ${result.product_name}`;
        props.onRequestInspirationalImage(finalPrompt, selectedAspectRatio);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <header className="flex justify-between items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button onClick={props.onClear} className="p-2 text-gray-500 hover:text-brand-cyan transition-colors" title="Back to Inputs">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-tight">{projectName}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <ExportDropdown onExportPDF={handleExportPDF} />
                </div>
            </header>

            <ProjectDashboard 
                result={result} 
                project={props.activeProject}
                activeVersion={props.activeVersion}
                computeEvents={props.computeEvents}
                onRevertVersion={props.onRevertVersion}
                onAddComputeEvent={props.onAddComputeEvent}
                cadData={cadData}
                simulationResult={simulation.simulationResult}
            />

            <Section id="executive_summary" title="Executive Summary" actions={<><ReadAloudButton text={result.executive_summary} tts={tts} voice="Zephyr" /><CommentButton sectionId="executive_summary" sectionTitle="Executive Summary" count={commentCounts['executive_summary'] || 0} onToggle={toggleComments} isOpen={activeSection === 'executive_summary'} /></>}>
                <p className="whitespace-pre-wrap">{result.executive_summary}</p>
            </Section>

            <Section id="physics_visualization" title="3D CAD Synthesis" actions={cadData ? <button onClick={props.onOpenCadViewer} className="text-xs font-bold text-brand-cyan hover:underline">Launch Advanced Viewer</button> : null}>
                {!cadData ? (
                    <div className="bg-gray-50 dark:bg-slate-800 p-10 rounded-xl border border-gray-200 dark:border-gray-700 text-center space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Synthesize a 3D model based on technical deconstruction.</p>
                        <button 
                            onClick={() => props.onGenerateCad(props.drawings, result)}
                            disabled={props.isCadLoading}
                            className="px-6 py-2 bg-brand-cyan text-white font-bold rounded-lg hover:bg-cyan-600 transition-all disabled:opacity-50"
                        >
                            {props.isCadLoading ? 'Generating CAD...' : 'Generate 3D Model'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <PhysicsViewport 
                            cadData={cadData} 
                            physicsResult={simulation.physicsResult} 
                            isPhysicsActive={simulation.isPhysicsActive} 
                            activeJobId={simulation.activeJobId}
                            liveStepLogs={simulation.liveStepLogs}
                            onTriggerSimulation={() => simulation.runGenesisVerification(cadData)}
                            onAddSnapshot={props.onAddLocalSnapshot} 
                        />
                    </div>
                )}
            </Section>

            {/* Neural Forge: PyTorch & TensorFlow / TensorBoard */}
            <Section id="neural_forge" title="Neural Forge: PyTorch & TensorFlow Deep Learning Engine">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-wider font-mono text-white flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                                Neural Physics Surrogate & Tensor Operations
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Accelerate physical validation and structural analysis with PyTorch autograd pipelines and TensorFlow TensorBoard telemetry.
                            </p>
                        </div>

                        {/* Interactive Tab Selector */}
                        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => setActiveNeuralTab(activeNeuralTab === 'pytorch' ? 'none' : 'pytorch')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                                    activeNeuralTab === 'pytorch'
                                        ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                <Flame className="w-3.5 h-3.5" />
                                <span>PyTorch Studio</span>
                            </button>

                            <button
                                onClick={() => setActiveNeuralTab(activeNeuralTab === 'tensorflow' ? 'none' : 'tensorflow')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                                    activeNeuralTab === 'tensorflow'
                                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                <Box className="w-3.5 h-3.5" />
                                <span>TensorFlow Studio</span>
                            </button>

                            <button
                                onClick={() => setActiveNeuralTab(activeNeuralTab === 'tensorboard' ? 'none' : 'tensorboard')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                                    activeNeuralTab === 'tensorboard'
                                        ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                <BarChart2 className="w-3.5 h-3.5" />
                                <span>TensorBoard</span>
                            </button>
                        </div>
                    </div>

                    {/* Preview Cards when none selected */}
                    {activeNeuralTab === 'none' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div 
                                onClick={() => setActiveNeuralTab('pytorch')}
                                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                                        PyTorch 2.4+
                                    </span>
                                </div>
                                <h5 className="text-xs font-bold font-mono text-slate-200 group-hover:text-rose-400 transition">
                                    PyTorch Neural Architect
                                </h5>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Synthesize deep neural networks, inspect autograd backpropagation, and export TorchScript/ONNX artifacts.
                                </p>
                            </div>

                            <div 
                                onClick={() => setActiveNeuralTab('tensorflow')}
                                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                        <Box className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                                        TF 2.16 / Keras 3
                                    </span>
                                </div>
                                <h5 className="text-xs font-bold font-mono text-slate-200 group-hover:text-amber-400 transition">
                                    TensorFlow & Keras Studio
                                </h5>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Assemble Sequential/Functional architectures, configure callbacks, and convert to TFLite for edge robotics.
                                </p>
                            </div>

                            <div 
                                onClick={() => setActiveNeuralTab('tensorboard')}
                                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/50 cursor-pointer transition group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                                        <BarChart2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-mono text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-800/40">
                                        Live Telemetry
                                    </span>
                                </div>
                                <h5 className="text-xs font-bold font-mono text-slate-200 group-hover:text-orange-400 transition">
                                    TensorBoard Dashboard
                                </h5>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Multi-run scalar tracking, computation graph DAG, weight histograms, HParams tuning, and profiler traces.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Active Expanded Module */}
                    {activeNeuralTab === 'pytorch' && (
                        <div className="animate-fade-in">
                            <PyTorchStudio
                                onTriggerComputeEvent={(type, details, cost) => {
                                    if (props.onAddComputeEvent) {
                                        props.onAddComputeEvent({
                                            id: `ev-pt-${Date.now()}`,
                                            timestamp: new Date().toISOString(),
                                            type,
                                            user: authenticatedUser?.name || 'PyTorch Node',
                                            cost,
                                            status: 'SUCCESS',
                                            projectName,
                                            details
                                        });
                                    }
                                }}
                            />
                        </div>
                    )}

                    {activeNeuralTab === 'tensorflow' && (
                        <div className="animate-fade-in">
                            <TensorFlowStudio
                                onTriggerComputeEvent={(type, details, cost) => {
                                    if (props.onAddComputeEvent) {
                                        props.onAddComputeEvent({
                                            id: `ev-tf-${Date.now()}`,
                                            timestamp: new Date().toISOString(),
                                            type,
                                            user: authenticatedUser?.name || 'TensorFlow Node',
                                            cost,
                                            status: 'SUCCESS',
                                            projectName,
                                            details
                                        });
                                    }
                                }}
                            />
                        </div>
                    )}

                    {activeNeuralTab === 'tensorboard' && (
                        <div className="animate-fade-in">
                            <TensorBoardDashboard
                                onTriggerComputeEvent={(type, details, cost) => {
                                    if (props.onAddComputeEvent) {
                                        props.onAddComputeEvent({
                                            id: `ev-tb-${Date.now()}`,
                                            timestamp: new Date().toISOString(),
                                            type,
                                            user: authenticatedUser?.name || 'TensorBoard Node',
                                            cost,
                                            status: 'SUCCESS',
                                            projectName,
                                            details
                                        });
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </Section>

            <Section id="ai_suggestions" title="Material & System Proposals" actions={<CommentButton sectionId="ai_suggestions" sectionTitle="Suggestions" count={commentCounts['ai_suggestions'] || 0} onToggle={toggleComments} isOpen={activeSection === 'ai_suggestions'} />}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.material_suggestions.map((mat, i) => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg group">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">{mat.name}</h4>
                                <button 
                                    onClick={() => props.suggestionExplorer.explore(mat.name, result.executive_summary)}
                                    className="text-xs text-brand-cyan hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Explore
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{mat.rationale}</p>
                            <div className="grid grid-cols-2 gap-x-4 text-[10px] uppercase font-bold text-gray-400">
                                <div>Strength: <span className="text-gray-700 dark:text-gray-200">{mat.properties.tensile_strength}</span></div>
                                <div>Density: <span className="text-gray-700 dark:text-gray-200">{mat.properties.density}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section id="bom" title="Bill of Materials" actions={<CommentButton sectionId="bom" sectionTitle="BOM" count={commentCounts['bom'] || 0} onToggle={toggleComments} isOpen={activeSection === 'bom'} />}>
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 uppercase text-[10px] font-bold">
                            <tr>
                                <th className="px-4 py-3">Part #</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Qty</th>
                                <th className="px-4 py-3">Material</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
                            {result.billOfMaterials.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-mono">{item.part_number}</td>
                                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                                    <td className="px-4 py-3">{item.quantity}</td>
                                    <td className="px-4 py-3">{item.material}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => props.bomSourcing.sourceItem(item)}
                                            className="text-xs font-bold text-brand-cyan hover:underline"
                                        >
                                            Source
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section id="patent_application" title="IP & Patent Drafting">
                 <PatentModule 
                    result={result} 
                    patentGenerator={props.patentGenerator} 
                    // Fix: Use Role.Viewer from enum instead of string literal to resolve "unintentional comparison" type error.
                    isViewer={props.authenticatedUser.role === Role.Viewer} 
                    authenticatedUser={props.authenticatedUser} 
                    onUpdateUser={() => {}} 
                    project={props.activeProject} 
                    foundryState={props.foundryResult ? {
                        selectedMaterial: MATERIAL_LIBRARY.find(m => m.name === props.foundryResult?.metadata.material) || MATERIAL_LIBRARY[0],
                        parameters: props.foundryResult.scad_params.parameters,
                        scadString: props.foundryResult.scad_params.raw_scad,
                        safetyFactor: 3.2,
                        isLocked: true,
                        jurisdiction: 'USPTO',
                        designHash: 'COMMITTED_HASH_SAMPLE'
                    } : undefined}
                />
            </Section>

            <CommentSidebar 
                isOpen={activeSection !== null} 
                sectionId={activeSection || ''} 
                sectionTitle={activeSectionTitle} 
                onClose={() => setActiveSection(null)} 
                authenticatedUser={authenticatedUser} 
                comments={comments} 
                onAddComment={addComment} 
            />

            {props.isCadViewerOpen && props.cadData && (
                // Fix: Use Role.Viewer from enum instead of string literal to resolve "unintentional comparison" type error.
                <CadViewerModal isOpen={props.isCadViewerOpen} onClose={props.onOpenCadViewer} cadData={props.cadData} isViewer={props.authenticatedUser.role === Role.Viewer} />
            )}
        </div>
    );
};
