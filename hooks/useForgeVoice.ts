
import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceInterfaceMode, VoiceTranscriptEntry, FactionId, User } from '../types';
import { useTts } from './useTts';
import { ENGINEERING_PHILOSOPHIES } from '../constants';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface ForgeVoiceCallbacks {
    onSwitchLens: (factionId: FactionId) => void;
    onSetMaterial: (materialName: string) => void;
    onUpdateParam: (param: string, delta: number, isPercent?: boolean) => void;
    onSetParam: (param: string, value: number) => void; 
    onGenerateCertificate: () => void;
    onSetCover: (id: string, type: 'drawing' | 'image') => void;
    onSealBundle: () => void;
    onAddLog: (level: 'INFO' | 'WARN' | 'ERROR', message: string) => void;
    onStartAnalysis: () => void;
    onOpenManual: () => void;
    onOpenTechDoc: () => void;
    onSwitchView: (view: 'app' | 'admin' | 'suite' | 'pricing' | 'account') => void;
    onNavigateSection: (sectionId: string) => void;
    onLaunchNewProjectWizard: () => void;
    onCreateProject: (args: { name: string, description: string, factionId: FactionId }) => string;
    onGenerateSection: () => void; 
    onApplyReinforcement: (name: string) => void;
    authenticatedUser: User | null;
}

export const useForgeVoice = (
    mode: VoiceInterfaceMode, 
    tts: ReturnType<typeof useTts>,
    callbacks: ForgeVoiceCallbacks
) => {
    const [isListening, setIsListening] = useState(false);
    const [transcripts, setTranscripts] = useState<VoiceTranscriptEntry[]>([]);
    const recognitionRef = useRef<any>(null);
    const isProcessingRef = useRef(false);

    const addTranscript = (text: string, intent?: string, status: VoiceTranscriptEntry['status'] = 'PENDING') => {
        const entry: VoiceTranscriptEntry = {
            id: `vt-${Date.now()}`,
            text,
            intent,
            timestamp: new Date().toISOString(),
            status
        };
        setTranscripts(prev => [entry, ...prev].slice(0, 10));
        return entry;
    };

    const handleIntent = useCallback((text: string) => {
        const command = text.toLowerCase();
        // Wake word requirement: "Forge"
        if (!command.includes("forge")) return;

        isProcessingRef.current = true;
        window.dispatchEvent(new CustomEvent('forge-log', { detail: `[VOICE_HUD]: Captured intent: "${text}"` }));

        // 1. REINFORCEMENT TRIGGER
        const reinforceMatch = command.match(/apply (?:the )?(.+) reinforcement/i) || command.match(/reinforce (?:this )?(?:design )?with (?:the )?(.+)/i);
        if (reinforceMatch) {
            const profileName = reinforceMatch[1].trim();
            callbacks.onApplyReinforcement(profileName);
            addTranscript(text, "REINFORCE_TRIGGER", "EXECUTED");
            return;
        }

        // 2. ANALYSIS TRIGGER - Natural Language Faction Selection
        const analysisMatch = command.match(/analyze (?:this )?(?:design|concept)? with (?:the )?(.+) (?:lens|perspective|philosophy)/i);
        if (analysisMatch) {
            const factionName = analysisMatch[1].trim();
            const targetFaction = ENGINEERING_PHILOSOPHIES.find(f => 
                f.name.toLowerCase().includes(factionName) || 
                f.id.toLowerCase().includes(factionName.replace(/\s+/g, '_'))
            );

            if (targetFaction) {
                callbacks.onSwitchLens(targetFaction.id);
                callbacks.onStartAnalysis();
                tts.speak(`Applying ${targetFaction.name} parameters. Core synthesis protocol engaged.`, "Zephyr");
                addTranscript(text, "ANALYSIS_TRIGGER", "EXECUTED");
            } else {
                tts.speak(`I couldn't identify the "${factionName}" lens. Please specify Advanced Materials, Pragmatic Production, or Systems lens.`, "Zephyr");
                addTranscript(text, "ANALYSIS_TRIGGER", "REJECTED");
            }
            return;
        }

        // 3. PROJECT CREATION
        const forgeMatch = command.match(/forge a new project for (.+)/i) || command.match(/create a new project for (.+)/i);
        if (forgeMatch) {
            const projectTopic = forgeMatch[1].trim();
            const resultMessage = callbacks.onCreateProject({
                name: `AI Forged: ${projectTopic.split(' ').slice(0, 3).join(' ')}`,
                description: `Autonomous project initialized via voice for: ${projectTopic}`,
                factionId: FactionId.PRAGMATIC_PRODUCTION // Default
            });
            tts.speak(resultMessage, "Zephyr");
            addTranscript(text, "PROJECT_FORGE", "EXECUTED");
            return;
        }

        // 4. PARAMETRIC CONTROL - FOUNDRY (Absolute: "set thickness to 15mm")
        const setParamMatch = command.match(/set (\w+) to ([\d.]+)(?:\s*\w+)?/i);
        if (setParamMatch) {
            const param = setParamMatch[1];
            const value = parseFloat(setParamMatch[2]);
            callbacks.onSetParam(param, value);
            tts.speak(`Setting ${param} to ${value}. Recalculating lattice stress.`, "Zephyr");
            addTranscript(text, "PARAM_SET", "EXECUTED");
            return;
        }

        // 5. PARAMETRIC CONTROL - FOUNDRY (Relative: "increase density by 10%")
        const relativeMatch = command.match(/(increase|decrease|add to|reduce) (\w+) by ([\d.]+)(%)?/i);
        if (relativeMatch) {
            const action = relativeMatch[1].toLowerCase();
            const param = relativeMatch[2];
            const value = parseFloat(relativeMatch[3]);
            const isPercent = !!relativeMatch[4];
            
            const isIncrease = action === 'increase' || action === 'add to';
            const delta = isIncrease ? value : -value;
            
            callbacks.onUpdateParam(param, delta, isPercent);
            
            const effectMsg = isPercent ? `${value} percent` : `${value} units`;
            tts.speak(`${isIncrease ? 'Increasing' : 'Decreasing'} ${param} by ${effectMsg}. Adjusting solver mesh.`, "Zephyr");
            addTranscript(text, "PARAM_ADJUST", "EXECUTED");
            return;
        }

        // 6. Lens Change (Direct)
        if (command.includes("switch to") && (command.includes("lens") || command.includes("philosophy") || command.includes("perspective"))) {
            if (command.includes("advanced") || command.includes("materials")) {
                callbacks.onSwitchLens(FactionId.ADVANCED_MATERIALS);
                tts.speak("Lens switched to Advanced Materials.", "Zephyr");
                addTranscript(text, "LENS_CHANGE", "EXECUTED");
            } else if (command.includes("pragmatic") || command.includes("production")) {
                callbacks.onSwitchLens(FactionId.PRAGMATIC_PRODUCTION);
                tts.speak("Lens switched to Pragmatic Production.", "Zephyr");
                addTranscript(text, "LENS_CHANGE", "EXECUTED");
            } else if (command.includes("systems") || command.includes("automation")) {
                callbacks.onSwitchLens(FactionId.SYSTEMS_AUTOMATION);
                tts.speak("Lens switched to Systems Automation.", "Zephyr");
                addTranscript(text, "LENS_CHANGE", "EXECUTED");
            }
        }
        
        // 7. Navigation & Documents
        else if (command.includes("go to") || command.includes("open") || command.includes("switch to")) {
            if (command.includes("admin") || command.includes("dashboard")) {
                callbacks.onSwitchView('admin');
                tts.speak("Opening Admin Console.", "Zephyr");
                addTranscript(text, "VIEW_NAV", "EXECUTED");
            } else if (command.includes("manual")) {
                callbacks.onOpenManual();
                tts.speak("Opening User Manual.", "Zephyr");
                addTranscript(text, "DOC_OPEN", "EXECUTED");
            } else if (command.includes("workspace")) {
                callbacks.onSwitchView('app');
                tts.speak("Returning to Workspace.", "Zephyr");
                addTranscript(text, "VIEW_NAV", "EXECUTED");
            }
        }

        // 8. Analysis Start (Generic)
        else if (command.includes("start analysis") || command.includes("begin analysis") || command.includes("engage")) {
            callbacks.onStartAnalysis();
            tts.speak("Initiating core synthesis. Calibrating physics mesh.", "Zephyr");
            addTranscript(text, "ANALYSIS_START", "EXECUTED");
        }

        // 9. Visual / CAD Actions
        else if (command.includes("section") || command.includes("slice") || command.includes("cut")) {
            callbacks.onGenerateSection();
            tts.speak("Generating cross-section at assembly centroid.", "Zephyr");
            addTranscript(text, "VISUAL_SECTION", "EXECUTED");
        }
        else {
            addTranscript(text, "UNKNOWN", "REJECTED");
            tts.speak("Voice command not recognized. Check manual for supported intent protocols.", "Zephyr");
        }

        setTimeout(() => { isProcessingRef.current = false; }, 2000);
    }, [callbacks, tts]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
            setIsListening(false);
            if (mode === 'ALWAYS_ON') {
                try {
                    recognition.start();
                } catch(e) {}
            }
        };

        recognition.onresult = (event: any) => {
            const text = event.results[event.results.length - 1][0].transcript;
            handleIntent(text);
        };

        recognitionRef.current = recognition;

        if (mode === 'ALWAYS_ON') {
            recognition.start();
        }

        return () => {
            recognition.stop();
        };
    }, [mode, handleIntent]);

    const toggleManual = () => {
        if (mode === 'MANUAL') {
            if (isListening) recognitionRef.current?.stop();
            else recognitionRef.current?.start();
        }
    };

    return { isListening, transcripts, toggleManual };
};
