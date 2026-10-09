import { useState, useCallback } from 'react';
import { getNextStepSuggestions, parseApiError } from '../services/geminiService';
import { AnalysisResult, LogEntry, NextStepSuggestion, GeneratedDrawing, GeneratedImage } from '../types';

export const useNextStepAssistant = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [suggestions, setSuggestions] = useState<NextStepSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = useCallback(async (result: AnalysisResult, drawings: GeneratedDrawing[], images: GeneratedImage[]) => {
        setIsLoading(true);
        setError(null);
        addLog('INFO', 'Fetching AI-suggested next steps...');

        // Create a concise context for the AI
        const context = `
        Product: ${result.product_name}
        Summary: ${result.executive_summary}
        Faction Rationale: ${result.faction_rationale.summary}
        Material Suggestions Available: ${result.material_suggestions.length > 0}
        System Suggestions Available: ${result.suggested_systems.length > 0}
        Drawings Generated: ${drawings.filter(d => d.url).length}
        Concept Images Generated: ${images.filter(i => i.url).length}
        `;

        try {
            const newSuggestions = await getNextStepSuggestions(context);
            setSuggestions(newSuggestions);
            addLog('INFO', 'Successfully fetched next step suggestions.');
        } catch (e) {
            const errorMessage = parseApiError(e);
            setError(errorMessage);
            addLog('ERROR', `Failed to fetch next step suggestions: ${errorMessage}`);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [addLog]);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
        setError(null);
    }, []);

    return { suggestions, isLoading, error, fetchSuggestions, clearSuggestions };
};
