import { useState, useCallback, useRef } from 'react';
import { getSetupSuggestions, parseApiError } from '../services/geminiService';
import { SetupSuggestions } from '../types';

export interface UseSetupAssistant {
    suggestions: SetupSuggestions | null;
    isLoading: boolean;
    error: string | null;
    fetchSuggestions: (prompt: string) => void;
}

export const useSetupAssistant = (): UseSetupAssistant => {
    const [suggestions, setSuggestions] = useState<SetupSuggestions | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const debounceTimeoutRef = useRef<number | null>(null);

    const fetchSuggestions = useCallback((prompt: string) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (!prompt || prompt.trim().length < 20) {
            setSuggestions(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        debounceTimeoutRef.current = window.setTimeout(async () => {
            try {
                const result = await getSetupSuggestions(prompt);
                setSuggestions(result);
            } catch (e) {
                const errorMessage = parseApiError(e);
                console.error("Setup Assistant Error:", errorMessage);
                setError(errorMessage);
                setSuggestions(null);
            } finally {
                setIsLoading(false);
            }
        }, 1000); // 1-second debounce

    }, []);

    return { suggestions, isLoading, error, fetchSuggestions };
};
