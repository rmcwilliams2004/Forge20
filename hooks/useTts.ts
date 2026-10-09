import { useState, useRef, useCallback } from 'react';
import { generateSpeech as performTextToSpeech, parseApiError } from '../services/geminiService';
import { LogEntry } from '../types';

// --- Audio Decoding Utilities (from Live API implementation) ---
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


export const useTts = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [speakingText, setSpeakingText] = useState<string | null>(null);
    const [volume, setVolume] = useState(1.0); // Default to full volume

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    const stop = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.onended = null;
            try { sourceNodeRef.current.stop(); } catch(e) { /* ignore */ }
            sourceNodeRef.current = null;
        }
        
        const ctx = audioContextRef.current;
        if (ctx) {
            try {
                if (ctx.state !== 'closed') {
                    ctx.close().catch(e => console.warn("Safe close TTS context:", e));
                }
            } catch (e) {
                console.warn("Error closing TTS audio context:", e);
            }
        }
        audioContextRef.current = null;
        gainNodeRef.current = null;
        
        setIsPlaying(false);
        setIsLoading(false);
        setSpeakingText(null);
    }, []);

    const speak = useCallback(async (text: string, voice: string = 'Kore') => {
        const wasPlayingThisText = speakingText === text && (isPlaying || isLoading);
        
        if (isPlaying || isLoading) {
            stop();
        }

        if (wasPlayingThisText) {
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));

        setIsLoading(true);
        setError(null);
        setSpeakingText(text);
        addLog('INFO', `TTS generation started with voice: ${voice}.`);

        try {
            const base64Audio = await performTextToSpeech(text, voice);
            
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
            
            // Resume context in case it was suspended by browser policy
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioContextRef.current,
                24000,
                1
            );

            sourceNodeRef.current = audioContextRef.current.createBufferSource();
            sourceNodeRef.current.buffer = audioBuffer;

            // Add GainNode for volume control
            const gainNode = audioContextRef.current.createGain();
            gainNode.gain.value = volume;
            gainNodeRef.current = gainNode;

            sourceNodeRef.current.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            
            sourceNodeRef.current.onended = () => {
                stop();
                addLog('INFO', 'TTS playback finished.');
            };

            setIsLoading(false);
            setIsPlaying(true);
            sourceNodeRef.current.start();
            addLog('INFO', 'TTS playback started.');

        } catch (e) {
            const errorMessage = parseApiError(e);
            setError(errorMessage);
            addLog('ERROR', `TTS failed: ${errorMessage}`);
            stop();
        }

    }, [addLog, isLoading, isPlaying, stop, speakingText, volume]);

    const updateVolume = useCallback((newVolume: number) => {
        setVolume(newVolume);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(newVolume, audioContextRef.current?.currentTime || 0, 0.1);
        }
    }, []);

    return { speak, stop, isLoading, isPlaying, error, speakingText, volume, setVolume: updateVolume };
};
