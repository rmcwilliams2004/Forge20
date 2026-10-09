
import React, { useMemo, useState } from 'react';
import { CadComponent, CadMeasurement, CadViewerTool } from '../../types';

interface CadViewerSidebarProps {
  components: CadComponent[];
  visibleIds: Set<string>;
  selectedComponentName: string | null;
  onToggleVisibility: (name: string) => void;
  onSelectComponent: (name: string) => void;
  onToggleAll: (visible: boolean) => void;
  onToggleGroup: (names: string[], visible: boolean) => void;
  isExploded: boolean;
  onToggleExplode: () => void;
  explodeFactor: number;
  onExplodeFactorChange: (factor: number) => void;
  isSectionEnabled: boolean;
  onToggleSection: () => void;
  sectionPlaneConfig: { axis: string, constant: number, inverted: boolean };
  onSectionPlaneConfigChange: (config: { axis: string, constant: number, inverted: boolean }) => void;
  measurements: CadMeasurement[];
  onClearMeasurements: () => void;
  units: string;
  activeTool: CadViewerTool;
  isMeasuring: boolean;
  isPhysicsActive?: boolean;
  runPhysicsValidation?: () => void;
  activeEnv?: string;
  onEnvChange?: (env: string) => void;
}

const ComponentListItem: React.FC<{ component: CadComponent; isVisible: boolean; isSelected: boolean; onToggleVisibility: (name: string) => void; onSelectComponent: (name: string) => void; }> = 
({ component, isVisible, isSelected, onToggleVisibility, onSelectComponent }) => {
    const liClasses = `flex items-center gap-3 p-2 w-full cursor-pointer rounded-md transition-all duration-150 ${!isVisible ? 'opacity-50 hover:opacity-100' : ''} ${isSelected ? 'bg-yellow-500/20 hover:bg-yellow-500/30' : 'hover:bg-gray-700'}`;
    return (
        <li onClick={() => onSelectComponent(component.name)} className={liClasses}>
            <input type="checkbox" checked={isVisible} onChange={(e) => { e.stopPropagation(); onToggleVisibility(component.name); }} className="h-4 w-4 rounded border-gray-500 text-brand-cyan focus:ring-brand-cyan bg-gray-700" />
            <span className={`text-sm truncate ${isSelected ? 'font-bold text-yellow-300' : ''}`} title={component.name}>{component.name}</span>
        </li>
    );
};

const ComponentGroup: React.FC<{ groupName: string; components: CadComponent[]; visibleIds: Set<string>; selectedComponentName: string | null; onToggleVisibility: (name: string) => void; onSelectComponent: (name: string) => void; onToggleGroup: (names: string[], visible: boolean) => void; }> = 
({ groupName, components, visibleIds, selectedComponentName, onToggleVisibility, onSelectComponent, onToggleGroup }) => {
    const [isOpen, setIsOpen] = useState(true);
    const allInGroupVisible = components.every(c => visibleIds.has(c.name));

    return (
        <div>
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-700/50">
                <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-left flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                    <span className="font-semibold text-sm capitalize">{groupName}s ({components.length})</span>
                </button>
                <input type="checkbox" title={`Toggle all ${groupName}s`} checked={allInGroupVisible} onChange={(e) => onToggleGroup(components.map(c => c.name), e.target.checked)} className="h-4 w-4 rounded border-gray-500 text-brand-cyan focus:ring-brand-cyan bg-gray-700" />
            </div>
            {isOpen && <ul className="pl-4 pt-1 space-y-1">{components.map(comp => <ComponentListItem key={comp.name} component={comp} isSelected={selectedComponentName === comp.name} isVisible={visibleIds.has(comp.name)} onToggleVisibility={onToggleVisibility} onSelectComponent={onSelectComponent} />)}</ul>}
        </div>
    );
};

export const CadViewerSidebar = ({ 
    components, visibleIds, selectedComponentName, onToggleVisibility, onSelectComponent, onToggleAll, 
    onToggleGroup, isExploded, onToggleExplode, explodeFactor, onExplodeFactorChange, isSectionEnabled, 
    onToggleSection, sectionPlaneConfig, onSectionPlaneConfigChange, measurements, onClearMeasurements, 
    units, activeTool, isMeasuring, isPhysicsActive, runPhysicsValidation, activeEnv, onEnvChange 
}: CadViewerSidebarProps) => {
  const allVisible = components.length > 0 && components.every(c => visibleIds.has(c.name));
  
  const groupedComponents = useMemo(() => {
      return components.reduce((acc, comp) => {
          const shape = comp.shape || 'complex';
          if (!acc[shape]) acc[shape] = [];
          acc[shape].push(comp);
          return acc;
      }, {} as Record<string, CadComponent[]>);
  }, [components]);

  const Section: React.FC<{title: string, children: React.ReactNode, icon?: React.ReactNode}> = ({ title, children, icon }) => (
    <div className="border-t border-gray-600 pt-3 mt-3">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <h4 className="text-md font-bold text-brand-light">{title}</h4>
        </div>
        <div className="space-y-3 text-sm">{children}</div>
    </div>
  );

  return (
    <div className="w-80 bg-gray-800/80 backdrop-blur-sm border-l border-gray-600 p-4 flex flex-col h-full text-white">
      <h3 className="text-lg font-bold text-brand-cyan mb-3">Viewer Controls</h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Genesis Physics Command Center */}
        <Section 
            title="Genesis Physics" 
            icon={<svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>}
        >
            <div className="space-y-3 p-3 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                <div>
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Environment Domain</label>
                    <select 
                        value={activeEnv}
                        onChange={e => onEnvChange?.(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-purple-500 outline-none"
                    >
                        <option value="SAA_LEO_ORBIT">SAA_LEO (High Rad, 0g)</option>
                        <option value="STP_GROUND">STP_GROUND (Earth Standard)</option>
                        <option value="DEEP_SEA_V">DEEP_SEA (High Pressure)</option>
                    </select>
                </div>
                <button
                    onClick={runPhysicsValidation}
                    disabled={isPhysicsActive}
                    className={`w-full py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${isPhysicsActive ? 'bg-purple-900/40 text-purple-400 cursor-wait' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/40 active:scale-95'}`}
                >
                    {isPhysicsActive ? (
                        <>
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Solving 4D Tensors...
                        </>
                    ) : 'Initiate 4D Stress Test'}
                </button>
            </div>
        </Section>

        <Section title="Sectioning & Slicing">
            <label className="flex items-center justify-between cursor-pointer"><span className="text-gray-300">Enable Section Cut</span><input type="checkbox" checked={isSectionEnabled} onChange={onToggleSection} className="toggle-switch" /></label>
            {isSectionEnabled && (
                <div className="pl-2 space-y-2 animate-fade-in">
                    <select value={sectionPlaneConfig.axis} onChange={e => onSectionPlaneConfigChange({ ...sectionPlaneConfig, axis: e.target.value })} className="w-full p-1 bg-gray-700 border border-gray-600 rounded">
                        <option value="x">X-Axis</option><option value="y">Y-Axis</option><option value="z">Z-Axis</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <input type="range" min="-250" max="250" step="1" value={sectionPlaneConfig.constant} onChange={e => onSectionPlaneConfigChange({ ...sectionPlaneConfig, constant: parseFloat(e.target.value)})} className="w-full" title="Offset" />
                        <span className="text-xs font-mono text-gray-400 w-12 text-right">{sectionPlaneConfig.constant}</span>
                    </div>
                    <label className="flex items-center justify-between cursor-pointer"><span className="text-gray-300 text-xs">Invert Orientation</span><input type="checkbox" checked={sectionPlaneConfig.inverted} onChange={e => onSectionPlaneConfigChange({ ...sectionPlaneConfig, inverted: e.target.checked })} className="toggle-switch" /></label>
                </div>
            )}
        </Section>

        <Section title="Components">
            <div className="flex justify-between items-center mb-2 text-xs">
                <label htmlFor="toggle-all" className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="toggle-all" checked={allVisible} onChange={(e) => onToggleAll(e.target.checked)} className="h-4 w-4 rounded border-gray-500 text-brand-cyan focus:ring-brand-cyan bg-gray-700" /> Toggle All
                </label>
            </div>
            <ul className="space-y-2">{Object.entries(groupedComponents).sort(([a], [b]) => a.localeCompare(b)).map(([shape, comps]) => <ComponentGroup key={shape} groupName={shape} components={comps} visibleIds={visibleIds} selectedComponentName={selectedComponentName} onToggleVisibility={onToggleVisibility} onSelectComponent={onSelectComponent} onToggleGroup={onToggleGroup} />)}</ul>
        </Section>

        <Section title="Exploded View">
             <label className="flex items-center justify-between cursor-pointer"><span className="text-gray-300">Explode Assembly</span><input type="checkbox" checked={isExploded} onChange={onToggleExplode} className="toggle-switch" /></label>
             {isExploded && <input type="range" min="0.1" max="2" step="0.1" value={explodeFactor} onChange={e => onExplodeFactorChange(parseFloat(e.target.value))} className="w-full mt-2" />}
        </Section>
      </div>
      <style>{`.toggle-switch { appearance: none; width: 36px; height: 20px; background-color: #4b5563; border-radius: 9999px; position: relative; cursor: pointer; transition: background-color 0.2s ease-in-out; } .toggle-switch:checked { background-color: #06b6d4; } .toggle-switch::before { content: ''; position: absolute; width: 16px; height: 16px; background-color: white; border-radius: 9999px; top: 2px; left: 2px; transition: transform 0.2s ease-in-out; } .toggle-switch:checked::before { transform: translateX(16px); }`}</style>
    </div>
  );
};
