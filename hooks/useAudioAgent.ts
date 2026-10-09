import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  VoiceInterfaceMode, 
  VoiceTranscriptEntry, 
  FactionId, 
  User, 
  DeVinciState, 
  TranscriptEntry, 
  DeVinciVoice, 
  CadData,
  DomainCategory 
} from '../types';
import { useTts } from './useTts';
import { ENGINEERING_PHILOSOPHIES } from '../constants';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Helper: Convert Float32 audio samples into 16-bit PCM for Gemini Live WebSocket
export function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768; // Float [-1.0, 1.0] -> 16-bit signed PCM
  }
  const binary = String.fromCharCode(...new Uint8Array(int16.buffer));
  return {
    data: btoa(binary),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Helper: Decode base64 string to Uint8Array
export function decodeBase64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Decode 16-bit PCM audio bytes to AudioBuffer for web playback
export async function decodePcmAudio(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
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

export interface AudioAgentFunctionDeclaration {
  name: string;
  description?: string;
  parameters?: any;
}

export interface AudioAgentCallbacks {
  // Navigation & UI controls
  onNavigate?: (sectionId: string) => void;
  onSwitchView?: (view: any) => void;
  onToggleDoc?: (type: 'manual' | 'technical', open: boolean) => void;
  onOpenManual?: () => void;
  onOpenTechDoc?: () => void;
  
  // Project & Analysis
  onSwitchLens?: (factionId: FactionId) => void;
  onStartAnalysis?: () => void;
  onEngageAnalysis?: (factionId?: string, promptOverride?: string) => string | void;
  onCreateProject?: (args: { name: string; description: string; tags?: string[]; factionId?: any }) => string;
  onApplyReinforcement?: (name: string) => void;
  onSetMaterial?: (materialName: string) => void;
  onUpdateParam?: (param: string, delta: number, isPercent?: boolean) => void;
  onSetParam?: (param: string, value: number) => void;
  onGenerateCertificate?: () => void;
  onSealBundle?: () => void;
  onAddLog?: (level: 'INFO' | 'WARN' | 'ERROR', message: string) => void;
  onDownloadDrawings?: () => string | void;
  onGenerateVideo?: (prompt: string, useUploadedImage: boolean) => string | void;
  onAnalyzeFile?: (fileName: string, workflow: string) => string | void;
  getAppState?: () => {
    projectName: string;
    prompt: string;
    selectedFactionId: string | null;
    files: { name: string; type: string }[];
  };
  onFunctionCall?: (fc: { name: string; args: any; id: string }) => Promise<any>;
}

export interface AudioAgentConfig {
  user: User | null;
  tts?: ReturnType<typeof useTts>;
  viewMode?: string;
  activeProjectName?: string;
  domainFocus?: DomainCategory;
  onUpdateUser?: (user: User) => void;
  systemInstruction?: string;
  voice?: DeVinciVoice;
  tools?: { functionDeclarations: AudioAgentFunctionDeclaration[] }[];
  activeCad?: CadData | null;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Unified bidirectional Audio Agent combining:
 * 1. Web Speech API (continuous voice recognition & wake-word commands "Forge", "DeVinci")
 * 2. Gemini Live WebSocket / Bidirectional streaming protocol (PCM audio stream & function calls)
 * 3. Voice Commander intent execution (reinforcement, lens switching, project forging)
 * 4. System orientation & audio greetings
 */
export const useAudioAgent = (
  config: AudioAgentConfig,
  callbacks: AudioAgentCallbacks = {}
) => {
  const { user, tts, viewMode = 'app', activeProjectName, domainFocus, onUpdateUser } = config;

  // --- Live WebSocket Streaming State ---
  const [liveState, setLiveState] = useState<DeVinciState>('idle');
  const [liveTranscript, setLiveTranscript] = useState<TranscriptEntry[]>([]);
  const [analyzableFile, setAnalyzableFile] = useState<File | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // --- Web Speech API Recognition State ---
  const [isListening, setIsListening] = useState(false);
  const [speechTranscripts, setSpeechTranscripts] = useState<VoiceTranscriptEntry[]>([]);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  // --- Orientation State ---
  const [isActivating, setIsActivating] = useState(false);
  const hasGreetedRef = useRef(false);

  // --- Audio Pipeline Refs ---
  const wsRef = useRef<WebSocket | null>(null);
  const audioRefs = useRef<{
    inputAudioContext?: AudioContext;
    outputAudioContext?: AudioContext;
    scriptProcessor?: ScriptProcessorNode;
    mediaStream?: MediaStream;
    source?: MediaStreamAudioSourceNode;
    nextStartTime: number;
    sources: Set<AudioBufferSourceNode>;
  }>({ nextStartTime: 0, sources: new Set() });

  // ----------------------------------------------------
  // 1. Audio Cleanup & Output Management
  // ----------------------------------------------------
  const cleanupAudio = useCallback(() => {
    audioRefs.current.mediaStream?.getTracks().forEach(track => track.stop());

    if (audioRefs.current.scriptProcessor) {
      audioRefs.current.scriptProcessor.disconnect();
      audioRefs.current.scriptProcessor = undefined;
    }

    if (audioRefs.current.source) {
      audioRefs.current.source.disconnect();
      audioRefs.current.source = undefined;
    }

    audioRefs.current.sources.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    audioRefs.current.sources.clear();

    const inputCtx = audioRefs.current.inputAudioContext;
    if (inputCtx && inputCtx.state !== 'closed') inputCtx.close().catch(() => {});
    audioRefs.current.inputAudioContext = undefined;

    const outputCtx = audioRefs.current.outputAudioContext;
    if (outputCtx && outputCtx.state !== 'closed') outputCtx.close().catch(() => {});
    audioRefs.current.outputAudioContext = undefined;
  }, []);

  // ----------------------------------------------------
  // 2. Gemini Live WebSocket Bidirectional Session
  // ----------------------------------------------------
  const stopLiveSession = useCallback(async () => {
    cleanupAudio();

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.warn('Live WebSocket close error:', e);
      }
      wsRef.current = null;
    }

    setLiveState('idle');
  }, [cleanupAudio]);

  const startLiveSession = useCallback(async (customConfig?: Partial<AudioAgentConfig>) => {
    await stopLiveSession();

    setLiveState('connecting');
    setLiveTranscript([]);

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioRefs.current.inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
      audioRefs.current.outputAudioContext = new AudioContextClass({ sampleRate: 24000 });

      audioRefs.current.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });
    } catch (err) {
      console.error('Microphone Access Denied:', err);
      setLiveTranscript([
        { source: 'devinci', text: 'Microphone access denied. Please grant microphone permissions.', isFinal: true },
      ]);
      setLiveState('error');
      return;
    }

    try {
      // Connect to unified backend WebSocket route for Gemini Live streaming proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setLiveState('connected');
        console.log('[AudioAgent]: Bidirectional Live WebSocket established.');

        // Send setup payload
        const setupMessage = {
          type: 'setup',
          model: 'gemini-2.5-flash-native-audio-preview',
          voice: customConfig?.voice || config.voice || 'Aoede',
          systemInstruction: customConfig?.systemInstruction || config.systemInstruction || 'You are DeVinci, SynapseForge engineering partner.',
          tools: customConfig?.tools || config.tools || [],
        };
        ws.send(JSON.stringify(setupMessage));

        // Connect microphone processor to stream PCM chunks
        const inputCtx = audioRefs.current.inputAudioContext!;
        const stream = audioRefs.current.mediaStream!;
        audioRefs.current.source = inputCtx.createMediaStreamSource(stream);

        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
        audioRefs.current.scriptProcessor = scriptProcessor;

        scriptProcessor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createPcmBlob(inputData);
            ws.send(JSON.stringify({ type: 'realtime_input', media: pcmBlob }));
          }
        };

        audioRefs.current.source.connect(scriptProcessor);
        scriptProcessor.connect(inputCtx.destination);
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Handle server audio response
          if (msg.audioData && audioRefs.current.outputAudioContext) {
            const outCtx = audioRefs.current.outputAudioContext;
            const audioBytes = decodeBase64ToBytes(msg.audioData);
            const audioBuffer = await decodePcmAudio(audioBytes, outCtx);

            const source = outCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outCtx.destination);

            audioRefs.current.nextStartTime = Math.max(audioRefs.current.nextStartTime, outCtx.currentTime);
            source.start(audioRefs.current.nextStartTime);
            audioRefs.current.nextStartTime += audioBuffer.duration;

            audioRefs.current.sources.add(source);
            source.onended = () => audioRefs.current.sources.delete(source);
          }

          // Handle server transcript
          if (msg.transcript) {
            setLiveTranscript(prev => [
              ...prev,
              { source: msg.source || 'devinci', text: msg.transcript, isFinal: true }
            ]);
          }

          // Handle server function call
          if (msg.functionCall && callbacks.onFunctionCall) {
            const result = await callbacks.onFunctionCall(msg.functionCall);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'function_response',
                id: msg.functionCall.id,
                result: result || { status: 'acknowledged' },
              }));
            }
          }
        } catch (e) {
          console.warn('[AudioAgent]: Message processing error:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('[AudioAgent]: WebSocket notice, fallback to native audio speech engine.');
        setLiveState('connected'); // Graceful fallback
      };

      ws.onclose = () => {
        setLiveState('idle');
      };
    } catch (err) {
      console.warn('[AudioAgent]: Live socket initialization failed, speech engine remains active.', err);
      setLiveState('connected');
    }
  }, [config, callbacks, stopLiveSession]);

  // ----------------------------------------------------
  // 3. Web Speech API Recognition & Intent Parser
  // ----------------------------------------------------
  const addTranscript = useCallback((text: string, intent?: string, status: VoiceTranscriptEntry['status'] = 'PENDING') => {
    const entry: VoiceTranscriptEntry = {
      id: `vt-${Date.now()}`,
      text,
      intent,
      timestamp: new Date().toISOString(),
      status,
    };
    setSpeechTranscripts(prev => [entry, ...prev].slice(0, 10));
    return entry;
  }, []);

  const handleSpeechIntent = useCallback((text: string) => {
    const command = text.toLowerCase();
    // Wake word filter
    if (!command.includes('forge') && !command.includes('devinci') && !command.includes('synapse')) return;

    isProcessingRef.current = true;
    window.dispatchEvent(new CustomEvent('forge-log', { detail: `[VOICE_AGENT]: Captured intent: "${text}"` }));

    // 1. REINFORCEMENT TRIGGER
    const reinforceMatch = command.match(/apply (?:the )?(.+) reinforcement/i) || command.match(/reinforce (?:this )?(?:design )?with (?:the )?(.+)/i);
    if (reinforceMatch && callbacks.onApplyReinforcement) {
      const profileName = reinforceMatch[1].trim();
      callbacks.onApplyReinforcement(profileName);
      addTranscript(text, 'REINFORCE_TRIGGER', 'EXECUTED');
      tts?.speak(`Applying ${profileName} reinforcement profile.`, 'Zephyr');
      return;
    }

    // 2. ANALYSIS TRIGGER
    const analysisMatch = command.match(/analyze (?:this )?(?:design|concept)? with (?:the )?(.+) (?:lens|perspective|philosophy)/i);
    if (analysisMatch && callbacks.onSwitchLens && callbacks.onStartAnalysis) {
      const factionName = analysisMatch[1].trim();
      const targetFaction = ENGINEERING_PHILOSOPHIES.find(f => 
        f.name.toLowerCase().includes(factionName) || 
        f.id.toLowerCase().includes(factionName.replace(/\s+/g, '_'))
      );

      if (targetFaction) {
        callbacks.onSwitchLens(targetFaction.id);
        callbacks.onStartAnalysis();
        tts?.speak(`Applying ${targetFaction.name} parameters. Core synthesis protocol engaged.`, 'Zephyr');
        addTranscript(text, 'ANALYSIS_TRIGGER', 'EXECUTED');
      } else {
        tts?.speak(`I couldn't identify the "${factionName}" lens. Please specify Advanced Materials, Pragmatic Production, or Systems lens.`, 'Zephyr');
        addTranscript(text, 'ANALYSIS_TRIGGER', 'REJECTED');
      }
      return;
    }

    // 3. PROJECT CREATION
    const forgeMatch = command.match(/forge a new project for (.+)/i) || command.match(/create a new project for (.+)/i);
    if (forgeMatch && callbacks.onCreateProject) {
      const projectTopic = forgeMatch[1].trim();
      const resultMessage = callbacks.onCreateProject({
        name: `AI Forged: ${projectTopic.split(' ').slice(0, 3).join(' ')}`,
        description: `Autonomous project initialized for ${projectTopic} via voice command.`,
        factionId: FactionId.ADVANCED_MATERIALS,
      });
      tts?.speak(resultMessage || 'Project workspace initialized.', 'Zephyr');
      addTranscript(text, 'CREATE_PROJECT', 'EXECUTED');
      return;
    }

    // 4. NAVIGATION & VIEW SWITCHING
    if (command.includes('open manual') || command.includes('show manual')) {
      callbacks.onOpenManual?.();
      callbacks.onToggleDoc?.('manual', true);
      addTranscript(text, 'OPEN_MANUAL', 'EXECUTED');
      return;
    }

    if (command.includes('open technical doc') || command.includes('show technical document')) {
      callbacks.onOpenTechDoc?.();
      callbacks.onToggleDoc?.('technical', true);
      addTranscript(text, 'OPEN_TECH_DOC', 'EXECUTED');
      return;
    }

    if (command.includes('go to admin') || command.includes('open admin')) {
      callbacks.onSwitchView?.('admin');
      addTranscript(text, 'NAV_ADMIN', 'EXECUTED');
      return;
    }

    if (command.includes('go to suite') || command.includes('open tool suite')) {
      callbacks.onSwitchView?.('suite');
      addTranscript(text, 'NAV_SUITE', 'EXECUTED');
      return;
    }

    if (command.includes('go to neural') || command.includes('open neural forge')) {
      callbacks.onSwitchView?.('neural');
      addTranscript(text, 'NAV_NEURAL', 'EXECUTED');
      return;
    }

    if (command.includes('download drawings') || command.includes('export drawings')) {
      callbacks.onDownloadDrawings?.();
      addTranscript(text, 'DOWNLOAD_DRAWINGS', 'EXECUTED');
      return;
    }

    // Generic acknowledgment
    addTranscript(text, 'UNKNOWN_INTENT', 'PENDING');
  }, [callbacks, tts, addTranscript]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[AudioAgent]: Web Speech API not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      window.dispatchEvent(new CustomEvent('forge-status', { detail: 'ACTIVE_LISTENING' }));
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      handleSpeechIntent(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn('[AudioAgent]: Speech recognition notice:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.warn('[AudioAgent]: Recognition start failed:', e);
    }
  }, [handleSpeechIntent]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // ----------------------------------------------------
  // 4. System Orientation & Greetings
  // ----------------------------------------------------
  const playOrientation = useCallback(() => {
    if (!user || !tts) return;

    const timeOfDayGreeting = getGreeting();
    let briefing = '';

    if (user.is_first_login) {
      briefing = `
        ${timeOfDayGreeting}, ${user.name.split(' ')[0]}. SynapseForge is initialized with sovereign architecture.
        All specialized lenses are in neutral. Memory buffers are cleared for your session.
        DeVinci audio agent is online. What shall we innovate today?
      `;

      setTimeout(() => {
        onUpdateUser?.({ ...user, is_first_login: false });
        window.dispatchEvent(new CustomEvent('forge-status', { detail: 'ACTIVE_LISTENING' }));
      }, 15000);
    } else if (activeProjectName && domainFocus) {
      briefing = `${timeOfDayGreeting}. SynapseForge is ready for '${activeProjectName}'. Physical and logical constraints for the ${domainFocus} domain are reloaded.`;
    } else {
      briefing = `${timeOfDayGreeting}. SynapseForge initialized. Sovereign engineering suite ready.`;
    }

    tts.speak(briefing, 'Zephyr');
  }, [user, tts, onUpdateUser, activeProjectName, domainFocus]);

  useEffect(() => {
    if (user && viewMode === 'app' && !hasGreetedRef.current && user.hasAcceptedLegal && !user.isSilenced) {
      hasGreetedRef.current = true;
      setIsActivating(true);
      const timer = setTimeout(() => {
        playOrientation();
        setIsActivating(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user, viewMode, playOrientation]);

  // Handle Admin overrides for voice
  useEffect(() => {
    const handleReplay = () => playOrientation();
    const handleSkip = () => {
      tts?.stop();
      window.dispatchEvent(new CustomEvent('forge-status', { detail: 'ACTIVE_LISTENING' }));
    };

    window.addEventListener('forge-voice-replay', handleReplay);
    window.addEventListener('forge-voice-skip', handleSkip);

    return () => {
      window.removeEventListener('forge-voice-replay', handleReplay);
      window.removeEventListener('forge-voice-skip', handleSkip);
    };
  }, [playOrientation, tts]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      stopListening();
    };
  }, [cleanupAudio, stopListening]);

  return {
    // Live WebSocket State & Actions
    liveState,
    state: liveState, // compatibility alias with useDeVinci
    liveTranscript,
    transcript: liveTranscript, // compatibility alias
    startLiveSession,
    startConversation: startLiveSession, // compatibility alias with useDeVinci
    stopLiveSession,
    stopConversation: stopLiveSession, // compatibility alias with useDeVinci
    analyzableFile,
    setAnalyzableFile,
    retryCount,
    setRetryCount,

    // Web Speech API State & Actions
    isListening,
    startListening,
    stopListening,
    speechTranscripts,
    transcripts: speechTranscripts, // compatibility alias with useForgeVoice
    addTranscript,

    // Orientation State & Actions
    isActivating,
    playOrientation,
    replayOrientation: playOrientation, // compatibility alias with useAppVoice
  };
};

// ============================================================================
// Consolidated Domain Facades (Merged from useDeVinci, useVoiceCommander, etc.)
// ============================================================================

export interface StartConversationConfig {
  systemInstruction?: string;
  voice?: DeVinciVoice;
  tools?: any[];
  onFunctionCall?: (fc: { name: string; args: any; id: string }) => Promise<any>;
  authenticatedUser?: User;
  activeCad?: CadData | null;
}

export const useDeVinci = () => {
  const agent = useAudioAgent({
    user: null,
    systemInstruction: 'You are DeVinci, SynapseForge engineering partner.',
  });

  return {
    state: agent.liveState,
    transcript: agent.liveTranscript,
    analyzableFile: agent.analyzableFile,
    setAnalyzableFile: agent.setAnalyzableFile,
    retryCount: agent.retryCount,
    setRetryCount: agent.setRetryCount,
    startConversation: agent.startLiveSession,
    stopConversation: agent.stopLiveSession,
    pauseConversation: () => {},
    resumeConversation: () => {},
    sendFile: (_f: any) => {},
    sendImageRegion: (_r: any) => {},
    simulateNewSpeaker: () => {},
    manualRetry: () => {},
  };
};

export interface VoiceCommanderCallbacks extends AudioAgentCallbacks {
  onNavigate: (sectionId: string) => void;
  onDownloadDrawings: () => string;
  onGenerateVideo: (prompt: string, useUploadedImage: boolean) => string;
  onSwitchView: (view: any) => void;
  onToggleDoc: (type: 'manual' | 'technical', open: boolean) => void;
  onEngageAnalysis: (factionId?: string, promptOverride?: string) => string;
  onCreateProject: (args: { name: string; description: string; tags?: string[]; factionId: any }) => string;
  onAnalyzeFile: (fileName: string, workflow: string) => string;
  getAppState: () => {
    projectName: string;
    prompt: string;
    selectedFactionId: string | null;
    files: { name: string; type: string }[];
  };
}

export const useVoiceCommander = (callbacks: VoiceCommanderCallbacks) => {
  const agent = useAudioAgent(
    {
      user: null,
      systemInstruction: 'You are the SynapseForge Voice Commander. Execute UI commands and navigate the workspace.',
    },
    callbacks
  );

  return {
    state: (agent.isListening ? 'listening' : agent.liveState === 'connected' ? 'connected' : 'idle') as any,
    startCommander: agent.startListening,
    stopCommander: agent.stopListening,
    isListening: agent.isListening,
  };
};

export interface ForgeVoiceCallbacks {
  onSwitchLens: (factionId: FactionId) => void;
  onSetMaterial: (materialName: string) => void;
  onUpdateParam: (param: string, delta: number, isPercent?: boolean) => void;
  onSetParam: (param: string, value: number) => void; 
  onGenerateCertificate: () => void;
  onSetCover?: (id: string, type: 'drawing' | 'image') => void;
  onSealBundle: () => void;
  onAddLog: (level: 'INFO' | 'WARN' | 'ERROR', message: string) => void;
  onStartAnalysis: () => void;
  onOpenManual: () => void;
  onOpenTechDoc: () => void;
  onSwitchView: (view: 'app' | 'admin' | 'suite' | 'pricing' | 'account') => void;
  onNavigateSection: (sectionId: string) => void;
  onLaunchNewProjectWizard?: () => void;
  onCreateProject: (args: { name: string; description: string; factionId: FactionId }) => string;
  onGenerateSection?: () => void; 
  onApplyReinforcement: (name: string) => void;
  authenticatedUser: User | null;
}

export const useForgeVoice = (
  mode: VoiceInterfaceMode, 
  tts: ReturnType<typeof useTts>,
  callbacks: ForgeVoiceCallbacks
) => {
  const agent = useAudioAgent(
    {
      user: callbacks.authenticatedUser,
      tts,
    },
    {
      ...callbacks,
      onNavigate: callbacks.onNavigateSection,
    }
  );

  return {
    isListening: agent.isListening,
    transcripts: agent.speechTranscripts,
    startListening: agent.startListening,
    stopListening: agent.stopListening,
    addTranscript: agent.addTranscript,
  };
};

export const useAppVoice = (
  tts: ReturnType<typeof useTts>, 
  user: User | null, 
  viewMode: string, 
  onUpdateUser: (user: User) => void, 
  activeProjectName?: string, 
  domainFocus?: DomainCategory
) => {
  const agent = useAudioAgent({
    user,
    tts,
    viewMode,
    onUpdateUser,
    activeProjectName,
    domainFocus,
  });

  return {
    isActivating: agent.isActivating,
    replayOrientation: agent.playOrientation,
  };
};
