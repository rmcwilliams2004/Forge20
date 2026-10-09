
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Material, StandardComponent, MaterialPreset, User } from '../../../types';
import { MOCK_COMPONENTS } from '../../../constants';
import { MATERIAL_LIBRARY } from '../../../constants/materialLibrary';

type Tab = 'materials' | 'components' | 'custom';

interface MaterialSelectorProps {
    user?: User;
    onUpdateUser?: (user: User) => void;
    onSelectForAnalysis?: (material: Material) => void;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({ user, onUpdateUser, onSelectForAnalysis }) => {
  const [activeTab, setActiveTab] = useState<Tab>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<StandardComponent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Custom Material Form State
  const [customMaterial, setCustomMaterial] = useState<Partial<MaterialPreset>>({
      name: '',
      density: 0,
      youngsModulus: 0,
      tensileStrength: 0,
      yieldStrength: 0,
      thermalExpansion: 0,
      thermalConductivity: 0,
      category: 'Exotic',
      costPerKg: 0
  });

  const allMaterials = useMemo(() => {
    const presetsAsMaterials: Material[] = MATERIAL_LIBRARY.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        properties: {
            'Density': `${m.density} kg/m³`,
            'Young\'s Modulus': `${m.youngsModulus} GPa`,
            'Tensile Strength': `${m.tensileStrength} MPa`,
            'Yield Strength': `${m.yieldStrength} MPa`,
            'Thermal Expansion': `${m.thermalExpansion} 10⁻⁶/K`,
            'Thermal Conductivity': `${m.thermalConductivity} W/mK`,
            'Market Cost': `$${m.costPerKg}/kg`
        },
        materialData: m
    }));

    const userMaterials: Material[] = (user?.customMaterials || []).map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        properties: {
            'Density': `${m.density} kg/m³`,
            'Young\'s Modulus': `${m.youngsModulus} GPa`,
            'Tensile Strength': `${m.tensileStrength} MPa`,
            'Yield Strength': `${m.yieldStrength} MPa`,
            'Thermal Expansion': `${m.thermalExpansion} 10⁻⁶/K`,
            'Thermal Conductivity': `${m.thermalConductivity} W/mK`,
            'Vault Cost': `$${m.costPerKg}/kg`
        },
        materialData: m,
        isUserGenerated: true
    }));

    return [...presetsAsMaterials, ...userMaterials];
  }, [user?.customMaterials]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (activeTab === 'materials' && allMaterials.length > 0 && !selectedMaterial) {
          setSelectedMaterial(allMaterials[0]);
      } else if (activeTab === 'components' && MOCK_COMPONENTS.length > 0 && !selectedComponent) {
          setSelectedComponent(MOCK_COMPONENTS[0]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTab, allMaterials]);

  const filteredMaterials = useMemo(() =>
    allMaterials.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm, allMaterials]);

  const filteredComponents = useMemo(() =>
    MOCK_COMPONENTS.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  const handleSaveToLibrary = useCallback(() => {
      if (!customMaterial.name || !user || !onUpdateUser) return;
      
      setSaveStatus('saving');
      
      const newPreset: MaterialPreset = {
          id: `usr-mat-${Date.now()}`,
          name: customMaterial.name,
          category: customMaterial.category || 'Exotic',
          density: customMaterial.density || 0,
          youngsModulus: customMaterial.youngsModulus || 0,
          tensileStrength: customMaterial.tensileStrength || 0,
          yieldStrength: customMaterial.yieldStrength || 0,
          thermalExpansion: customMaterial.thermalExpansion || 0,
          thermalConductivity: customMaterial.thermalConductivity || 0,
          costPerKg: customMaterial.costPerKg || 0
      };

      // Simulated network delay
      setTimeout(() => {
        const updatedCustomMaterials = [...(user.customMaterials || []), newPreset];
        onUpdateUser({ ...user, customMaterials: updatedCustomMaterials });

        setSaveStatus('saved');
        
        setTimeout(() => {
            setActiveTab('materials');
            setSaveStatus('idle');
            setCustomMaterial({
                name: '', density: 0, youngsModulus: 0, tensileStrength: 0, 
                yieldStrength: 0, thermalExpansion: 0, thermalConductivity: 0, 
                category: 'Exotic', costPerKg: 0
            });
        }, 1000);
      }, 600);
  }, [customMaterial, user, onUpdateUser]);

  const handleDeleteUserMaterial = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (user && onUpdateUser && confirm("Permanently purge these tensors from your profile?")) {
        const updated = (user.customMaterials || []).filter(m => m.id !== id);
        onUpdateUser({ ...user, customMaterials: updated });
        if (selectedMaterial?.id === id) {
            setSelectedMaterial(allMaterials[0]);
        }
      }
  };

  const renderSelectedDetails = () => {
    if (activeTab === 'custom') {
        return (
            <div className="space-y-6 animate-fade-in h-full">
                <div className="border-b border-gray-700 pb-4">
                    <h3 className="text-xl font-bold text-brand-cyan uppercase tracking-tight">Forge Custom Material</h3>
                    <p className="text-xs text-gray-500 mt-1">Define proprietary material tensors for cross-disciplinary analysis.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 max-h-[60vh]">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Identity Name</label>
                            <input type="text" className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm" placeholder="e.g. AeroCarbon V3" value={customMaterial.name} onChange={e => setCustomMaterial({...customMaterial, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Density (kg/m³)</label>
                            <input type="number" className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm" value={customMaterial.density} onChange={e => setCustomMaterial({...customMaterial, density: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Elasticity (GPa)</label>
                            <input type="number" className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm" value={customMaterial.youngsModulus} onChange={e => setCustomMaterial({...customMaterial, youngsModulus: parseFloat(e.target.value)})} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Yield Strength (MPa)</label>
                            <input type="number" className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm" value={customMaterial.yieldStrength} onChange={e => setCustomMaterial({...customMaterial, yieldStrength: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Thermal Expansion (10⁻⁶/K)</label>
                            <input type="number" className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm" value={customMaterial.thermalExpansion} onChange={e => setCustomMaterial({...customMaterial, thermalExpansion: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Base Cost ($/kg)</label>
                            <input type="number" className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm" value={customMaterial.costPerKg} onChange={e => setCustomMaterial({...customMaterial, costPerKg: parseFloat(e.target.value)})} />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                    <button 
                        onClick={handleSaveToLibrary} 
                        disabled={!customMaterial.name || saveStatus !== 'idle' || !user} 
                        className={`w-full py-3 font-black uppercase tracking-widest rounded-lg transition-all shadow-lg disabled:opacity-30 flex items-center justify-center gap-2 ${
                            saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-brand-cyan text-gray-900 hover:bg-cyan-400'
                        }`}
                    >
                        {saveStatus === 'saving' ? (
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : saveStatus === 'saved' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V8.25c0-1.121.904-2.025 2.025-2.025h13.95A2.025 2.025 0 0 1 21 8.25v9a2.025 2.025 0 0 1-2.025 2.025H5.025A2.025 2.025 0 0 1 3 17.25Z" /></svg>
                        )}
                        {saveStatus === 'idle' ? 'Save to User Library' : saveStatus === 'saving' ? 'Committing...' : 'Saved to Profile'}
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                 <svg className="animate-spin h-8 w-8 text-brand-cyan" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Properties...</p>
            </div>
        );
    }

    if (activeTab === 'materials' && selectedMaterial) {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-start">
              <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{selectedMaterial.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-brand-cyan bg-cyan-900/40 px-2 py-1 rounded border border-brand-cyan/30 uppercase">{selectedMaterial.category}</span>
                    {selectedMaterial.isUserGenerated && (
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-900/40 px-2 py-1 rounded border border-indigo-500/30 uppercase flex items-center gap-1">
                           User Asset
                        </span>
                    )}
                  </div>
              </div>
              {onSelectForAnalysis && (
                  <button 
                    onClick={() => onSelectForAnalysis(selectedMaterial)}
                    className="py-2 px-5 bg-brand-cyan hover:bg-cyan-500 text-gray-900 text-xs font-bold uppercase tracking-widest rounded-lg transition shadow-lg active:scale-95"
                  >
                      Inject into Analysis
                  </button>
              )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-6">
            {Object.entries(selectedMaterial.properties).map(([key, value]) => (
                <div key={key} className="bg-black/30 p-4 rounded-xl border border-gray-700/50">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{key}</p>
                    <p className="text-lg font-mono font-bold text-gray-200">{value}</p>
                </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (activeTab === 'components' && selectedComponent) {
      return (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-xl font-bold text-brand-cyan">{selectedComponent.name}</h3>
          <p className="text-sm font-mono text-gray-400">PN: {selectedComponent.partNumber}</p>
          <p className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full inline-block">{selectedComponent.category}</p>
          <div className="border-t border-gray-700 pt-3">
            <h4 className="font-semibold text-brand-light mb-2">Specifications</h4>
            <ul className="text-sm text-gray-300 grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(selectedComponent.specifications).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    return <div className="text-gray-500 text-center p-8">Select an item to see details.</div>;
  };

  const listItems = activeTab === 'materials' ? filteredMaterials : filteredComponents;
  const selectedId = activeTab === 'materials' ? selectedMaterial?.id : selectedComponent?.id;

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold text-brand-light mb-4">Vault Inventory</h1>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="col-span-1 flex flex-col bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex p-1 bg-gray-900 rounded-lg mb-4 border border-gray-700 shadow-inner">
            <button onClick={() => setActiveTab('materials')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'materials' ? 'bg-cyan-900/60 text-brand-cyan' : 'text-gray-500 hover:text-white'}`}>Library</button>
            <button onClick={() => setActiveTab('components')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'components' ? 'bg-cyan-900/60 text-brand-cyan' : 'text-gray-500 hover:text-white'}`}>Parts</button>
            <button onClick={() => setActiveTab('custom')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'custom' ? 'bg-purple-900/60 text-purple-400' : 'text-gray-500 hover:text-white'}`}>Forge</button>
          </div>
          
          <input
            type="text"
            placeholder="Search ledger..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 mb-4 focus:border-brand-cyan outline-none"
          />

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {listItems.map(item => (
                <div key={item.id} className="relative group">
                    <button
                        onClick={() => {
                            if (activeTab === 'materials') {
                                setSelectedMaterial(item as Material);
                                setSelectedComponent(null);
                            } else {
                                setSelectedComponent(item as StandardComponent);
                                setSelectedMaterial(null);
                            }
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${item.id === selectedId ? 'bg-cyan-900/40 border-brand-cyan/50 text-white' : 'bg-transparent border-transparent hover:bg-gray-700/30 text-gray-400'}`}
                    >
                        <p className="font-bold text-xs truncate">{item.name}</p>
                        <p className="text-[9px] uppercase font-bold opacity-40">{(item as any).category || (item as any).partNumber}</p>
                    </button>
                    {activeTab === 'materials' && (item as Material).isUserGenerated && (
                        <button 
                            onClick={(e) => handleDeleteUserMaterial(item.id, e)}
                            className="absolute top-1/2 -translate-y-1/2 right-2 p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-gray-800/30 border border-gray-700 rounded-xl p-8 overflow-y-auto">
          {renderSelectedDetails()}
        </div>
      </div>
    </div>
  );
};
