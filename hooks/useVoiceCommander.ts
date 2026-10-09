
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { VoiceCommanderState } from '../types';
import { 
    showSectionFunctionDeclaration, 
    downloadDrawingsFunctionDeclaration, 
    generateVideoFunctionDeclaration,
    switchAppViewFunctionDeclaration,
    toggleDocumentationFunctionDeclaration,
    engageAnalysisFunctionDeclaration,
    createProjectFunctionDeclaration,
    analyze_fileFunctionDeclaration,
    triggerFullAnalysisFunctionDeclaration
} from '../services/geminiService';

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
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

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

interface VoiceCommanderCallbacks {
    onNavigate: (sectionId: string) => void;
    onDownloadDrawings: () => string;
    onGenerateVideo: (prompt: string, useUploadedImage: boolean) => string;
    onSwitchView: (view: any) => void;
    onToggleDoc: (type: 'manual' | 'technical', open: boolean) => void;
    onEngageAnalysis: (factionId?: string, promptOverride?: string) => string;
    onCreateProject: (args: { name: string, description: string, tags?: string[], factionId: any }) => string;
    onAnalyzeFile: (fileName: string, workflow: string) => string;
    getAppState: () => {
        projectName: string;
        prompt: string;
        selectedFactionId: string | null;
        files: { name: string, type: string }[];
    };
}

export const useVoiceCommander = ({ 
    onNavigate, 
    onDownloadDrawings, 
    onGenerateVideo,
    onSwitchView,
    onToggleDoc,
    onEngageAnalysis,
    onCreateProject,
    onAnalyzeFile,
    getAppState
}: VoiceCommanderCallbacks) => {
    const [state, setState] = useState<VoiceCommanderState>('idle');
    const sessionPromise = useRef<Promise<any> | null>(null);
    const audioRefs = useRef<{
        inputAudioContext?: AudioContext,
        outputAudioContext?: AudioContext,
        scriptProcessor?: ScriptProcessorNode,
        mediaStream?: MediaStream,
        source?: MediaStreamAudioSourceNode,
        nextStartTime: number,
        sources: Set<AudioBufferSourceNode>
    }>({ nextStartTime: 0, sources: new Set() });
    
    const callbacksRef = useRef({ onNavigate, onDownloadDrawings, onGenerateVideo, onSwitchView, onToggleDoc, onEngageAnalysis, onCreateProject, onAnalyzeFile, getAppState });
    
    useEffect(() => {
        callbacksRef.current = { onNavigate, onDownloadDrawings, onGenerateVideo, onSwitchView, onToggleDoc, onEngageAnalysis, onCreateProject, onAnalyzeFile, getAppState };
    }, [onNavigate, onDownloadDrawings, onGenerateVideo, onSwitchView, onToggleDoc, onEngageAnalysis, onCreateProject, onAnalyzeFile, getAppState]);

    const stopListening = useCallback(() => {
        audioRefs.current.mediaStream?.getTracks().forEach(track => track.stop());
        if (audioRefs.current.scriptProcessor) {
            try { audioRefs.current.scriptProcessor.disconnect(); } catch (e) { }
        }
        if (audioRefs.current.source) {
            try { audioRefs.current.source.disconnect(); } catch (e) { }
        }

        if (sessionPromise.current) {
            sessionPromise.current.then(session => session?.close());
            sessionPromise.current = null;
        }
        
        audioRefs.current.sources.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        audioRefs.current.sources.clear();
        
        const inputCtx = audioRefs.current.inputAudioContext;
        if (inputCtx) {
            try {
                if (inputCtx.state !== 'closed') {
                    inputCtx.close().catch(e => console.warn("Safe close inputCtx:", e));
                }
            } catch (e) {
                console.warn("Error closing input audio context:", e);
            }
        }
        audioRefs.current.inputAudioContext = undefined;

        const outputCtx = audioRefs.current.outputAudioContext;
        if (outputCtx) {
            try {
                if (outputCtx.state !== 'closed') {
                    outputCtx.close().catch(e => console.warn("Safe close outputCtx:", e));
                }
            } catch (e) {
                console.warn("Error closing output audio context:", e);
            }
        }
        audioRefs.current.outputAudioContext = undefined;
        
        setState('idle');
    }, []);

    const startListening = useCallback(async () => {
        if (state !== 'idle' && state !== 'error') return;

        setState('listening');
        audioRefs.current = { nextStartTime: 0, sources: new Set() };

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        try {
            audioRefs.current.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            console.error('Microphone access denied:', err);
            setState('error');
            return;
        }

        audioRefs.current.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioRefs.current.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const outputNode = audioRefs.current.outputAudioContext.createGain();
        outputNode.connect(audioRefs.current.outputAudioContext.destination);

        const currentAppState = callbacksRef.current.getAppState();
        const systemInstruction = `You are the SynapseForge Voice Assistant. 
You help users navigate a reverse engineering foundry.

### CURRENT WORKSPACE STATE
Project Name: ${currentAppState.projectName || 'None'}
Lens: ${currentAppState.selectedFactionId || 'None'}
Description: ${currentAppState.prompt || 'None'}
Uploaded Files: ${currentAppState.files.length > 0 ? currentAppState.files.map(f => `"${f.name}" (${f.type})`).join(', ') : 'None'}

### VOICE WORKFLOWS
1. CORE ANALYSIS: Triggered by 'trigger_full_analysis'. You MUST clarify the lens (Advanced Materials, Pragmatic Production, or Systems & Automation) if not set.
2. FILE INTAKE: Triggered by 'analyze_file'. You MUST clarify WHICH file if multiple are uploaded, and the intended synthesis protocol (e.g. IMAGE_SYNTHESIS for photos, TECHNICAL_INTAKE for PDFs).
3. NAVIGATION: Use 'show_section' or 'switch_app_view'.
4. CREATION: Use 'create_project' for natural language concept starts.

Be professional, concise, and proactive. If information is ambiguous, ask the user for clarification before executing a tool.`;

        const livePromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025', 
            config: {
                // FIX: Using Modality.AUDIO enum instead of raw string
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                systemInstruction,
                tools: [{ 
                    functionDeclarations: [
                        showSectionFunctionDeclaration, 
                        downloadDrawingsFunctionDeclaration, 
                        generateVideoFunctionDeclaration,
                        switchAppViewFunctionDeclaration,
                        toggleDocumentationFunctionDeclaration,
                        engageAnalysisFunctionDeclaration,
                        createProjectFunctionDeclaration,
                        analyze_fileFunctionDeclaration,
                        triggerFullAnalysisFunctionDeclaration
                    ] 
                }],
            },
            callbacks: {
                onopen: () => {
                    const inputCtx = audioRefs.current.inputAudioContext!;
                    const stream = audioRefs.current.mediaStream!;
                    audioRefs.current.source = inputCtx.createMediaStreamSource(stream);
                    const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                    audioRefs.current.scriptProcessor = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        livePromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    audioRefs.current.source.connect(scriptProcessor);
                    scriptProcessor.connect(inputCtx.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.toolCall) {
                        setState('thinking');
                        for (const fc of message.toolCall.functionCalls) {
                            let responseResult = 'ok';
                            const { onNavigate, onDownloadDrawings, onGenerateVideo, onSwitchView, onToggleDoc, onEngageAnalysis, onCreateProject, onAnalyzeFile } = callbacksRef.current;
                            
                            if (fc.name === 'show_section' && fc.args.sectionId) {
                                onNavigate(fc.args.sectionId);
                                responseResult = 'Navigating to section.';
                            } else if (fc.name === 'download_drawings') {
                                responseResult = onDownloadDrawings();
                            } else if (fc.name === 'generate_video' && fc.args.prompt) {
                                responseResult = onGenerateVideo(fc.args.prompt, fc.args.useUploadedImage || false);
                            } else if (fc.name === 'switch_app_view' && fc.args.view) {
                                onSwitchView(fc.args.view);
                                responseResult = `Switching to ${fc.args.view} view.`;
                            } else if (fc.name === 'toggle_documentation' && fc.args.doc_type) {
                                onToggleDoc(fc.args.doc_type, fc.args.open !== undefined ? fc.args.open : true);
                                responseResult = `${fc.args.open === false ? 'Closing' : 'Opening'} ${fc.args.doc_type} documentation.`;
                            } else if (fc.name === 'engage_analysis' || fc.name === 'trigger_full_analysis') {
                                responseResult = onEngageAnalysis(fc.args.useFactionId as string, fc.args.descriptionOverride as string);
                            } else if (fc.name === 'create_project') {
                                responseResult = onCreateProject(fc.args as any);
                            } else if (fc.name === 'analyze_file') {
                                responseResult = onAnalyzeFile(fc.args.fileName as string, fc.args.workflow as string);
                            }
                            
                            livePromise.then(session => {
                                session.sendToolResponse({
                                    functionResponses: { id: fc.id, name: fc.name, response: { result: responseResult } }
                                });
                            });
                        }
                    }
                    if (message.serverContent?.turnComplete) {
                        setState('listening');
                    }
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        const outputCtx = audioRefs.current.outputAudioContext!;
                        audioRefs.current.nextStartTime = Math.max(audioRefs.current.nextStartTime, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                        const sourceNode = outputCtx.createBufferSource();
                        sourceNode.buffer = audioBuffer;
                        sourceNode.connect(outputNode);
                        sourceNode.addEventListener('ended', () => audioRefs.current.sources.delete(sourceNode));
                        sourceNode.start(audioRefs.current.nextStartTime);
                        audioRefs.current.nextStartTime += audioBuffer.duration;
                        audioRefs.current.sources.add(sourceNode);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Voice Commander Error:', e);
                    setState('error');
                    stopListening();
                },
                onclose: (e: CloseEvent) => {
                     if (state !== 'error') {
                        setState('idle');
                     }
                },
            },
        });
        sessionPromise.current = livePromise;
    }, [state, stopListening]);

    useEffect(() => {
        return () => {
            stopListening();
        }
    }, [stopListening]);

    return { state, startListening, stopListening };
};
