
import React from 'react';

export const InitialView = ({ onStartDialogue }: { onStartDialogue?: () => void }) => (
  <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-[2rem] p-12 h-full flex flex-col items-center justify-center text-center animate-fade-in transition-colors duration-300 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>
    
    <svg className="w-20 h-20 text-brand-cyan mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.8"/>
    </svg>
    
    <h2 className="text-3xl font-black text-gray-900 dark:text-brand-light mb-4 uppercase italic tracking-tighter">Initialize Sovereign Vault</h2>
    <p className="text-gray-500 dark:text-gray-400 max-w-xl text-lg leading-relaxed mb-10">
      The Neural Forge is in standby. Transform product concepts into detailed technical reports and innovative redesign proposals through multi-disciplinary dialogue.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
            onClick={onStartDialogue}
            className="flex-1 px-8 py-5 bg-purple-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/30 flex items-center justify-center gap-3 group"
        >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v1.5m-6 0v-1.5a6 6 0 0 1 6-6v1.5m0 0v1.5m0-1.5a6 6 0 0 0-6 6v1.5m6-7.5a6 6 0 0 1 6 6v1.5" /></svg>
            Talk to DeVinci
        </button>
        <div className="hidden sm:flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">OR</div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Select a Lens above to start manual analysis</span>
        </div>
    </div>
  </div>
);
