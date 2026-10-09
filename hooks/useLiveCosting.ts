import { useState, useCallback, useMemo } from 'react';
import { recalculateCost, parseApiError } from '../services/geminiService';
import { PreliminaryCostEstimate, BillOfMaterialsItem, AnalysisResult, LogEntry, ManufacturingProcess } from '../types';

export const useLiveCosting = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [originalEstimate, setOriginalEstimate] = useState<PreliminaryCostEstimate | null>(null);
    const [currentEstimate, setCurrentEstimate] = useState<PreliminaryCostEstimate | null>(null);
    const [editableBom, setEditableBom] = useState<BillOfMaterialsItem[]>([]);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Storing context from the initial analysis result
    const [manufacturingContext, setManufacturingContext] = useState<ManufacturingProcess[]>([]);
    const [materialContext, setMaterialContext] = useState<string>('');

    const initialize = useCallback((analysisResult: AnalysisResult | null) => {
        if (analysisResult) {
            setOriginalEstimate(analysisResult.preliminaryCostEstimate);
            setCurrentEstimate(analysisResult.preliminaryCostEstimate);
            setEditableBom(JSON.parse(JSON.stringify(analysisResult.billOfMaterials))); // Deep copy
            setManufacturingContext(analysisResult.manufacturing_analysis);
            setMaterialContext(analysisResult.material_suggestions.map(m => m.name).join(', '));
        } else {
            setOriginalEstimate(null);
            setCurrentEstimate(null);
            setEditableBom([]);
            setManufacturingContext([]);
            setMaterialContext('');
        }
    }, []);

    const updateBomItem = useCallback((partNumber: number, field: keyof BillOfMaterialsItem, value: string | number) => {
        setEditableBom(prevBom => {
            return prevBom.map(item => {
                if (item.part_number === partNumber) {
                    return { ...item, [field]: value };
                }
                return item;
            });
        });
    }, []);

    const recalculate = useCallback(async () => {
        if (editableBom.length === 0) return;
        
        setIsRecalculating(true);
        setError(null);
        addLog('INFO', 'Recalculating cost estimate...');

        try {
            const newEstimate = await recalculateCost(editableBom, manufacturingContext, materialContext);
            setCurrentEstimate(newEstimate);
            addLog('INFO', 'Cost estimate recalculated successfully.');
        } catch (e) {
            const errorMessage = parseApiError(e);
            setError(errorMessage);
            addLog('ERROR', `Cost recalculation failed: ${errorMessage}`);
        } finally {
            setIsRecalculating(false);
        }
    }, [addLog, editableBom, manufacturingContext, materialContext]);

    const hasChanges = useMemo(() => {
        if (!originalEstimate || !currentEstimate) return false;
        // A simple check to see if recalculation has happened
        return JSON.stringify(originalEstimate) !== JSON.stringify(currentEstimate);
    }, [originalEstimate, currentEstimate]);

    return {
        originalEstimate,
        currentEstimate,
        editableBom,
        isRecalculating,
        error,
        initialize,
        updateBomItem,
        recalculate,
        hasChanges,
    };
};
