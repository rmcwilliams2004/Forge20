
import React, { useState, useRef, useMemo } from 'react';
import { DomainCategory, Innovator } from '../../types';
import { CouncilSelector } from './CouncilSelector';
import { INNOVATOR_LIBRARY } from '../../constants';

interface ProjectInitiationProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: { 
    name: string; 
    description: string; 
    stage: 'concept' | 'draft' | 'prototype';
    category: DomainCategory;
  }) => void;
  onStartFromPdf: (file: File) => void;
  onStartFromImage: (file: File) => void;
  onStartFromVideo: () => void;
  onStartBrainstorm: (file: File) => void;
  onStartWithDeVinci: () => void;
}

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const BrainIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6 6 0 1 0-6 6 6 6 0 0 0 6-6Zm0 0a6 6 0 1 1 6 6 6 6 0 0 1-6-6ZM11.25 15.75h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008ZM12 11.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" /></svg>;
const FileTextIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;
const PenToolIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const SparklesIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;
const PhotoIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const FileSearchIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" /></svg>;
const VideoIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>;

export const ProjectInitiationModal: React.FC<ProjectInitiationProps> = ({ 
  isOpen, onClose, onStart, 
  onStartFromPdf, onStartFromImage, onStartFromVideo, onStartBrainstorm, onStartWithDeVinci 
}) => {
  const [mode, setMode] = useState<'manual' | 'neural'>('manual');
  
  // Manual State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<'concept' | 'draft' | 'prototype'>('concept');
  const [category, setCategory] = useState<DomainCategory>(DomainCategory.GENERAL_INNOVATION);
  const [selectedCouncil, setSelectedCouncil] = useState<Innovator[]>([]);

  // File Refs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const brainstormInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleManualStart = () => {
    if (!name.trim()) return;
    onStart({ name, description, stage, category });
    resetAndClose();
  };

  const resetAndClose = () => {
    setName('');
    setDescription('');
    setStage('concept');
    setMode('manual');
    onClose();
  };

  const handleFileSelect = (handler: (f: File) => void, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        handler(e.target.files[0]);
        resetAndClose();
    }
  };

  const handleToggleCouncil = (innovator: Innovator) => {
    setSelectedCouncil(prev => {
        if (prev.some(s => s.id === innovator.id)) {
            return prev.filter(s => s.id !== innovator.id);
        }
        if (prev.length >= 4) return prev;
        return [...prev, innovator];
    });
  };

  const suggestCouncil = () => {
    const lowercasePrompt = description.toLowerCase();
    let suggestions: Innovator[] = [];

    if (lowercasePrompt.includes('fly') || lowercasePrompt.includes('space') || lowercasePrompt.includes('aero')) {
        suggestions = INNOVATOR_LIBRARY.filter(i => ['johnson', 'davinci', 'musk', 'tesla'].includes(i.id));
    } else if (lowercasePrompt.includes('app') || lowercasePrompt.includes('software') || lowercasePrompt.includes('logic')) {
        suggestions = INNOVATOR_LIBRARY.filter(i => ['hopper', 'jobs', 'lamarr', 'nooyi'].includes(i.id));
    } else if (lowercasePrompt.includes('green') || lowercasePrompt.includes('material') || lowercasePrompt.includes('sustain')) {
        suggestions = INNOVATOR_LIBRARY.filter(i => ['carver', 'walker', 'einstein', 'tesla'].includes(i.id));
    } else {
        suggestions = [INNOVATOR_LIBRARY[0], INNOVATOR_LIBRARY[1], INNOVATOR_LIBRARY[8], INNOVATOR_LIBRARY[4]];
    }
    setSelectedCouncil(suggestions.slice(0, 4));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        
        {/* Header with Mode Switcher */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex-1">
            <h2 className="text-2xl font-light text-white uppercase tracking-tight italic">Initialize Workspace</h2>
            <p className="text-slate-400 text-sm mt-1">Select an ingestion protocol to seed the Forge.</p>
          </div>
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 shadow-inner">
             <button 
                onClick={() => setMode('manual')}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'manual' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
             >
                Manual Forge
             </button>
             <button 
                onClick={() => setMode('neural')}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'neural' ? 'bg-brand-cyan text-gray-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
             >
                Neural Intake
             </button>
          </div>
          <button onClick={onClose} className="ml-6 text-slate-500 hover:text-white transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            
            {mode === 'manual' ? (
                <div className="space-y-8 animate-fade-in">
                    <div className="space-y-4">
                        <div>
                        <label className="block text-slate-400 text-[10px] uppercase tracking-wider font-black mb-2 ml-1">Asset Identity</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Aegis Hull V4 or Project Chimera"
                            className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-brand-cyan outline-none transition-all shadow-inner"
                        />
                        </div>
                        <div>
                        <label className="block text-slate-400 text-[10px] uppercase tracking-wider font-black mb-2 ml-1">Innovation Abstract</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What are we building today?"
                            className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-brand-cyan outline-none h-24 resize-none transition-all shadow-inner"
                        />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <CouncilSelector 
                            selected={selectedCouncil}
                            onToggle={handleToggleCouncil}
                            onSuggest={suggestCouncil}
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-[10px] uppercase tracking-wider font-black mb-4 ml-1">Maturity Phase</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={() => setStage('concept')} className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${stage === 'concept' ? 'border-brand-cyan bg-cyan-900/10' : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800'}`}>
                            <BrainIcon className={`w-8 h-8 mb-4 ${stage === 'concept' ? 'text-brand-cyan' : 'text-slate-600'}`} />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${stage === 'concept' ? 'text-white' : 'text-slate-400'}`}>Raw Concept</h3>
                            <p className="text-[10px] text-slate-500 mt-2 leading-tight">Napkin sketches & vague ideation.</p>
                        </button>
                        <button onClick={() => setStage('draft')} className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${stage === 'draft' ? 'border-purple-500 bg-purple-900/10' : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800'}`}>
                            <FileTextIcon className={`w-8 h-8 mb-4 ${stage === 'draft' ? 'text-purple-400' : 'text-slate-600'}`} />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${stage === 'draft' ? 'text-white' : 'text-slate-400'}`}>Rough Draft</h3>
                            <p className="text-[10px] text-slate-500 mt-2 leading-tight">Structured specs or initial drafts.</p>
                        </button>
                        <button onClick={() => setStage('prototype')} className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${stage === 'prototype' ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800'}`}>
                            <PenToolIcon className={`w-8 h-8 mb-4 ${stage === 'prototype' ? 'text-emerald-400' : 'text-slate-600'}`} />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${stage === 'prototype' ? 'text-white' : 'text-slate-400'}`}>Technical</h3>
                            <p className="text-[10px] text-slate-500 mt-2 leading-tight">CAD data & physical verification.</p>
                        </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-[10px] uppercase tracking-wider font-black mb-2 ml-1">Domain Calibration</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value as DomainCategory)} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-brand-cyan outline-none appearance-none cursor-pointer">
                            {Object.values(DomainCategory).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in py-4">
                    {/* Hidden Inputs */}
                    <input type="file" ref={pdfInputRef} accept=".pdf" className="hidden" onChange={(e) => handleFileSelect(onStartFromPdf, e)} />
                    <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileSelect(onStartFromImage, e)} />
                    <input type="file" ref={brainstormInputRef} accept=".pdf" className="hidden" onChange={(e) => handleFileSelect(onStartBrainstorm, e)} />

                    {/* Neural Buttons */}
                    <button onClick={() => { onStartWithDeVinci(); resetAndClose(); }} className="flex flex-col items-center justify-center p-8 bg-slate-800/40 hover:bg-purple-900/20 border border-slate-700 hover:border-purple-500 rounded-3xl transition-all group shadow-xl">
                        <div className="p-4 bg-purple-500/10 rounded-2xl mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all">
                            <SparklesIcon className="w-10 h-10 text-purple-400" />
                        </div>
                        <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">AI Assistant</h3>
                        <p className="text-[10px] text-slate-500 text-center font-bold">Dialogue-driven Forge</p>
                    </button>

                    <button onClick={() => pdfInputRef.current?.click()} className="flex flex-col items-center justify-center p-8 bg-slate-800/40 hover:bg-blue-900/20 border border-slate-700 hover:border-blue-500 rounded-3xl transition-all group shadow-xl">
                        <div className="p-4 bg-blue-500/10 rounded-2xl mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                            <FileSearchIcon className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">Technical Intake</h3>
                        <p className="text-[10px] text-slate-500 text-center font-bold">Parse Manuals & Specs</p>
                    </button>

                    <button onClick={() => imageInputRef.current?.click()} className="flex flex-col items-center justify-center p-8 bg-slate-800/40 hover:bg-pink-900/20 border border-slate-700 hover:border-pink-500 rounded-3xl transition-all group shadow-xl">
                        <div className="p-4 bg-pink-500/10 rounded-2xl mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-all">
                            <PhotoIcon className="w-10 h-10 text-pink-400" />
                        </div>
                        <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">Visual Intake</h3>
                        <p className="text-[10px] text-slate-500 text-center font-bold">Analyze Schematics</p>
                    </button>

                    <button onClick={() => { onStartFromVideo(); resetAndClose(); }} className="flex flex-col items-center justify-center p-8 bg-slate-800/40 hover:bg-red-900/20 border border-slate-700 hover:border-red-500 rounded-3xl transition-all group shadow-xl">
                        <div className="p-4 bg-red-500/10 rounded-2xl mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all">
                            <VideoIcon className="w-10 h-10 text-red-400" />
                        </div>
                        <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">Video Inflow</h3>
                        <p className="text-[10px] text-slate-500 text-center font-bold">Extraction Protocol</p>
                    </button>

                    <button onClick={() => brainstormInputRef.current?.click()} className="flex flex-col items-center justify-center p-8 bg-slate-800/40 hover:bg-yellow-900/20 border border-slate-700 hover:border-yellow-500 rounded-3xl transition-all group shadow-xl">
                        <div className="p-4 bg-yellow-500/10 rounded-2xl mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all">
                            <BrainIcon className="w-10 h-10 text-yellow-400" />
                        </div>
                        <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">Recursive Logic</h3>
                        <p className="text-[10px] text-slate-500 text-center font-bold">Inference from Library</p>
                    </button>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900">
          <button onClick={onClose} className="px-8 py-3 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Discard Sequence</button>
          {mode === 'manual' && (
            <button 
                onClick={handleManualStart}
                disabled={!name.trim()}
                className="bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-900 px-12 py-3 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-cyan-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                Initialize Forge
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
