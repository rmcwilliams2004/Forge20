
import { useState, useCallback } from 'react';
import { sourceBomItemWithValidation, parseApiError } from '../services/geminiService';
import { BillOfMaterialsItem, ProcurementInfo, LogEntry } from '../types';

export const useBomSourcing = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [sourcingResults, setSourcingResults] = useState<Map<number, ProcurementInfo[]>>(new Map());
    const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map());
    const [errorStates, setErrorStates] = useState<Map<number, string | null>>(new Map());

    const sourceItem = useCallback(async (item: BillOfMaterialsItem) => {
        const partNumber = item.part_number;
        
        setLoadingStates(prev => new Map(prev).set(partNumber, true));
        setErrorStates(prev => {
            const newMap = new Map(prev);
            newMap.delete(partNumber);
            return newMap;
        });
        addLog('INFO', `Deep-sourcing part: "${item.name}". querying aggregator and validating with AI...`);

        try {
            const results = await sourceBomItemWithValidation(item);
            setSourcingResults(prev => new Map(prev).set(partNumber, results));
            addLog('INFO', `Sourcing complete for "${item.name}". AI validated credibility.`);
        } catch (e) {
            const errorMessage = parseApiError(e);
            setErrorStates(prev => new Map(prev).set(partNumber, errorMessage));
            addLog('ERROR', `Sourcing failed for "${item.name}": ${errorMessage}`);
        } finally {
            setLoadingStates(prev => new Map(prev).set(partNumber, false));
        }
    }, [addLog]);

    const clearSourcing = useCallback(() => {
        setSourcingResults(new Map());
        setLoadingStates(new Map());
        setErrorStates(new Map());
    }, []);

    return { sourcingResults, loadingStates, errorStates, sourceItem, clearSourcing };
};
