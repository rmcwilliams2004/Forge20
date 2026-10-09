
import React, { useEffect, useState, useRef } from 'react';
import { DeVinciState, TranscriptEntry, DeVinciVoice, Innovator } from '../types';
import { RoiEditorModal } from './RoiEditorModal';

interface DeVinciModalProps {
  isOpen: boolean;
  onClose: () => void;
  startConversation: () => void;
  stopConversation: () => void;
  pauseConversation: () => void;
  resumeConversation: () => void;
  state: DeVinciState;
  transcript: TranscriptEntry[];
  isCreating?: boolean;
  onFileUpload: (file: File) => void;
  analyzableFile: File | null;
  sendImageRegion: (croppedFile: File, originalFileName: string) => void;
  simulateNewSpeaker: () => void;
  manualRetry: () => void;
  retryCount: number;
  selectedCouncil?: Innovator[];
}

const CouncilHUD = ({ selectedCouncil = [] }: { selectedCouncil?: Innovator[] }) => {
  if (selectedCouncil.length === 0) return null;
  return (
    <div className="flex gap-3 mb-6 bg-black/30 p-4 rounded-3xl border border-gray-800 backdrop-blur-md">
      {selectedCouncil.map((innovator) => (
        <div 
          key={innovator.id} 
          className="group relative flex flex-col items-center animate-fade-in"
        >
          <div className="w-12 h-12 rounded-2xl border-2 border-brand-cyan/20 bg-slate-900 flex items-center justify-center overflow-hidden shadow-lg transition-all group-hover:border-brand-cyan group-hover:scale-105">
             <img src={innovator.avatar} alt={innovator.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 shadow-sm animate-pulse"></div>
          {/* Hover Tooltip */}
          <div className="absolute top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-[8px] text-white px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap uppercase tracking-[0.1em] border border-white/10 z-50 shadow-2xl">
            <span className="font-black text-brand-cyan">{innovator.name}</span> <br/> 
            <span className="text-gray-500">{innovator.expertise}</span>
          </div>
        </div>
      ))}
      <div className="h-12 w-px bg-gray-800 mx-2"></div>
      <div className="flex flex-col justify-center">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Boardroom Status</p>
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest leading-none">ACTIVE REVIEW</p>
      </div>
    </div>
  );
};

const StateIndicator = ({ state, retryCount }: { state: DeVinciState; retryCount: number; }) => {
    const messages: Record<DeVinciState, string | ((retryCount: number) => string)> = {
        idle: 'Establishing neural link...',
        connecting: 'Connecting to Sovereign Core...',
        listening: 'Active Listening Mode',
        speaking: 'DeVinci Transmitting...',
        thinking: 'Synthesizing Response...',
        error: 'Communication Error',
        paused: 'Transmission Paused',
        reconnecting: (count) => `Signal Lost. Reconnecting (${count}/3)...`,
        reconnect_failed: 'Uplink Failed. Check System Health.',
    };

    let message = messages[state];
    if (typeof message === 'function') {
        message = message(retryCount);
    }

    return (
        <div className="flex items-center justify-center gap-3">
            <span className={`w-2 h-2 rounded-full ${state === 'listening' ? 'bg-green-500 animate-pulse' : state === 'speaking' ? 'bg-brand-cyan animate-pulse' : 'bg-gray-500'}`}></span>
            <div className="text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{message}</div>
        </div>
    );
};

const Waveform = ({ isActive }: { isActive: boolean }) => (
    <div className={`flex items-center justify-center gap-1 h-12 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-20'}`}>
        {[...Array(12)].map((_, i) => (
            <div 
                key={i} 
                className={`w-1.5 bg-brand-cyan rounded-full transition-all duration-300 ${isActive ? 'animate-bounce' : 'h-2'}`}
                style={{ 
                    animationDelay: `${i * 0.1}s`, 
                    animationDuration: `${0.5 + Math.random()}s`,
                    height: isActive ? `${20 + Math.random() * 30}px` : '4px'
                }}
            />
        ))}
    </div>
);

const TranscriptView = ({ transcript }: { transcript: TranscriptEntry[] }) => {
    const endOfMessagesRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    return (
        <div className="flex-1 bg-black/40 border border-gray-700/50 p-6 rounded-3xl overflow-y-auto custom-scrollbar shadow-inner">
            {transcript.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                    <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.023c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03 8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
                    <p className="text-sm font-bold uppercase tracking-widest">Awaiting Dialogue Inception...</p>
                </div>
            )}
            {transcript.map((entry, index) => (
                <div key={index} className={`mb-6 animate-fade-in ${entry.source === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[85%] p-4 rounded-2xl shadow-lg border ${
                        entry.source === 'user' 
                        ? 'bg-brand-cyan/20 border-brand-cyan/30 text-white rounded-br-none' 
                        : 'bg-gray-800 border-gray-700 text-gray-200 rounded-bl-none'
                    }`}>
                        <p className="text-sm leading-relaxed">{entry.text}</p>
                    </div>
                    <p className="text-[10px] font-black text-gray-500 mt-2 uppercase tracking-widest px-2">
                        {entry.speakerName ? entry.speakerName.split(' ')[0] : (entry.source === 'user' ? 'Operator' : 'DeVinci')}
                    </p>
                </div>
            ))}
            <div ref={endOfMessagesRef} />
        </div>
    );
};


export const DeVinciModal = ({ isOpen, onClose, startConversation, stopConversation, pauseConversation, resumeConversation, state, transcript, isCreating = false, onFileUpload, analyzableFile, sendImageRegion, simulateNewSpeaker, manualRetry, retryCount, selectedCouncil }: DeVinciModalProps) => {
    useEffect(() => {
        if (isOpen && state === 'idle') {
            startConversation();
        }
    }, [isOpen, state, startConversation]);

    useEffect(() => {
        if (!isOpen) {
            stopConversation();
        }
    }, [isOpen, stopConversation]);

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-brand-dark/95 backdrop-blur-2xl flex items-center justify-center z-[200] p-4 sm:p-8 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-brand-cyan/20 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                {/* Visual Glow Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

                <header className="flex justify-between items-center p-8 border-b border-gray-800/50 bg-slate-900/50 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan border border-brand-cyan/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] animate-pulse">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v1.5m-6 0v-1.5a6 6 0 0 1 6-6v1.5m0 0v1.5m0-1.5a6 6 0 0 0-6 6v1.5m6-7.5a6 6 0 0 1 6 6v1.5" /></svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-brand-light uppercase italic tracking-tighter leading-none">Interactive Partner Dialogue</h2>
                            <p className="text-brand-cyan text-[10px] font-black uppercase tracking-[0.25em] mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
                                Sovereign Inference Channel :: Active
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-all transform hover:rotate-90 text-4xl font-light leading-none">&times;</button>
                </header>
                
                <main className="flex-1 p-8 flex flex-col gap-6 overflow-hidden relative z-10">
                    <CouncilHUD selectedCouncil={selectedCouncil} />
                    <TranscriptView transcript={transcript} />
                    
                    <div className="bg-gray-800/40 p-8 rounded-3xl border border-gray-700/50 space-y-6">
                        <Waveform isActive={state === 'speaking' || state === 'listening'} />
                        <StateIndicator state={state} retryCount={retryCount} />
                    </div>
                </main>

                <footer className="p-8 border-t border-gray-800/50 bg-slate-900/80 flex justify-between items-center relative z-10">
                    <div className="flex gap-3">
                         <button
                            onClick={simulateNewSpeaker}
                            className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-gray-700 hover:text-white transition-all active:scale-95"
                            disabled={state === 'idle' || state === 'connecting'}
                        >
                            + Add Speaker
                        </button>
                    </div>

                    <div className="flex gap-4">
                        {(state === 'error' || state === 'reconnect_failed') && (
                            <button onClick={manualRetry} className="px-10 py-3 bg-green-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-green-500 transition-all shadow-lg shadow-green-900/20">Retry Signal</button>
                        )}
                        {(state !== 'idle' && state !== 'error' && state !== 'reconnect_failed') && (
                            <button onClick={stopConversation} className="px-12 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 active:scale-95">Terminte Uplink</button>
                        )}
                    </div>
                </footer>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            `}</style>
        </div>
    );
};
