
import React, { useEffect, useRef } from 'react';
import { MaterialPreset, FoundryState, LegalJurisdiction, FoundryOptimization, ReinforcementProfile } from '../../types';
import { MATERIAL_LIBRARY } from '../../constants/materialLibrary';

interface FoundryParamPanelProps {
  state: FoundryState;
  onUpdate: (updates: Partial<FoundryState>) => void;
  isViewer: boolean;
}

export const FoundryParamPanel: React.FC<FoundryParamPanelProps> = ({ state, onUpdate, isViewer }) => {
  const prevSF = useRef(state.safetyFactor);

  // Milestone logic for Safety Factor achievement
  useEffect(() => {
    if (prevSF.current < 1.5 && state.safetyFactor >= 1.5) {
        window.dispatchEvent(new CustomEvent('forge-milestone', {
            detail: {
                id: 'structural_stability',
                title: 'Structural Integrity Achieved',
                description: `Geometry has converged to a safety factor of ${state.safetyFactor.toFixed(2)}. Verification complete.`,
                type: 'STRUCTURAL'
            }
        }));
        window.dispatchEvent(new CustomEvent('forge-status', { detail: 'SOLVED' }));
    } else if (prevSF.current >= 1.0 && state.safetyFactor < 1.0) {
        window.dispatchEvent(new CustomEvent('forge-status', { detail: 'THROTTLED' }));
    }
    prevSF.current = state.safetyFactor;
  }, [state.safetyFactor]);

  const handleParamChange = (key: string, value: number) => {
    // SIGNAL NAL ACTIVITY FOR AUTO-SCALING
    window.dispatchEvent(new CustomEvent('forge-nal-activity'));

    onUpdate({
      parameters: { ...state.parameters, [key]: value }
    });
    
    // Optional: Trigger "Calibrating" voice if changes are significant
    if (Math.random() > 0.95) {
        window.dispatchEvent(new CustomEvent('forge-status', { detail: 'CALIBRATING' }));
    }
  };

  const applyReinforcement = (profile: ReinforcementProfile) => {
      window.dispatchEvent(new CustomEvent('forge-log', { 
          detail: `[FORGE]: Applying '${profile.name}' reinforcement profile. Recalculating mesh...` 
      }));
      
      onUpdate({
          activeReinforcementId: profile.id,
          parameters: {
              ...state.parameters,
              ...profile.parameterOverrides
          }
      });

      window.dispatchEvent(new CustomEvent('forge-milestone', {
          detail: {
              id: 'reinforcement_applied',
              title: `${profile.name} Applied`,
              description: `Physical configuration updated with ${Object.keys(profile.parameterOverrides).length} geometric overrides.`,
              type: 'STRUCTURAL'
          }
      }));
  };

  useEffect(() => {
      const handleVoiceParam = (e: any) => {
          const { param, delta, value, isAbsolute, isPercent } = e.detail;
          // Find closest matching key
          const key = Object.keys(state.parameters).find(k => k.toLowerCase().includes(param.toLowerCase()));
          if (key) {
              const currentVal = state.parameters[key];
              let newVal;
              
              if (isAbsolute) {
                  newVal = value;
              } else if (isPercent) {
                  newVal = currentVal * (1 + (delta / 100));
              } else {
                  newVal = currentVal + delta;
              }
              
              handleParamChange(key, newVal);
          }
      };

      window.addEventListener('forge-voice-param', handleVoiceParam);
      return () => window.removeEventListener('forge-voice-param', handleVoiceParam);
  }, [state.parameters, onUpdate]);

  const handleMaterialChange = (id: string) => {
    const material = MATERIAL_LIBRARY.find(m => m.id === id);
    if (material) {
      onUpdate({ selectedMaterial: material });
      window.dispatchEvent(new CustomEvent('forge-status', { detail: 'CALIBRATING' }));
    }
  };

  const applyOptimization = (opt: FoundryOptimization) => {
    handleParamChange(opt.parameter, opt.recommendedValue);
    window.dispatchEvent(new CustomEvent('forge-log', { detail: `[FOUNDRY]: Applied optimization for ${opt.parameter}.` }));
  };

  const toggleLock = async () => {
      const nextLocked = !state.isLocked;
      let designHash = state.designHash;
      
      if (nextLocked) {
          // Generate SHA-256 style hash of the design configuration
          const designString = JSON.stringify({
              mat: state.selectedMaterial.id,
              params: state.parameters,
              scad: state.scadString
          });
          const msgUint8 = new TextEncoder().encode(designString);
          const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          designHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          
          window.dispatchEvent(new CustomEvent('forge-log', { detail: `[IP_LEDGER]: DESIGN_COMMITTED::HASH_${designHash.slice(0, 8)}` }));
          window.dispatchEvent(new CustomEvent('forge-status', { detail: 'LOCKED' }));
          
          window.dispatchEvent(new CustomEvent('forge-milestone', {
              detail: {
                  id: 'design_committed',
                  title: 'Innovation Fingerprint Secured',
                  description: 'Design configuration has been hashed and recorded in the sovereign IP ledger.',
                  type: 'LEGAL'
              }
          }));
      }
      
      onUpdate({ isLocked: nextLocked, designHash });
  };

  const handleJurisdictionChange = (jurisdiction: string) => {
      onUpdate({ jurisdiction: jurisdiction as LegalJurisdiction });
  };

  return (
    <div className="w-80 bg-gray-900/90 backdrop-blur-xl border-l border-gray-700 flex flex-col h-full animate-fade-in shadow-2xl">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <div>
            <h3 className="text-sm font-black text-brand-cyan uppercase tracking-[0.3em] mb-1">Foundry HUD</h3>
            <p className="text-[10px] text-gray-500 uppercase font-bold">
                {state.isLocked ? 'Geometry Committed' : 'Parametric Overrides Active'}
            </p>
        </div>
        <button 
            onClick={toggleLock}
            disabled={isViewer}
            className={`p-2 rounded-lg transition-all ${state.isLocked ? 'bg-red-900/40 text-red-400 border border-red-500/40' : 'bg-green-900/40 text-green-400 border border-green-500/40 animate-pulse'}`}
            title={state.isLocked ? "Unlock Design" : "Lock Geometry for IP Synthesis"}
        >
            {state.isLocked ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
            )}
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar transition-opacity duration-300 ${state.isLocked ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Reinforcement Engine Section */}
        {state.cadResult?.availableReinforcements && state.cadResult.availableReinforcements.length > 0 && (
            <section className="space-y-4">
                <label className="block text-[10px] font-black text-amber-500 uppercase tracking-widest">Reinforcement Profiles</label>
                <div className="grid grid-cols-1 gap-2">
                    {state.cadResult.availableReinforcements.map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => applyReinforcement(profile)}
                            className={`p-4 text-left rounded-xl border-2 transition-all group ${state.activeReinforcementId === profile.id ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-900/20' : 'bg-gray-800 border-gray-700 hover:border-amber-500/50'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-black uppercase tracking-tighter ${state.activeReinforcementId === profile.id ? 'text-amber-400' : 'text-gray-300'}`}>{profile.name}</span>
                                {state.activeReinforcementId === profile.id && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>}
                            </div>
                            <p className="text-[9px] text-gray-500 leading-tight italic">{profile.description}</p>
                        </button>
                    ))}
                </div>
            </section>
        )}

        {/* Suggested Optimizations Section */}
        {state.cadResult?.optimizations && state.cadResult.optimizations.length > 0 && (
          <section className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4 space-y-4 animate-scale-in">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 00 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 00 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 00 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 00 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>
              AI Optimization Advice
            </h4>
            <div className="space-y-3">
              {state.cadResult.optimizations.map((opt, i) => (
                <div key={i} className="bg-black/30 p-3 rounded-xl border border-gray-800 space-y-2 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">{opt.parameter}</p>
                      <p className="text-xs font-black text-brand-light mt-1">Target: {opt.recommendedValue}</p>
                    </div>
                    {!isViewer && (
                      <button 
                        onClick={() => applyOptimization(opt)}
                        className="p-1 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Apply recommended value"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-500 italic leading-tight">{opt.rationale}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Material Selection */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">Physics Mesh Profile</label>
            <button 
                onClick={() => window.dispatchEvent(new CustomEvent('material-comparison'))}
                className="text-[9px] font-black text-brand-cyan uppercase tracking-tighter hover:text-cyan-300 transition-colors"
            >
                Compare Materials
            </button>
          </div>
          <select 
            value={state.selectedMaterial.id}
            onChange={(e) => handleMaterialChange(e.target.value)}
            disabled={isViewer || state.isLocked}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs text-white focus:border-brand-cyan outline-none transition-all shadow-inner"
          >
            {MATERIAL_LIBRARY.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="p-2 bg-black/40 rounded-lg border border-gray-800 text-center">
              <span className="block text-[8px] text-gray-500 uppercase font-black">Yield</span>
              <span className="text-xs font-mono text-brand-cyan">{state.selectedMaterial.tensileStrength}MPa</span>
            </div>
            <div className="p-2 bg-black/40 rounded-lg border border-gray-800 text-center">
              <span className="block text-[8px] text-gray-500 uppercase font-black">Elasticity</span>
              <span className="text-xs font-mono text-brand-cyan">{state.selectedMaterial.youngsModulus}GPa</span>
            </div>
          </div>
        </section>

        {/* Dynamic Parameters */}
        <section className="space-y-6">
          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-gray-800 pb-2">Mesh Topology Variables</label>
          {Object.entries(state.parameters).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-gray-400 uppercase">{key.replace(/_/g, ' ')}</span>
                <span className="text-xs font-mono text-white bg-gray-800 px-2 py-0.5 rounded">{(value as number).toFixed(1)}</span>
              </div>
              <input 
                type="range"
                min={0}
                max={500}
                step={0.5}
                value={value as number}
                onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                disabled={isViewer || state.isLocked}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>
          ))}
        </section>

        {/* Safety Interlock HUD */}
        <section className="p-6 bg-black/50 rounded-2xl border border-gray-800 shadow-inner">
          <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Factor of Safety</span>
             <span className={`text-2xl font-black italic ${state.safetyFactor < 1.5 ? 'text-red-500' : 'text-green-500'}`}>
                {state.safetyFactor.toFixed(2)}
             </span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-500 ${state.safetyFactor < 1.2 ? 'bg-red-600' : state.safetyFactor < 2.0 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (state.safetyFactor / 4) * 100)}%` }}
            />
          </div>
          {state.safetyFactor < 1.0 && (
            <div className="mt-4 p-2 bg-red-900/20 border border-red-500/40 rounded-lg animate-pulse">
                <p className="text-[9px] font-black text-red-400 uppercase text-center tracking-widest">CRITICAL FAILURE DETECTED</p>
            </div>
          )}
        </section>
      </div>

      <div className={`p-6 bg-gray-950 border-t border-gray-800 space-y-4 ${!state.isLocked ? 'hidden' : 'block'}`}>
          <div>
            <label className="block text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-2">Legal Jurisdiction</label>
            <select 
                value={state.jurisdiction}
                onChange={(e) => handleJurisdictionChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs text-white focus:border-brand-cyan outline-none"
            >
                <option value="USPTO">USPTO (US Patent Office)</option>
                <option value="WIPO">WIPO (International PCT)</option>
                <option value="EPO">EPO (European Patent Office)</option>
            </select>
          </div>
          <div className="p-3 bg-indigo-900/20 rounded-xl border border-indigo-500/20">
              <span className="block text-[8px] font-black text-gray-500 uppercase mb-1">Design Fingerprint</span>
              <span className="text-[10px] font-mono text-indigo-400 truncate block">{state.designHash}</span>
          </div>
          <button 
            onClick={toggleLock}
            disabled={isViewer}
            className="w-full py-4 bg-gray-800 text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-700 transition-all active:scale-95"
          >
            Unlock Geometry
          </button>
      </div>
      
      {!state.isLocked && (
          <div className="p-6 bg-gray-950 border-t border-gray-800">
            <button 
                onClick={() => window.dispatchEvent(new CustomEvent('re-forge'))}
                disabled={isViewer}
                className="w-full py-4 bg-brand-cyan text-gray-900 font-black uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-900/40"
            >
                Re-Forge Geometry
            </button>
          </div>
      )}
    </div>
  );
};
