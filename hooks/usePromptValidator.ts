import { useState, useCallback, useRef } from 'react';
import { validatePrompt, parseApiError } from '../services/geminiService';
import { PromptValidationResult } from '../types';

export const usePromptValidator = () => {
    const [validationResult, setValidationResult] = useState<PromptValidationResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceTimeoutRef = useRef<number | null>(null);

    const checkPrompt = useCallback((prompt: string) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (!prompt || prompt.trim().length < 25) { // Only validate slightly longer prompts
            setValidationResult(null);
            setIsChecking(false);
            setError(null);
            return;
        }
        
        setIsChecking(true);
        setError(null);
        
        debounceTimeoutRef.current = window.setTimeout(async () => {
            try {
                const result = await validatePrompt(prompt);
                setValidationResult(result);
            } catch (e) {
                const errorMessage = parseApiError(e);
                console.error("Prompt validation failed:", errorMessage);
                setError(errorMessage);
                setValidationResult(null);
            } finally {
                setIsChecking(false);
            }
        }, 1200); // 1.2-second debounce

    }, []);
    
    const clearValidation = useCallback(() => {
        setValidationResult(null);
        setIsChecking(false);
        setError(null);
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
    }, []);

    return { validationResult, isChecking, error, checkPrompt, clearValidation };
};
