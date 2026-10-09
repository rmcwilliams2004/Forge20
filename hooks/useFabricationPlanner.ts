import { useState, useCallback } from 'react';
import { generateFabricationPlan, parseApiError } from '../services/geminiService';
import { FabricationPlan, LogEntry, ManufacturingProcessType } from '../types';

export const useFabricationPlanner = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [plan, setPlan] = useState<FabricationPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runPlanner = useCallback(async (process: ManufacturingProcessType, material: string, productContext: string) => {
        setIsLoading(true);
        setError(null);
        setPlan(null);
        addLog('INFO', `Starting Fabrication Planner for ${process} with ${material}.`);

        try {
            const result = await generateFabricationPlan(process, material, productContext);
            setPlan(result);
            addLog('INFO', `Fabrication Plan generated successfully.`);
        } catch (e) {
            const errorMessage = parseApiError(e);
            setError(errorMessage);
            addLog('ERROR', `Fabrication Planner failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [addLog]);

    const clearPlanner = useCallback(() => {
        setPlan(null);
        setError(null);
    }, []);

    return { plan, isLoading, error, runPlanner, clearPlanner };
};
