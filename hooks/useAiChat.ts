import { useState, useRef, useCallback, useEffect } from 'react';
import { AiChatState, ChatMessage, LogEntry, IngestedDocument } from '../types';
import { parseApiError } from '../services/geminiService';
import { backendApiService } from '../services/backendApiService';

export const useAiChat = (
  addLog: (level: LogEntry['level'], message: string) => void,
  knowledgeBase: IngestedDocument[] = [],
  activeProjectId?: string
) => {
    const [state, setState] = useState<AiChatState>('idle');
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const systemInstructionRef = useRef<string>('You are an expert engineering design AI.');
    const activeRef = useRef<boolean>(false);

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current = false;
            setHistory([]);
            window.dispatchEvent(new CustomEvent('forge-log', { 
                detail: '[SYSTEM]: AI Chat session terminated and history purged for agnostic isolation.' 
            }));
        }
    }, [activeProjectId]);

    const startChat = useCallback((baseSystemInstruction: string) => {
        addLog('INFO', 'AI Chat session started with Retrieval Layer active (FastAPI routing).');

        let finalInstruction = baseSystemInstruction;
        if (knowledgeBase.length > 0) {
            const knowledgeContext = knowledgeBase.map(doc => `[SOURCE: ${doc.name}]\n${doc.content}`).join('\n\n---\n\n');
            finalInstruction += `\n\n### PROJECT KNOWLEDGE BASE (INGESTED DOCUMENTS)\nUse the following technical reference data to answer specific questions accurately:\n\n${knowledgeContext}`;
        }

        systemInstructionRef.current = finalInstruction;
        activeRef.current = true;
        setHistory([]);
        setState('idle');
        setError(null);
    }, [addLog, knowledgeBase]);

    const endChat = useCallback(() => {
        addLog('INFO', 'AI Chat session ended.');
        activeRef.current = false;
        setHistory([]);
        setState('idle');
        setError(null);
    }, [addLog]);

    const sendMessage = useCallback(async (message: string) => {
        if (!activeRef.current || state === 'thinking') {
            return;
        }

        setState('thinking');
        setError(null);
        
        setHistory(prev => [...prev, { role: 'user', parts: [{ text: message }] }]);

        try {
            // Route through unified FastAPI chat endpoint
            const formattedHistory = history.map(h => ({
                role: h.role,
                content: h.parts.map(p => p.text).join(' '),
            }));

            const response = await backendApiService.postChat({
                message,
                systemInstruction: systemInstructionRef.current,
                history: formattedHistory,
                knowledgeBase,
            });

            setHistory(prev => [
                ...prev, 
                { role: 'model', parts: [{ text: response.reply }] }
            ]);
            addLog('INFO', 'AI Chat response received via FastAPI sovereign proxy.');
        } catch (e: any) {
            const errorMessage = parseApiError(e);
            setError(errorMessage);
            setState('error');
            addLog('ERROR', `AI Chat error: ${errorMessage}`);
        } finally {
            setState('idle');
        }
    }, [state, history, knowledgeBase, addLog]);

    return {
        state,
        history,
        error,
        startChat,
        endChat,
        sendMessage,
    };
};
