import { useState, useCallback } from 'react';
import { exploreSuggestion as performSuggestionExploration, parseApiError } from '../services/geminiService';
import { ExplorationResult, LogEntry } from '../types';

export const useSuggestionExplorer = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [explorationResult, setExplorationResult] = useState<ExplorationResult | null>(null);
    const [isExploring, setIsExploring] = useState(false);
    const [explorationError, setExplorationError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const explore = useCallback(async (suggestionText: string, productContext: string) => {
        setIsExploring(true);
        setExplorationError(null);
        setExplorationResult(null);
        setIsModalOpen(true);
        addLog('INFO', `Exploring suggestion: "${suggestionText.substring(0, 50)}...".`);

        try {
            const { explanation, imageUrl } = await performSuggestionExploration(suggestionText, productContext);
            const result: ExplorationResult = { suggestionText, explanation, imageUrl };
            setExplorationResult(result);
            addLog('INFO', 'Suggestion exploration successful.');
        } catch (e) {
            const errorMessage = parseApiError(e);
            setExplorationError(errorMessage);
            addLog('ERROR', `Suggestion exploration failed: ${errorMessage}`);
        } finally {
            setIsExploring(false);
        }
    }, [addLog]);

    const clearExploration = useCallback(() => {
        setIsModalOpen(false);
        // Add a delay to allow for fade-out animation
        setTimeout(() => {
            setExplorationResult(null);
            setExplorationError(null);
            setIsExploring(false);
        }, 300);
    }, []);

    return {
        isModalOpen,
        explorationResult,
        isExploring,
        explorationError,
        explore,
        clearExploration,
    };
};