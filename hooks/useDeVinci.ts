import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration } from '@google/genai';
import { DeVinciState, TranscriptEntry, DeVinciVoice, User, CadData } from '../types';

// Helper to encode audio data for the API
function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768; // Convert float to 16-bit PCM
    }
    const binary = String.fromCharCode(...new Uint8Array(int16.buffer));
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// Helper to decode audio from the API
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Helper to prepare audio for playback
async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

interface StartConversationConfig {
    systemInstruction: string;
    voice: DeVinciVoice;
    tools?: { functionDeclarations: FunctionDeclaration[] }[];
    onFunctionCall?: (fc: { name: string, args: any, id: string }) => Promise<any>;
    authenticatedUser: User;
    activeCad?: CadData | null;
}

export const useDeVinci = () => {
    const [state, setState] = useState<DeVinciState>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [analyzableFile, setAnalyzableFile] = useState<File | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const lastConfig = useRef<StartConversationConfig | null>(null);
    const sessionPromise = useRef<Promise<any> | null>(null);
    
    // Audio Context Refs
    const audioRefs = useRef<{
        inputAudioContext?: AudioContext,
        outputAudioContext?: AudioContext,
        scriptProcessor?: ScriptProcessorNode,
        mediaStream?: MediaStream,
        source?: MediaStreamAudioSourceNode,
        nextStartTime: number,
        sources: Set<AudioBufferSourceNode>
    }>({ nextStartTime: 0, sources: new Set() });

    const cleanupAudio = useCallback(() => {
        // Stop all tracks
        audioRefs.current.mediaStream?.getTracks().forEach(track => track.stop());
        
        // Disconnect processor
        if (audioRefs.current.scriptProcessor) {
            audioRefs.current.scriptProcessor.disconnect();
            audioRefs.current.scriptProcessor = undefined;
        }
        
        // Disconnect source
        if (audioRefs.current.source) {
            audioRefs.current.source.disconnect();
            audioRefs.current.source = undefined;
        }

        // Stop all playing sources
        audioRefs.current.sources.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        audioRefs.current.sources.clear();

        // Close contexts
        const inputCtx = audioRefs.current.inputAudioContext;
        if (inputCtx && inputCtx.state !== 'closed') inputCtx.close().catch(() => {});
        audioRefs.current.inputAudioContext = undefined;

        const outputCtx = audioRefs.current.outputAudioContext;
        if (outputCtx && outputCtx.state !== 'closed') outputCtx.close().catch(() => {});
        audioRefs.current.outputAudioContext = undefined;
    }, []);
    
    const stopConversation = useCallback(async () => {
        cleanupAudio();

        if (sessionPromise.current) {
            try {
                const session = await sessionPromise.current;
                session?.close();
            } catch (e) {
                console.warn("Session close error:", e);
            }
            sessionPromise.current = null;
        }
        
        setState('idle');
    }, [cleanupAudio]);

    const startConversation = useCallback(async (config: StartConversationConfig) => {
        // Ensure clean state before starting
        await stopConversation();
        
        lastConfig.current = config;
        setState('connecting');
        setTranscript([]);

        // API Key Validation - MUST obtain from process.env.API_KEY
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: Missing API_KEY in environment");
            setTranscript([{ source: 'devinci', text: "System Error: Missing Neural API Key. Check configuration.", isFinal: true }]);
            setState('error');
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        try {
            // Initialize Audio Contexts
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioRefs.current.inputAudioContext = new AudioContextClass({ sampleRate: 16000 }); // Input requires 16k for Gemini
            audioRefs.current.outputAudioContext = new AudioContextClass({ sampleRate: 24000 }); // Output is usually 24k

            // Request Microphone Access
            audioRefs.current.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 16000
                } 
            });
        } catch (err) {
            console.error("Microphone Access Denied:", err);
            setTranscript([{ source: 'devinci', text: "Access Denied: I cannot hear you. Please allow microphone access.", isFinal: true }]);
            setState('error');
            return;
        }

        // Connect to Gemini Live API
        try {
            const livePromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025', 
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { 
                        voiceConfig: { 
                            prebuiltVoiceConfig: { 
                                voiceName: config.voice || 'Aoede' // Default to Aoede if undefined
                            } 
                        } 
                    },
                    systemInstruction: config.systemInstruction,
                    tools: config.tools,
                },
                callbacks: {
                    onopen: () => {
                        console.log("DeVinci: Connection Established");
                        const inputCtx = audioRefs.current.inputAudioContext!;
                        const stream = audioRefs.current.mediaStream!;
                        
                        audioRefs.current.source = inputCtx.createMediaStreamSource(stream);
                        // Use ScriptProcessor for broad compatibility
                        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                        audioRefs.current.scriptProcessor = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            livePromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        audioRefs.current.source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                        
                        setState('listening');
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Function Calls
                        if (message.toolCall && config.onFunctionCall) {
                            setState('thinking');
                            const responses = [];
                            for (const fc of message.toolCall.functionCalls) {
                                try {
                                    const result = await config.onFunctionCall(fc);
                                    responses.push({
                                        id: fc.id,
                                        name: fc.name,
                                        response: { result: JSON.stringify(result) }
                                    });
                                } catch (e: any) {
                                    responses.push({
                                        id: fc.id,
                                        name: fc.name,
                                        response: { error: e.message }
                                    });
                                }
                            }
                            
                            livePromise.then(session => {
                                session?.sendToolResponse({ functionResponses: responses });
                            });
                            setState('speaking'); 
                        }

                        // Handle Transcriptions
                        if (message.serverContent?.inputTranscription) {
                            const { text } = message.serverContent.inputTranscription;
                            if (text) {
                                setTranscript(prev => {
                                    const last = prev[prev.length - 1];
                                    if (last?.source === 'user' && !last.isFinal) {
                                        return [...prev.slice(0, -1), { source: 'user', text: last.text + text, isFinal: false, speakerName: config.authenticatedUser.name }];
                                    }
                                    return [...prev, { source: 'user', text, isFinal: false, speakerName: config.authenticatedUser.name }];
                                });
                            }
                        } else if (message.serverContent?.outputTranscription) {
                            setState('speaking'); 
                            const { text } = message.serverContent.outputTranscription;
                            if (text) {
                                setTranscript(prev => {
                                    const last = prev[prev.length - 1];
                                    if (last?.source === 'devinci' && !last.isFinal) {
                                        return [...prev.slice(0, -1), { source: 'devinci', text: last.text + text, isFinal: false }];
                                    }
                                    return [...prev, { source: 'devinci', text, isFinal: false }];
                                });
                            }
                        }

                        if (message.serverContent?.turnComplete) {
                            setTranscript(prev => prev.map(t => ({ ...t, isFinal: true })));
                            setState('listening');
                        }

                        // Handle Audio Output
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const outputCtx = audioRefs.current.outputAudioContext!;
                            
                            // Ensure time creates a smooth queue
                            if (audioRefs.current.nextStartTime < outputCtx.currentTime) {
                                audioRefs.current.nextStartTime = outputCtx.currentTime;
                            }

                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const sourceNode = outputCtx.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            
                            sourceNode.connect(outputCtx.destination);
                            
                            sourceNode.addEventListener('ended', () => audioRefs.current.sources.delete(sourceNode));
                            sourceNode.start(audioRefs.current.nextStartTime);
                            
                            audioRefs.current.nextStartTime += audioBuffer.duration;
                            audioRefs.current.sources.add(sourceNode);
                        }
                    },
                    onerror: (e: any) => {
                        console.error('Gemini Session Error:', e);
                        setTranscript(prev => [...prev, { source: 'devinci', text: "[Signal Lost]", isFinal: true }]);
                        setState('error');
                    },
                    onclose: () => {
                        console.log("DeVinci: Connection Closed");
                        setState('idle');
                    },
                },
            });
            sessionPromise.current = livePromise;
        } catch (e) {
            console.error("Connection Failed:", e);
            setState('error');
        }
    }, [stopConversation]);

    // Send File Logic (Images/PDFs)
    const sendFile = useCallback(async (file: File) => {
        if (!sessionPromise.current) return;
        setAnalyzableFile(file);
        
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
            });
            
            const session = await sessionPromise.current;
            session.sendRealtimeInput({
                media: { data: base64, mimeType: file.type }
            });
            
            setTranscript(prev => [...prev, { source: 'user', text: `[Uploaded: ${file.name}]`, isFinal: true, speakerName: 'Operator' }]);
        } catch (e) {
            console.error("File upload failed", e);
        }
    }, []);

    const sendImageRegion = useCallback(async (croppedFile: File, originalFileName: string) => {
        if (!sessionPromise.current) return;
        
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(croppedFile);
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
            });

            const session = await sessionPromise.current;
            session.sendRealtimeInput({
                media: { data: base64, mimeType: croppedFile.type }
            });
            setTranscript(prev => [...prev, { source: 'user', text: `[Focus Region: ${originalFileName}]`, isFinal: true, speakerName: 'Operator' }]);
        } catch (e) {
            console.error("Region upload failed", e);
        }
    }, []);

    const simulateNewSpeaker = useCallback(() => {
        if (sessionPromise.current) {
            sessionPromise.current.then(session => {
                session.sendRealtimeInput({
                    media: { mimeType: "text/plain", data: btoa("A new speaker has joined the conversation. Please acknowledge them.") }
                });
            });
        }
    }, []);

    const manualRetry = useCallback(() => {
        setRetryCount(prev => prev + 1);
        if (lastConfig.current) {
            startConversation(lastConfig.current);
        }
    }, [startConversation]);
    
    return { 
        state, 
        transcript, 
        startConversation, 
        stopConversation, 
        pauseConversation: () => {}, 
        resumeConversation: () => {}, 
        retryCount,
        sendFile,
        analyzableFile,
        sendImageRegion,
        simulateNewSpeaker,
        manualRetry
    };
};
