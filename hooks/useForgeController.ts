
import { useState, useCallback, useEffect, useRef } from 'react';
import { SystemState, Role, User, IoStatus, ExportStatus, VoiceInterfaceMode, NalPrecision } from '../types';
import { defrostSystem, performAgnosticWipe } from '../services/StorageManager';

export const useForgeController = (user: User | null) => {
    const [systemState, setSystemState] = useState<SystemState>(SystemState.IDLE);
    const [ioStatus, setIoStatus] = useState<IoStatus>('IDLE');
    const [exportStatus, setExportStatus] = useState<ExportStatus>('IDLE');
    const [voiceMode, setVoiceMode] = useState<VoiceInterfaceMode>('MANUAL');
    
    // NAL CONVERGENCE SETTINGS
    const [targetPrecision, setTargetPrecision] = useState<NalPrecision>(NalPrecision.ANALYSIS);
    const [activePrecision, setActivePrecision] = useState<NalPrecision>(NalPrecision.ANALYSIS);
    const precisionTimeoutRef = useRef<number | null>(null);

    const isAdmin = user?.role === Role.Admin;

    const transition = useCallback((next: SystemState) => {
        setSystemState(next);
        window.dispatchEvent(new CustomEvent('forge-log', { detail: `[SYSTEM_STATE]: Transitioned to ${next}` }));
    }, []);

    const forceFlush = useCallback(() => {
        if (!isAdmin) return;
        window.dispatchEvent(new CustomEvent('forge-log', { detail: "[ADMIN]: Initiating Hard Flush. Terminating all inference buffers." }));
        transition(SystemState.IDLE);
        window.dispatchEvent(new CustomEvent('forge-flush-complete'));
    }, [isAdmin, transition]);

    const forceStable = useCallback(() => {
        if (!isAdmin) return;
        window.dispatchEvent(new CustomEvent('forge-log', { detail: "[ADMIN]: Manual Overdrive - Forcing STABLE state." }));
        transition(SystemState.STABLE);
    }, [isAdmin, transition]);

    const performDefrost = useCallback(async () => {
        if (!isAdmin) return;
        window.dispatchEvent(new CustomEvent('forge-log', { detail: "[ADMIN]: Initiating System Defrost. Clearing I/O Bus." }));
        await defrostSystem();
        transition(SystemState.IDLE);
    }, [isAdmin, transition]);

    const agnosticWipe = useCallback(async () => {
        window.dispatchEvent(new CustomEvent('forge-log', { detail: "[SYSTEM]: Executing Agnostic Wipe Sequence..." }));
        await performAgnosticWipe();
        transition(SystemState.IDLE);
    }, [transition]);

    const handleNalActivity = useCallback(() => {
        // "Down-shift" to Draft mode for snappiness during slider moves
        setActivePrecision(NalPrecision.DRAFT);
        
        // Only log "Waiting" at the start of a burst to avoid log spam
        if (!precisionTimeoutRef.current) {
            window.dispatchEvent(new CustomEvent('forge-log', { detail: `[NAL_CONTROLLER]: Input detected. Waiting for stability...` }));
        }

        if (precisionTimeoutRef.current) {
            window.clearTimeout(precisionTimeoutRef.current);
        }

        // "Up-shift" back to target precision after movement stops (500ms debounce)
        precisionTimeoutRef.current = window.setTimeout(() => {
            setActivePrecision(targetPrecision);
            window.dispatchEvent(new CustomEvent('forge-log', { 
                detail: `[NAL_CONTROLLER]: Configuration stable. Deep-solving enabled.` 
            }));
            
            if (targetPrecision === NalPrecision.FOUNDRY) {
                transition(SystemState.DEEP_SOLVE);
            } else {
                transition(SystemState.STABLE);
            }
            precisionTimeoutRef.current = null;
        }, 500);
    }, [targetPrecision, transition]);

    useEffect(() => {
        const handleStatus = (e: any) => {
            const status = e.detail;
            if (status === 'CALIBRATING') transition(SystemState.CALIBRATING);
            if (status === 'SOLVED') transition(SystemState.STABLE);
            if (status === 'LOCKED') transition(SystemState.LOCKED);
            if (status === 'THROTTLED') transition(SystemState.IDLE);
            if (status === 'ACTIVE_LISTENING') {
                // Interactive Handshake: Focus and pulse the main input
                const mainInput = document.getElementById('tour-step-2') as HTMLTextAreaElement;
                if (mainInput) {
                    mainInput.focus();
                    mainInput.classList.add('ring-4', 'ring-brand-cyan', 'animate-pulse');
                    setTimeout(() => {
                        mainInput.classList.remove('ring-4', 'ring-brand-cyan', 'animate-pulse');
                    }, 3000);
                }
            }
        };
        const handleFlush = () => transition(SystemState.IDLE);
        const handleIo = (e: any) => setIoStatus(e.detail.status);
        const handleExport = (e: any) => setExportStatus(e.detail);
        const handleNalActive = () => handleNalActivity();

        window.addEventListener('forge-status', handleStatus);
        window.addEventListener('forge-flush-complete', handleFlush);
        window.addEventListener('forge-io', handleIo);
        window.addEventListener('forge-export-status', handleExport);
        window.addEventListener('forge-nal-activity', handleNalActive);

        return () => {
            window.removeEventListener('forge-status', handleStatus);
            window.removeEventListener('forge-flush-complete', handleFlush);
            window.removeEventListener('forge-io', handleIo);
            window.removeEventListener('forge-export-status', handleExport);
            window.removeEventListener('forge-nal-activity', handleNalActive);
        };
    }, [transition, handleNalActivity]);

    return { 
        systemState, 
        ioStatus, 
        exportStatus,
        voiceMode,
        setVoiceMode,
        nalPrecision: activePrecision,
        targetPrecision,
        setTargetPrecision,
        forceFlush, 
        forceStable, 
        performDefrost,
        agnosticWipe,
        transition 
    };
};
