
import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Youtube, Upload, Video, Search, Globe, Shield } from 'lucide-react';

interface VideoImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportFile: (file: File) => void;
    onImportUrl: (url: string) => void;
    isLoading: boolean;
}

export const VideoImportModal: React.FC<VideoImportModalProps> = ({ isOpen, onClose, onImportFile, onImportUrl, isLoading }) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
    const [url, setUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImportFile(file);
            if (e.target) e.target.value = '';
        }
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) onImportUrl(url.trim());
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Video Synthesis Protocol"
            confirmText={activeTab === 'upload' ? 'Upload Frame Data' : 'Engage Search Grounding'}
            confirmDisabled={activeTab === 'link' && !url.trim() || isLoading}
            onConfirm={() => activeTab === 'link' && url.trim() && onImportUrl(url.trim())}
            cancelText="Discard"
        >
            <div className="space-y-6">
                <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Video className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Temporal Ingestion</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                            Choose between Deep Frame Analysis (for proprietary clips) or Web-Search Grounding (for public sci-fi references).
                        </p>
                    </div>
                </div>
                
                <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('upload')} 
                        className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Upload className="w-3 h-3" /> File Protocol
                    </button>
                    <button 
                        onClick={() => setActiveTab('link')} 
                        className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'link' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Youtube className="w-3 h-3" /> Cloud Context
                    </button>
                </div>

                {activeTab === 'upload' ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-3xl bg-black/20 hover:border-indigo-500 transition-all group">
                         <input 
                            type="file" ref={fileInputRef} onChange={handleFileChange} 
                            accept="video/*" className="hidden" disabled={isLoading}
                        />
                        {isLoading ? (
                             <div className="flex flex-col items-center gap-4 py-4">
                                <svg className="animate-spin h-10 w-10 text-brand-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <div>
                                    <p className="text-brand-cyan font-black uppercase tracking-[0.2em]">Extracting Motion Vectors...</p>
                                    <p className="text-xs text-gray-600 mt-1 font-mono uppercase">Gemini-3-Pro-Preview Active</p>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center gap-4 w-full"
                            >
                                <div className="p-5 bg-gray-800 rounded-2xl group-hover:scale-110 transition-transform shadow-2xl">
                                    <Video className="w-10 h-10 text-indigo-400" />
                                </div>
                                <div>
                                    <span className="text-gray-300 font-black uppercase tracking-widest text-sm block">Select Video Node</span>
                                    <span className="text-[10px] text-gray-500 mt-1 font-bold">MP4, MOV, WEBM (UPLINK 50MB MAX)</span>
                                </div>
                            </button>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleUrlSubmit} className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="url" value={url} onChange={e => setUrl(e.target.value)}
                                placeholder="Paste public video URL (YouTube, Vimeo)..."
                                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-gray-700 rounded-2xl text-white font-medium focus:ring-2 focus:ring-red-500/50 outline-none transition-all placeholder:text-gray-600"
                                disabled={isLoading}
                            />
                        </div>
                        {isLoading && (
                            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-pulse">
                                <Globe className="w-4 h-4 text-red-500" />
                                <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Grounding Search Queries: "{url.slice(0,30)}..."</p>
                            </div>
                        )}
                        <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex gap-3">
                            <Shield className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                            <p className="text-[9px] text-gray-500 leading-relaxed font-bold uppercase tracking-tighter">
                                Note: Direct URL grounding uses Gemini-Flash for low-latency web indexing. For deep visual deconstruction, use File protocol.
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
};
