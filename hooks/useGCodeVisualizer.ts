import { useState, useCallback } from 'react';
import { summarizeGCode, parseApiError } from '../services/geminiService';
import { GCodeSummary, LogEntry } from '../types';

export const useGCodeVisualizer = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gcodeToVisualize, setGCodeToVisualize] = useState<string | null>(null);
    const [summary, setSummary] = useState<GCodeSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openModal = useCallback(async (gcode: string) => {
        setIsModalOpen(true);
        setGCodeToVisualize(gcode);
        setIsLoading(true);
        setError(null);
        setSummary(null);
        addLog('INFO', 'Starting G-Code summary generation.');

        try {
            const result = await summarizeGCode(gcode);
            setSummary(result);
            addLog('INFO', 'G-Code summary generated successfully.');
        } catch (e) {
            const errorMessage = parseApiError(e);
            setError(errorMessage);
            addLog('ERROR', `G-Code summary generation failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [addLog]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setGCodeToVisualize(null);
        setSummary(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        isModalOpen,
        gcodeToVisualize,
        summary,
        isLoading,
        error,
        openModal,
        closeModal,
    };
};
