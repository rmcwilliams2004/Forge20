
import React from 'react';
import { Innovator } from '../../types';
import { INNOVATOR_LIBRARY } from '../../constants';

interface CouncilSelectorProps {
  selected: Innovator[];
  onToggle: (innovator: Innovator) => void;
  onSuggest: () => void;
}

export const CouncilSelector: React.FC<CouncilSelectorProps> = ({ selected, onToggle, onSuggest }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <div>
            <h3 className="text-brand-cyan font-black uppercase tracking-[0.2em] text-xs">Mastermind Council</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Seat up to 4 multidisciplinary experts</p>
        </div>
        <button 
            onClick={onSuggest} 
            className="px-4 py-1.5 bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-cyan hover:text-gray-900 transition-all active:scale-95"
        >
          AI Recommendation
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INNOVATOR_LIBRARY.map(innovator => {
          const isSelected = selected.some(s => s.id === innovator.id);
          const isDisabled = !isSelected && selected.length >= 4;
          
          return (
            <button 
              key={innovator.id}
              disabled={isDisabled}
              onClick={() => onToggle(innovator)}
              className={`relative p-4 rounded-2xl border transition-all text-left group flex flex-col items-center text-center ${
                isSelected 
                  ? 'border-brand-cyan bg-brand-cyan/10 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-brand-cyan' 
                  : 'border-slate-800 bg-slate-900/50 opacity-60 hover:opacity-100 hover:border-slate-600'
              } ${isDisabled ? 'grayscale cursor-not-allowed opacity-30' : ''}`}
            >
              <div className="relative mb-3">
                <img 
                    src={innovator.avatar} 
                    alt={innovator.name} 
                    className={`w-12 h-12 rounded-full border-2 transition-all ${isSelected ? 'border-brand-cyan' : 'border-slate-700'}`} 
                />
                {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-cyan rounded-full flex items-center justify-center text-gray-900 animate-scale-in">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="m4.5 12.75 6 6 9-13.5" /></svg>
                    </div>
                )}
              </div>
              <div className={`text-[11px] font-black uppercase tracking-tighter truncate w-full ${isSelected ? 'text-white' : 'text-slate-400'}`}>{innovator.name}</div>
              <div className="text-[8px] text-slate-600 truncate uppercase mt-1 w-full font-bold">{innovator.expertise}</div>
              
              {isSelected && (
                  <div className="mt-2 px-2 py-0.5 bg-brand-cyan/20 rounded text-[7px] font-black text-brand-cyan uppercase tracking-widest">Seated</div>
              )}
            </button>
          );
        })}
      </div>
      
      {selected.length === 0 && (
          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 border-dashed text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">"Richard, the boardroom is empty. Select a council to initiate peer review."</p>
          </div>
      )}
    </div>
  );
};
