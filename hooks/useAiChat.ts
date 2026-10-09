
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { AiChatState, ChatMessage, LogEntry, IngestedDocument } from '../types';
import { parseApiError } from '../services/geminiService';

export const useAiChat = (
  addLog: (level: LogEntry['level'], message: string) => void,
  knowledgeBase: IngestedDocument[] = [],
  activeProjectId?: string
) => {
    const [state, setState] = useState<AiChatState>('idle');
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const chatSessionRef = useRef<Chat | null>(null);

    // FIX 3: Purging "Idea Leakage" in AI Chat
    useEffect(() => {
        // When the component unmounts or the project changes, hard-purge the chat session buffers
        if (chatSessionRef.current) {
            chatSessionRef.current = null;
            setHistory([]);
            window.dispatchEvent(new CustomEvent('forge-log', { 
                detail: '[SYSTEM]: AI Chat session terminated and history purged for agnostic isolation.' 
            }));
        }
    }, [activeProjectId]);

    const startChat = useCallback((baseSystemInstruction: string) => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        addLog('INFO', 'AI Chat session started with Retrieval Layer active.');

        // Step A: Build a Knowledge Retrieval Block
        let finalInstruction = baseSystemInstruction;
        if (knowledgeBase.length > 0) {
            const knowledgeContext = knowledgeBase.map(doc => `[SOURCE: ${doc.name}]\n${doc.content}`).join('\n\n---\n\n');
            finalInstruction += `\n\n### PROJECT KNOWLEDGE BASE (INGESTED DOCUMENTS)\nUse the following technical reference data to answer specific questions accurately. If information is found in these sources, prioritize it over generic knowledge.\n\n${knowledgeContext}`;
        }

        chatSessionRef.current = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: { systemInstruction: finalInstruction },
        });
        setHistory([]);
        setState('idle');
        setError(null);
    }, [addLog, knowledgeBase]);

    const endChat = useCallback(() => {
        addLog('INFO', 'AI Chat session ended.');
        chatSessionRef.current = null;
        setHistory([]);
        setState('idle');
        setError(null);
    }, [addLog]);

    const sendMessage = useCallback(async (message: string) => {
        if (!chatSessionRef.current || state === 'thinking') {
            return;
        }

        setState('thinking');
        setError(null);
        
        setHistory(prev => [...prev, { role: 'user', parts: [{ text: message }] }]);

        try {
            const response = await chatSessionRef.current.sendMessageStream({ message });
            
            let currentModelResponse = "";
            let modelMessageIndex = -1;

            for await (const chunk of response) {
                currentModelResponse += chunk.text;
                setHistory(prev => {
                    const newHistory = [...prev];
                    if (modelMessageIndex < 0) {
                        modelMessageIndex = newHistory.length;
                        newHistory.push({ role: 'model', parts: [{ text: currentModelResponse }] });
                    } else {
                        newHistory[modelMessageIndex] = { role: 'model', parts: [{ text: currentModelResponse }] };
                    }
                    return newHistory;
                });
            }
            addLog('INFO', 'AI Chat response received.');
        } catch (e) {
            const errorMessage = parseApiError(e);
            setError(errorMessage);
            setState('error');
            addLog('ERROR', `AI Chat error: ${errorMessage}`);
        } finally {
            setState('idle');
        }
    }, [state, addLog]);

    return {
        state,
        history,
        error,
        startChat,
        endChat,
        sendMessage,
    };
};
