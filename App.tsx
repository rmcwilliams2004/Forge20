
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Faction, ProjectVersion, Project, AnalysisResult, User, LogEntry, Role, GeneratedDrawing, FactionId, Persona, PersonaId, GeneratedImage, EditorState, RotorModel, CadData, InProgressState, IngestedDocument, ProjectIndexEntry, SubscriptionStatus, EngineeringBranch, DomainCategory, SystemState, FoundryCadResult, NalPrecision, SimulationResult, ReinforcementProfile, Innovator, ProjectTask, ComputeEvent, IpAuditEntry } from './types';
import { ENGINEERING_PHILOSOPHIES, MOCK_USERS, HISTORICAL_PERSONAS } from './constants';
import { useAnalysis } from './hooks/useAnalysis';
import { useVideoGenerator } from './hooks/useVideoGenerator';
import { Header } from './components/Header';
import { FactionSelector } from './components/FactionSelector';
import { PersonaSelector } from './components/PersonaSelector';
import { PromptInput } from './components/PromptInput';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ProjectManager } from './components/ProjectManager';
import { useProjects } from './hooks/useProjects';
import { DeVinciModal } from './components/DeVinciModal';
import { useDrawingGenerator } from './hooks/useDrawingGenerator';
import { useCadGenerator } from './hooks/useCadGenerator';
import { useDeVinci } from './hooks/useDeVinci';
import { 
    extractProjectDetailsFromVideoUrl,
    parseApiError,
    runGenesisVerificationFunctionDeclaration,
    runFoundrySimulationFunctionDeclaration,
    triggerFullAnalysisFunctionDeclaration
} from './services/geminiService';
import { useInspirationalImageGenerator } from './hooks/useInspirationalImageGenerator';
import { useSetupAssistant } from './hooks/useSetupAssistant';
import { useTts } from './hooks/useTts';
import { useSimulation } from './hooks/useSimulation';
import { useFabricationPlanner } from './hooks/useFabricationPlanner';
import { useGCodeVisualizer } from './hooks/useGCodeVisualizer';
import { useSuggestionExplorer } from './hooks/useSuggestionExplorer';
import { useBomSourcing } from './hooks/useBomSourcing';
import { usePromptValidator } from './hooks/usePromptValidator';
import { useLiveCosting } from './hooks/useLiveCosting';
import { useNextStepAssistant } from './hooks/useNextStepAssistant';
import { useAiChat } from './hooks/useAiChat';
import { ToolSuite } from './components/suite/ToolSuite';
import { VideoImportModal } from './components/VideoImportModal';
import { usePatentGenerator } from './hooks/usePatentGenerator';
import { PricingPage } from './components/PricingPage';
import { AccountPage } from './components/AccountPage';
import { Footer } from './components/Footer';
import { useUndoRedo } from './hooks/useUndoRedo';
import { AuthPage } from './components/AuthPage';
import { ProjectInitiationModal } from './components/dashboard/ProjectInitiationModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TechnicalDocumentModal } from './components/TechnicalDocumentModal';
import { useAnalysisPersistence } from './hooks/useAnalysisPersistence';
import { SystemToast } from './components/SystemToast';
import { dispatchMilestoneAlert } from './services/notificationService';
import { NeuralWorkbench } from './components/ml/NeuralWorkbench';

const useRossAnalysis = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const workerRef = useRef<Worker | null>(null);
    const [isRossReady, setIsRossReady] = useState(false);
    const [isRossRunning, setIsRossRunning] = useState(false);
    const [rossStatus, setRossStatus] = useState('Not initialized');
    const [rossResult, setRossResult] = useState<any>(null);
    const [rossResultError, setRossError] = useState<string | null>(null);

    const workerCode = `
      let pyodide = null;
      let rossInstalled = false;

      self.onmessage = async (event) => {
        const { type, payload } = event.data;

        if (type === 'INIT') {
          try {
            if (!pyodide) {
              self.postMessage({ type: 'STATUS', message: 'Loading Pyodide environment...' });
              importScripts("https://cdn.plot.ly/plotly-latest.min.js");
              importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js");
              pyodide = await loadPyodide();
              self.postMessage({ type: 'STATUS', message: 'Pyodide loaded. Loading micropip...' });
              await pyodide.loadPackage("micropip");
              const micropip = pyodide.micropip;
              self.postMessage({ type: 'STATUS', message: 'Installing ross library...' });
              await micropip.install('ross-rotordynamics');
              rossInstalled = true;
              self.postMessage({ type: 'READY' });
            } else {
              self.postMessage({ type: 'READY' });
            }
          } catch (error) {
            self.postMessage({ type: 'ERROR', message: error.message });
          }
        } else if (type === 'RUN_ANALYSIS') {
          if (!pyodide || !rossInstalled) {
            self.postMessage({ type: 'ERROR', message: 'Environment not ready.' });
            return;
          }

          self.postMessage({ type: 'STATUS', message: 'Running analysis: ' + payload.analysisType });

          try {
            pyodide.globals.set("rotor_model_json", JSON.stringify(payload.rotorModel));
            pyodide.globals.set("analysis_type", payload.analysisType);

            const pythonCode = \`
import json
import js
import ross as rs
import numpy as np
import plotly.graph_objects as go

rs.config_plot(backend="plotly")

rotor_model = json.loads(rotor_model_json)
analysis = analysis_type

shaft_elements = [
    rs.ShaftElement(
        L=elem['L'],
        idl=elem['idl'],
        odl=elem['odl'],
        material=rs.Material(name=elem['material']['name'], E=elem['material']['E'], G_s=elem['material']['G_s'], rho=elem['material']['rho']),
        n=elem['n']
    ) for elem in rotor_model.get('shaft', [])
]

disk_elements = [
    rs.DiskElement(
        n=elem['n'],
        m=elem['m'],
        Id=elem['Id'],
        Ip=elem['Ip']
    ) for elem in rotor_model.get('disks', [])
]

bearing_elements = [
    rs.BearingElement(
        n=elem['n'],
        kxx=elem.get('kxx', 0), kxy=elem.get('kxy', 0),
        kyx=elem.get('kyy', 0), kyy=elem.get('kyy', 0),
        cxx=elem.get('cxx', 0), cxy=elem.get('cxy', 0),
        cyx=elem.get('cyx', 0), cyy=elem.get('cyy', 0)
    ) for elem in rotor_model.get('bearings', [])
]

# Ensure at least one shaft element exists to create a rotor
if not shaft_elements:
    raise ValueError("Rotor model must have at least one shaft element.")

rotor = rs.Rotor(shaft_elements, disk_elements, bearing_elements)

results = {}

if analysis == 'critical_speed':
    solution = rotor.run_critical_speed()
    results = {
        "type": "critical_speed",
        "critical_speeds": solution.wd.tolist(),
        "log_dec": solution.log_dec.tolist(),
        "whirl_direction": solution.whirl_direction.tolist()
    }
elif analysis == 'campbell':
    speed_range = np.linspace(0, 1000, 101)
    fig = rotor.campbell(speed_range, frequencies=6)
    results = {
        "type": "campbell",
        "plot_json": fig.to_json()
    }

json.dumps(results)
            \`;
            
            const resultsJson = await pyodide.runPythonAsync(pythonCode);
            self.postMessage({ type: 'RESULT', payload: JSON.parse(resultsJson) });

          } catch (error) {
            self.postMessage({ type: 'ERROR', message: error.message });
          }
        }
      };
    `;

    useEffect(() => {
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        workerRef.current = worker;

        worker.onmessage = (event) => {
            const { type, payload, message } = event.data;
            switch (type) {
                case 'STATUS':
                    setRossStatus(message);
                    break;
                case 'READY':
                    setIsRossReady(true);
                    setRossStatus('Ready for analysis');
                    addLog('INFO', 'Rotordynamics environment (ross) is ready.');
                    break;
                case 'RESULT':
                    setRossResult(payload);
                    setIsRossRunning(false);
                    setRossStatus('Analysis complete');
                    addLog('INFO', 'Rotordynamics analysis completed successfully.');
                    break;
                case 'ERROR':
                    setRossError(message);
                    setIsRossRunning(false);
                    setRossStatus('Error occurred');
                    addLog('ERROR', 'Rotordynamics analysis failed: ' + message);
                    break;
            }
        };

        worker.postMessage({ type: 'INIT' });

        return () => {
            worker.terminate();
        };
    }, [addLog]);

    const runAnalysis = (rotorModel: RotorModel, analysisType: 'critical_speed' | 'campbell') => {
        if (!isRossReady || !workerRef.current) {
            setRossError('Analysis environment is not ready.');
            return;
        }
        setIsRossRunning(true);
        setRossError(null);
        setRossResult(null);
        addLog('INFO', `Starting rotordynamics analysis: ${analysisType}`);
        workerRef.current.postMessage({ type: 'RUN_ANALYSIS', payload: { rotorModel, analysisType } });
    };

    return { isRossReady, isRossRunning, rossStatus, rossResult, rossError: rossResultError, runAnalysis };
};

export function App() {
  const { 
    projects, activeProject, onNewProject, onDeleteProject, onSelectProject,
    saveNewVersion, revertToVersion, addIngestedDocument, removeIngestedDocument, updateVersion, updateProjectTasks, loadProject
  } = useProjects();
  
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [selectedCouncil, setSelectedCouncil] = useState<Innovator[]>([]);

  // Admin and State-controlled lists
  const [usersList, setUsersList] = useState<User[]>(MOCK_USERS.map(u => ({...u, forgeCredits: 500})));
  const [personasList, setPersonasList] = useState<Persona[]>(HISTORICAL_PERSONAS);
  const [computeEvents, setComputeEvents] = useState<ComputeEvent[]>([
      { id: 'ev-1', timestamp: new Date().toISOString(), type: 'FOUNDRY_SYNTHESIS', user: 'Alex', cost: 45.2, status: 'SUCCESS' },
      { id: 'ev-2', timestamp: new Date().toISOString(), type: 'GENESIS_AUDIT', user: 'Blake', cost: 120.0, status: 'SUCCESS' }
  ]);
  const [ipAuditLogs, setIpAuditLogs] = useState<IpAuditEntry[]>([]);

  const {
    state: editorState, setState: setEditorState, undo: undoEditorState, redo: redoEditorState,
    canUndo: canUndoEditorState, canRedo: canRedoEditorState, resetState: resetEditorState,
  } = useUndoRedo<EditorState>({ prompt: '', selectedFaction: null, selectedPersona: null, selectionMode: 'philosophy', tags: [] });
  const { prompt, selectedFaction, selectedPersona, selectionMode, tags } = editorState;
  
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'app' | 'admin' | 'suite' | 'pricing' | 'account' | 'neural'>('app');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [isInitiationModalOpen, setIsInitiationModalOpen] = useState(false);
  const [isVideoImportModalOpen, setIsVideoImportModalOpen] = useState(false);
  const [isDeVinciOpen, setIsDeVinciOpen] = useState(false);
  const [isNeuralIngesting, setIsNeuralIngesting] = useState(false);
  const [isTechDocOpen, setIsTechDocOpen] = useState(false);

  // Persistence Hook
  const { saveInProgressAnalysis, loadInProgressAnalysis, clearInProgressAnalysis } = useAnalysisPersistence();

  const addLog = useCallback((level: LogEntry['level'], message: string, overrideContext?: { user?: string, project?: string }) => {
    const user = overrideContext?.user || authenticatedUser?.name || 'System';
    const project = overrideContext?.project || activeProject?.name || '';
    setLogs(prev => [...prev, { id: Date.now(), timestamp: new Date().toISOString(), level, message, user, context: project }]);
  }, [authenticatedUser, activeProject]);

  // SESSION HYDRATION: Load in-progress work on mount
  useEffect(() => {
    const hydrate = async () => {
        const saved = await loadInProgressAnalysis();
        if (saved) {
            setProjectName(saved.projectName);
            setEditorState({
                prompt: saved.prompt,
                tags: saved.tags,
                selectedFaction: saved.factionId ? (ENGINEERING_PHILOSOPHIES.find(f => f.id === saved.factionId) || null) : null,
                selectedPersona: null,
                selectionMode: 'philosophy'
            });
            // We don't restore the full AnalysisResult to keep the bundle small, 
            // but we've restored the context to let them pick up where they left off.
            addLog('INFO', `Session hydrated for project: ${saved.projectName}`);
        }
    };
    hydrate();
  }, [loadInProgressAnalysis, setEditorState, addLog]);

  // PRE-EMPTIVE AUTO-SAVE: Track editor changes
  useEffect(() => {
      if (projectName && prompt) {
          saveInProgressAnalysis({
              projectName,
              prompt,
              tags,
              factionId: selectedFaction?.id || FactionId.PRAGMATIC_PRODUCTION,
              result: {} as AnalysisResult, // Placeholder for minimal footprint
              drawings: [],
              inspirationalImages: []
          });
      }
  }, [projectName, prompt, tags, selectedFaction, saveInProgressAnalysis]);

  const { result, isLoading, error, generateAnalysis: performAnalysis, clearAnalysis, setResult } = useAnalysis(addLog);
  const { drawings, requestDrawing, removeDrawing, toggleDrawingReportInclusion, addLocalSnapshot } = useDrawingGenerator(addLog);
  const { inspirationalImages, requestInspirationalImage, removeInspirationalImage, toggleImageReportInclusion } = useInspirationalImageGenerator(addLog);
  const { videoUrl, isVideoLoading, generateVideo } = useVideoGenerator(addLog);
  const { cadData, foundryResult, isCadLoading, generateCad } = useCadGenerator(addLog);

  const devinci = useDeVinci();
  const setupAssistant = useSetupAssistant();
  const rossAnalysis = useRossAnalysis(addLog);
  const tts = useTts(addLog);
  const simulation = useSimulation(addLog);
  const fabricationPlanner = useFabricationPlanner(addLog);
  const gcodeVisualizer = useGCodeVisualizer(addLog);
  const suggestionExplorer = useSuggestionExplorer(addLog);
  const bomSourcing = useBomSourcing(addLog);
  const promptValidator = usePromptValidator();
  const liveCosting = useLiveCosting(addLog);
  const nextStepAssistant = useNextStepAssistant(addLog);
  const aiChat = useAiChat(addLog, activeProject?.knowledgeBase || [], activeProject?.id);
  const patentGenerator = usePatentGenerator(addLog);

  const handleGenerateCadWithMilestone = useCallback(async (dwgs: any, res: any) => {
    const data = await generateCad(dwgs, res);
    if (data) {
      const projName = activeProject?.name || projectName;
      setComputeEvents(prev => [{
        id: `ev-cad-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'FOUNDRY_SYNTHESIS',
        user: authenticatedUser?.name || 'Foundry Node',
        cost: 25.0,
        status: 'SUCCESS',
        projectId: activeProject?.id,
        projectName: projName,
        details: `Parametric 3D CAD lattice synthesized with ${data.components.length} physical components.`
      }, ...prev]);

      // Trigger Compute Milestone Log & Toast Alert
      addLog('INFO', `[COMPUTE MILESTONE]: Foundry 3D CAD Lattice synthesized with ${data.components.length} physical components ($25.00) for "${projName}"`, { project: projName });
      dispatchMilestoneAlert({
        type: 'FOUNDRY_SYNTHESIS',
        title: 'Foundry CAD Lattice Synthesized',
        description: `Successfully synthesized parametric 3D geometry with ${data.components.length} physical components.`,
        cost: 25.0,
        projectName: projName,
        user: authenticatedUser?.name || 'Foundry Node',
        status: 'OPTIMIZED'
      });
    }
    return data;
  }, [generateCad, authenticatedUser, activeProject, projectName, addLog]);

  const isViewer = authenticatedUser?.role === Role.Apprentice;
  const isProcessingGlobal = isLoading || isCadLoading || isVideoLoading || isNeuralIngesting;

  const handleEngage = useCallback(async () => {
    if (!prompt.trim() || !projectName.trim()) return;
    const factionContext = selectionMode === 'philosophy' ? selectedFaction : null;
    const personaContext = selectionMode === 'persona' ? selectedPersona : null;

    const newResult = await performAnalysis(projectName, prompt, factionContext as any, { 
        files, persona: personaContext as any, knowledgeBase: activeProject?.knowledgeBase || []
    });

    if (newResult) {
      const projName = activeProject?.name || projectName;
      saveNewVersion({
          prompt: prompt,
          factionId: selectedFaction?.id || FactionId.PRAGMATIC_PRODUCTION,
          result: newResult,
          fileUrls: [], 
          drawings: drawings,
          inspirationalImages: inspirationalImages,
      }, 'Core Synthesis protocol finalized.');
      
      setComputeEvents(prev => [{
          id: `ev-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'MASTERMIND_SESSION',
          user: authenticatedUser?.name || 'System',
          cost: 15.0,
          status: 'SUCCESS',
          projectId: activeProject?.id,
          projectName: projName,
          details: 'Core analytical deconstruction & engineering synthesis protocol finalized.'
      }, ...prev]);

      // Trigger Compute Milestone Log & Toast Alert
      addLog('INFO', `[COMPUTE MILESTONE]: Mastermind Session concluded. Technical archetype & BoM generated for "${projName}"`, { project: projName });
      dispatchMilestoneAlert({
        type: 'MASTERMIND_SESSION',
        title: 'Mastermind Synthesis Concluded',
        description: `Analytical deconstruction and first-principles BoM generated for "${projName}".`,
        cost: 15.0,
        projectName: projName,
        user: authenticatedUser?.name || 'Lead Architect',
        status: 'VERIFIED'
      });
    }
  }, [selectionMode, selectedFaction, selectedPersona, prompt, projectName, performAnalysis, files, activeProject, saveNewVersion, drawings, inspirationalImages, authenticatedUser, addLog]);

  const handleUpdateUser = (updatedUser: User) => {
      setAuthenticatedUser(prev => prev?.id === updatedUser.id ? updatedUser : prev);
      setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      localStorage.setItem(`sf_profile_${updatedUser.id}`, JSON.stringify(updatedUser));
  };

  const handleDeleteUser = (userId: string) => {
      setUsersList(prev => prev.filter(u => u.id !== userId));
      addLog('WARN', `Admin purged user identity: ${userId}`);
  };

  const handleUpdatePersona = (updatedPersona: Persona) => {
      setPersonasList(prev => prev.map(p => p.id === updatedPersona.id ? updatedPersona : p));
      addLog('INFO', `Admin updated calibration for Creative Prime: ${updatedPersona.name}`);
  };

  const handleAddPersona = (newPersona: Persona) => {
      setPersonasList(prev => [newPersona, ...prev]);
      addLog('INFO', `Admin deployed new Creative Prime: ${newPersona.name}`);
  };

  const handleDeletePersona = (personaId: string) => {
      setPersonasList(prev => prev.filter(p => p.id !== personaId));
      addLog('WARN', `Admin decommissioned Creative Prime: ${personaId}`);
  };

  const handleVideoUrlImport = async (url: string) => {
    setIsNeuralIngesting(true);
    addLog('INFO', `Synchronizing video context: ${url}`);
    try {
        const details = await extractProjectDetailsFromVideoUrl(url);
        const id = onNewProject({ name: details.name, description: details.description, tags: details.tags });
        onSelectProject(id);
        setProjectName(details.name);
        setEditorState({ ...editorState, prompt: details.initialPrompt, tags: details.tags });
        setIsVideoImportModalOpen(false);
    } catch (e) {
        addLog('ERROR', `Video intake failed: ${parseApiError(e)}`);
    } finally {
        setIsNeuralIngesting(false);
    }
  };

  const handleLaunchCreationDeVinci = useCallback(() => {
    if (!authenticatedUser) return;
    const councilNames = selectedCouncil.map(s => s.name).join(', ');
    const baseInstruction = `You are the DeVinci Partner. Goal: move from concept to blueprints using first principles. Seated: ${councilNames}`;
    devinci.startConversation({
        systemInstruction: baseInstruction,
        voice: 'Zephyr',
        tools: [{ functionDeclarations: [runGenesisVerificationFunctionDeclaration, runFoundrySimulationFunctionDeclaration, triggerFullAnalysisFunctionDeclaration] }],
        onFunctionCall: async (fc) => {
            if (fc.name === 'run_genesis_verification' && cadData) {
                simulation.runGenesisVerification(cadData);
                return "Genesis 4D Audit initiated.";
            }
            if (fc.name === 'trigger_full_analysis') {
                handleEngage();
                return "Core Synthesis protocol engaged.";
            }
            return "Acknowledge.";
        },
        authenticatedUser,
        activeCad: cadData
    });
    setIsDeVinciOpen(true);
  }, [authenticatedUser, selectedCouncil, cadData, simulation, handleEngage, devinci]);

  const handleDemoLogin = (userName: string) => {
    const mockUser = usersList.find(u => u.name === userName) || usersList[0];
    setAuthenticatedUser(mockUser);
    setViewMode('app');
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setViewMode('app');
    clearInProgressAnalysis();
  };

  if (!authenticatedUser) {
    return <AuthPage onGoogleAuth={() => Promise.resolve()} onDemoLogin={handleDemoLogin} onSignup={(n, e) => {}} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-brand-dark text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
      <Header
        onStartTour={() => {}}
        onOpenUserManual={() => {}}
        authenticatedUser={authenticatedUser}
        onLogout={handleLogout}
        onOpenProfile={() => {}}
        viewMode={viewMode}
        onSwitchView={(v) => setViewMode(v as any)}
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {viewMode === 'app' && (
          <div className="w-full bg-white dark:bg-slate-800 p-6 flex-shrink-0 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
             <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Project Manager Sidebar */}
                <div className="lg:w-1/4">
                    <ProjectManager
                        projects={projects} activeProject={activeProject} activeVersionIndex={activeVersionIndex}
                        onSelectProject={onSelectProject} onNewProject={() => setIsInitiationModalOpen(true)}
                        onOpenFile={() => {}} onSaveProject={() => {}} hasUnsavedChanges={false}
                        onCommitVersion={() => {}} onStartWithDeVinci={handleLaunchCreationDeVinci}
                        onStartFromImage={() => {}} isParsingImage={false}
                        onStartFromPdf={() => {}} isParsingPdf={false}
                        onStartBrainstormFromPdf={() => {}} isParsingForBrainstorm={false}
                        onIdentifyImage={() => {}} isIdentifyingImage={false}
                        onOpenVideoImport={() => setIsVideoImportModalOpen(true)} isParsingVideo={isNeuralIngesting}
                        onEditProject={() => {}} onDeleteProject={onDeleteProject}
                        onLoadVersion={() => {}} onRevertVersion={revertToVersion}
                        onCompareVersions={() => {}} disabled={isLoading} authenticatedUser={authenticatedUser}
                        onSaveToDrive={() => {}} onOpenFromDrive={() => {}} isSavingToDrive={false} isDriveAuthenticated={false}
                        addLog={addLog} onAddDocument={addIngestedDocument} onRemoveDocument={removeIngestedDocument}
                    />
                </div>

                {/* Editor Area */}
                <div className="flex-1 space-y-6">
                    <div className="bg-gray-100 dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-tight">1. Analytical Lens</h2>
                            <div className="flex p-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                                <button onClick={() => setEditorState({ ...editorState, selectionMode: 'philosophy' })} className={`px-4 py-1 text-xs font-bold uppercase rounded-md transition-all ${selectionMode === 'philosophy' ? 'bg-brand-cyan text-white shadow-sm' : 'text-gray-500'}`}>Philosophies</button>
                                <button onClick={() => setEditorState({ ...editorState, selectionMode: 'persona' })} className={`px-4 py-1 text-xs font-bold uppercase rounded-md transition-all ${selectionMode === 'persona' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500'}`}>Personas</button>
                            </div>
                        </div>
                        {selectionMode === 'philosophy' ? (
                            <FactionSelector selectedFaction={selectedFaction} onSelectFaction={(f) => setEditorState({...editorState, selectedFaction: f})} disabled={isLoading || isViewer} authenticatedUser={authenticatedUser} />
                        ) : (
                            <PersonaSelector personas={personasList} selectedPersona={selectedPersona} onSelectPersona={(p) => setEditorState({...editorState, selectedPersona: p})} disabled={isLoading || isViewer} authenticatedUser={authenticatedUser} />
                        )}
                    </div>

                    <div className="bg-gray-100 dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <PromptInput
                            projectName={projectName} onProjectNameChange={setProjectName}
                            prompt={prompt} onPromptChange={(p) => setEditorState({...editorState, prompt: p})}
                            tags={tags} onTagsChange={(t) => setEditorState({...editorState, tags: t})}
                            onUndo={undoEditorState} onRedo={redoEditorState} canUndo={canUndoEditorState} canRedo={canRedoEditorState}
                            files={files} onFilesChange={setFiles} onEngage={handleEngage} isLoading={isLoading}
                            onClearFiles={() => setFiles([])} isReady={!!projectName && !!prompt} authenticatedUser={authenticatedUser}
                            setupAssistant={setupAssistant} onApplyFactionSuggestion={() => {}} onReanalyzeWithFaction={() => {}}
                            selectedFaction={selectedFaction} activeVersionFactionId={undefined} promptValidator={promptValidator}
                        />
                    </div>
                </div>
             </div>
          </div>
        )}

        <main className="flex-1 w-full transition-colors duration-300">
          {viewMode === 'app' ? (
            <div className="max-w-7xl mx-auto p-6">
              {activeProject ? (
                <AnalysisDisplay
                  projectName={projectName} result={result} isLoading={isLoading} error={error}
                  selectedFaction={selectedFaction} onClear={clearAnalysis} onGenerateVideo={generateVideo}
                  isVideoLoading={isVideoLoading} videoUrl={videoUrl} videoError={null}
                  drawings={drawings} onRequestDrawing={requestDrawing} onRequestDrawingFromImage={() => {}}
                  onRemoveDrawing={removeDrawing} onToggleDrawingReportInclusion={toggleDrawingReportInclusion}
                  onSetCover={() => {}} inspirationalImages={inspirationalImages} onRequestInspirationalImage={requestInspirationalImage}
                  onRemoveInspirationalImage={removeInspirationalImage} onToggleImageReportInclusion={toggleImageReportInclusion}
                  onIncorporateSuggestions={() => {}} onLaunchDeVinci={handleLaunchCreationDeVinci}
                  activeProject={activeProject}
                  activeVersion={activeProject ? (activeProject.history[activeVersionIndex] || activeProject.history[0] || null) : null}
                  authenticatedUser={authenticatedUser}
                  onGenerateSummary={() => Promise.resolve(null)} isSummaryLoading={false} summaryError={null}
                  cadData={cadData} foundryResult={foundryResult} onGenerateCad={handleGenerateCadWithMilestone}
                  isCadLoading={isCadLoading} cadError={null} isCadViewerOpen={false} onOpenCadViewer={() => {}}
                  isGoogleExporterAuthenticated={false} googleExporterUser={null} isGoogleAuthLoading={false}
                  onGoogleExporterSignIn={() => {}} onGoogleExporterSignOut={() => {}}
                  isGoogleExporting={false} googleExportStatus="" googleExportError={null} googleDocContent={null}
                  onOpenGoogleDocPreview={() => {}} onExportToGoogle={() => {}}
                  onRotorModelChange={() => {}} rossAnalysis={rossAnalysis} tts={tts}
                  inspirationalImageHistory={[]} onReinsertInspirationalImage={() => {}} onDeleteInspirationalImageFromHistory={() => {}}
                  simulation={simulation} fabricationPlanner={fabricationPlanner} gcodeVisualizer={gcodeVisualizer}
                  suggestionExplorer={suggestionExplorer} bomSourcing={bomSourcing} liveCosting={liveCosting}
                  nextStepAssistant={nextStepAssistant} patentGenerator={patentGenerator} onUpdateTasks={updateProjectTasks}
                  computeEvents={computeEvents}
                  onRevertVersion={revertToVersion}
                  onAddComputeEvent={(event) => setComputeEvents(prev => [event, ...prev])}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-3xl text-gray-500">
                   <p className="text-lg font-bold uppercase tracking-widest">Select a project to begin analysis.</p>
                </div>
              )}
            </div>
          ) : viewMode === 'admin' ? (
            <div className="w-full h-full bg-slate-50 animate-fade-in text-slate-900">
                <AdminDashboard 
                    authenticatedUser={authenticatedUser} 
                    users={usersList} 
                    projects={projects} 
                    logs={logs} 
                    personas={personasList} 
                    computeEvents={computeEvents}
                    ipAuditLogs={ipAuditLogs}
                    onUpdateUser={handleUpdateUser} 
                    onDeleteUser={handleDeleteUser} 
                    onUpdatePersona={handleUpdatePersona} 
                    onAddPersona={handleAddPersona} 
                    onDeletePersona={handleDeletePersona} 
                    onOpenTechDoc={() => setIsTechDocOpen(true)} 
                />
            </div>
          ) : viewMode === 'suite' ? (
            <ToolSuite user={authenticatedUser} onUpdateUser={handleUpdateUser} />
          ) : viewMode === 'account' ? (
            <AccountPage user={authenticatedUser} onUpdate={handleUpdateUser} onNavigateToPricing={() => setViewMode('pricing')} onBack={() => setViewMode('app')} />
          ) : viewMode === 'pricing' ? (
            <PricingPage currentPlan={authenticatedUser.subscriptionStatus} onSelectPlan={(p) => handleUpdateUser({...authenticatedUser, subscriptionStatus: p})} onBack={() => setViewMode('app')} />
          ) : viewMode === 'neural' ? (
            <NeuralWorkbench
              user={authenticatedUser}
              onAddComputeEvent={(event) => setComputeEvents(prev => [event, ...prev])}
              onBackToApp={() => setViewMode('app')}
            />
          ) : null}
        </main>
        <Footer />
      </div>

      <ProjectInitiationModal 
        isOpen={isInitiationModalOpen} onClose={() => setIsInitiationModalOpen(false)}
        onStart={(c) => { onNewProject({ name: c.name, description: c.description, tags: [] }); setIsInitiationModalOpen(false); }}
        onStartFromPdf={() => {}} onStartFromImage={() => {}} onStartFromVideo={() => setIsVideoImportModalOpen(true)}
        onStartBrainstorm={() => {}} onStartWithDeVinci={handleLaunchCreationDeVinci}
      />

      <VideoImportModal 
        isOpen={isVideoImportModalOpen} onClose={() => setIsVideoImportModalOpen(false)}
        onImportFile={() => {}} onImportUrl={handleVideoUrlImport} isLoading={isNeuralIngesting}
      />

      <DeVinciModal 
        isOpen={isDeVinciOpen} onClose={() => setIsDeVinciOpen(false)}
        startConversation={handleLaunchCreationDeVinci} stopConversation={devinci.stopConversation}
        pauseConversation={devinci.pauseConversation} resumeConversation={devinci.resumeConversation}
        state={devinci.state} transcript={devinci.transcript} onFileUpload={devinci.sendFile}
        analyzableFile={devinci.analyzableFile} sendImageRegion={devinci.sendImageRegion}
        simulateNewSpeaker={devinci.simulateNewSpeaker} manualRetry={devinci.manualRetry}
        retryCount={devinci.retryCount} selectedCouncil={selectedCouncil}
      />

      <TechnicalDocumentModal isOpen={isTechDocOpen} onClose={() => setIsTechDocOpen(false)} />

      {/* Global Compute Milestone Notification Alert System */}
      <SystemToast onViewTimeline={() => setViewMode('app')} />
    </div>
  );
}
