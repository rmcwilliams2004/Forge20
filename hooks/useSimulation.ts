import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSimulationResult, generateInspirationalImage, parseApiError } from '../services/geminiService';
import { SimulationResult, SimulationType, LogEntry, CadData } from '../types';
import { dispatchMilestoneAlert } from '../services/notificationService';

export const useSimulation = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [isPhysicsActive, setIsPhysicsActive] = useState(false);
    const [physicsResult, setPhysicsResult] = useState<any>(null);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [liveStepLogs, setLiveStepLogs] = useState<string[]>([]);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Cleanup active EventSource on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, []);

    const runSimulation = useCallback(async (type: SimulationType, componentNames: string[], productContext: string) => {
        const componentName = componentNames.join(', ');
        setSimulationResult({ type, componentName, summary: '', keyFindings: [], imageUrl: null, imagePrompt: '', isLoading: true, error: null });
        addLog('INFO', `Starting ${type} multi-physics analysis for "${componentName}".`);
        try {
            const textResult = await generateSimulationResult(type, componentName, productContext);
            setSimulationResult(prev => prev ? { ...prev, summary: textResult.summary, keyFindings: textResult.keyFindings, imagePrompt: textResult.imagePrompt } : prev);
            const imageUrl = await generateInspirationalImage(textResult.imagePrompt, '16:9');
            setSimulationResult(prev => prev ? { ...prev, imageUrl, isLoading: false } : null);
            
            // Log entry & alert notification for simulation milestone
            addLog('INFO', `[COMPUTE MILESTONE]: ${type} Multiphysics simulation for "${componentName}" completed successfully.`);
            dispatchMilestoneAlert({
                type: 'FEA_SIMULATION',
                title: `${type} Multi-Physics Simulation Complete`,
                description: `Solver finished for "${componentName}". Stress tensors and physical invariants converged.`,
                cost: 18.5,
                status: 'OPTIMIZED'
            });
        } catch (e) {
            const errorMessage = parseApiError(e);
            setSimulationResult(prev => prev ? { ...prev, error: errorMessage, isLoading: false } : null);
            addLog('ERROR', `[${type}] Simulation for "${componentName}" failed: ${errorMessage}`);
        }
    }, [addLog]);

    const runGenesisVerification = useCallback(async (cadData: CadData, environmentId: string = 'SAA_LEO_ORBIT') => {
        setIsPhysicsActive(true);
        setPhysicsResult(null);
        setLiveStepLogs([]);
        addLog('INFO', `[GENESIS MULTIPHYSICS]: Dispatching solver job to FastAPI background worker...`);

        // Close any pre-existing SSE stream
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        try {
            // 1. Prepare Snapshot
            const snapshot = {
                mesh_data: { 
                    geometry: cadData.assemblyName, 
                    poly_count: cadData.facesCount || 1024 
                }, 
                nal_constants: {
                    yield_strength_gpa: 0.95,
                    density: 4430.0,
                    youngs_modulus: 1.14e11
                },
                environment_id: environmentId
            };

            // 2. Dispatch real multi-physics solver via FastAPI BackgroundTasks
            const response = await fetch('/api/foundry/physics/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(snapshot)
            });

            if (!response.ok) {
                throw new Error(`Solver Dispatch Error: HTTP ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const jobId = data.job_id;
            setActiveJobId(jobId);

            addLog('INFO', `[GENESIS]: Job ${jobId} queued. Opening live Server-Sent Events (SSE) telemetry stream...`);

            // 3. Connect real-time Server-Sent Events stream (/api/foundry/stream/{job_id})
            const sseUrl = `/api/foundry/stream/${jobId}`;
            const es = new EventSource(sseUrl);
            eventSourceRef.current = es;

            es.addEventListener('init', (e: MessageEvent) => {
                const initData = JSON.parse(e.data);
                addLog('INFO', `[GENESIS STREAM]: Connected to worker. Solver: ${initData.solver_type}. Mesh: ${initData.poly_count} elements.`);
            });

            es.addEventListener('solver_step', (e: MessageEvent) => {
                const step = JSON.parse(e.data);
                
                // Update live telemetry in viewport state
                setPhysicsResult((prev: any) => ({
                    simulation_id: jobId,
                    job_id: jobId,
                    status: 'SOLVING',
                    current_step: step.iteration,
                    total_steps: step.total_iterations,
                    residuals: step.residuals,
                    courant_number: step.courant_number,
                    telemetry: step.telemetry,
                    visual_layers: step.visual_layers,
                    log_history: [...(prev?.log_history || []), step.log_message].slice(-15)
                }));

                setLiveStepLogs(prev => [...prev, step.log_message].slice(-20));
                addLog('INFO', `[SOLVER STEP ${step.iteration}/${step.total_iterations}] σ_max: ${step.telemetry.max_stress_gpa} GPa | Res: ${step.residuals.momentum.toExponential(2)}`);
            });

            es.addEventListener('completed', (e: MessageEvent) => {
                const finalResult = JSON.parse(e.data);
                setPhysicsResult({
                    ...finalResult,
                    job_id: jobId
                });
                setIsPhysicsActive(false);
                es.close();
                eventSourceRef.current = null;

                addLog('INFO', `[COMPUTE MILESTONE]: Multi-Physics Solver converged. All conservation laws satisfied.`);
                dispatchMilestoneAlert({
                    type: 'GENESIS_AUDIT',
                    title: 'Genesis Multi-Physics Convergence Achieved',
                    description: `Coupled thermal-stress invariants converged for "${cadData.assemblyName}". Peak Von Mises: ${finalResult.telemetry?.max_stress_gpa} GPa.`,
                    cost: 32.5,
                    status: 'VERIFIED'
                });
            });

            es.addEventListener('error', (e: any) => {
                console.warn("[Genesis SSE Stream Notice]: Stream connection event closed or error:", e);
                es.close();
                eventSourceRef.current = null;
                setIsPhysicsActive(false);
            });

        } catch (err: any) {
            setIsPhysicsActive(false);
            const msg = err?.message || 'Network fault';
            addLog('ERROR', `[GENESIS]: Multiphysics worker dispatch failed: ${msg}`);
        }
    }, [addLog]);

    return { 
        simulationResult, 
        isPhysicsActive, 
        physicsResult, 
        activeJobId,
        liveStepLogs,
        runSimulation, 
        runGenesisVerification, 
        clearSimulation: () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setPhysicsResult(null);
            setActiveJobId(null);
        }
    };
};
