
import { useState, useCallback } from 'react';
import { generateCadData, compareCadData, parseApiError } from '../services/geminiService';
import { Project, CadData, CadComparisonResult, LogEntry } from '../types';

export interface ComparisonData {
    baseCad: CadData;
    newCad: CadData;
    diff: CadComparisonResult;
    baseVersionCommit: string;
    newVersionCommit: string;
}

export const useVersionComparer = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [isComparing, setIsComparing] = useState<boolean>(false);
    const [comparisonError, setComparisonError] = useState<string | null>(null);

    const runComparison = useCallback(async (project: Project, newVersionIndex: number) => {
        // Safe check for history availability
        const history = project.history || [];
        const baseVersionIndex = newVersionIndex + 1;
        
        if (!history[newVersionIndex] || !history[baseVersionIndex]) {
            setComparisonError("Insufficient history for comparison.");
            return;
        }

        const newVersion = history[newVersionIndex];
        const baseVersion = history[baseVersionIndex];

        setIsComparing(true);
        setComparisonError(null);
        setComparisonData(null);
        addLog('INFO', `Comparing versions: "${newVersion.commitMessage}" vs "${baseVersion.commitMessage}".`);

        try {
            if (!newVersion.result || !baseVersion.result) {
                throw new Error("One or both versions are missing analysis results.");
            }
            
            const [baseCad, newCad] = await Promise.all([
                generateCadData(baseVersion.drawings || [], baseVersion.result),
                generateCadData(newVersion.drawings || [], newVersion.result)
            ]);

            const diff = await compareCadData(baseCad, newCad);

            setComparisonData({
                baseCad,
                newCad,
                diff,
                baseVersionCommit: baseVersion.commitMessage,
                newVersionCommit: newVersion.commitMessage,
            });
            addLog('INFO', 'Geometric difference calculation complete.');

        } catch (e) {
            const errorMessage = parseApiError(e);
            setComparisonError(errorMessage);
            addLog('ERROR', `Comparison failed: ${errorMessage}`);
        } finally {
            setIsComparing(false);
        }

    }, [addLog]);

    const clearComparison = useCallback(() => {
        setComparisonData(null);
        setComparisonError(null);
        setIsComparing(false);
    }, []);

    return { comparisonData, isComparing, comparisonError, runComparison, clearComparison };
};
