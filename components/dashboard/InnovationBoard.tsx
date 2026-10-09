
import React, { useState, useMemo } from 'react';
import { ProjectIndexEntry, DomainCategory, Role } from '../../types';
import { SystemDiagnosticsModal } from './SystemDiagnosticsModal';
import { 
  Activity, 
  Shield, 
  Cpu, 
  Database, 
  Search, 
  Filter, 
  Grid, 
  List as ListIcon, 
  ChevronRight, 
  Zap, 
  Globe, 
  Lock
} from 'lucide-react';

interface InnovationBoardProps {
  projects: ProjectIndexEntry[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}

const PhasePill = ({ phase }: { phase: string }) => {
  const colors: Record<string, string> = {
    'Ingestion': 'bg-blue-900/30 text-blue-400 border-blue-500/20',
    'Verification': 'bg-amber-900/30 text-amber-400 border-amber-500/20',
    'HoloEngineering': 'bg-purple-900/30 text-purple-400 border-purple-500/20',
    'Documentation': 'bg-cyan-900/30 text-cyan-400 border-cyan-500/20',
    'Sovereign bundle': 'bg-green-900/30 text-green-400 border-green-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${colors[phase] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
      {phase}
    </span>
  );
};

const ProjectCard = ({ project, onSelect }: { project: ProjectIndexEntry; onSelect: (id: string) => void }) => {
  const phases = ['Ingestion', 'Verification', 'HoloEngineering', 'Documentation', 'Sovereign bundle'];
  const phaseIndex = Math.floor((new Date().getTime() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24)) % phases.length;
  const currentPhase = phases[phaseIndex] || phases[0];
  const progressPercent = ((phaseIndex + 1) / phases.length) * 100;

  return (
    <div 
      onClick={() => onSelect(project.id)}
      className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 hover:border-brand-cyan/50 transition-all duration-500 cursor-pointer hover:-translate-y-1 shadow-xl hover:shadow-cyan-900/20 overflow-hidden"
    >
      {/* Activity Heartbeat Visual */}
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-0.5 items-end h-4">
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1 bg-brand-cyan rounded-full animate-pulse" 
                    style={{ 
                        height: `${20 + Math.random() * 80}%`, 
                        animationDelay: `${i * 0.15}s` 
                    }} 
                />
            ))}
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-start">
          <PhasePill phase={currentPhase} />
          <div className="text-[10px] font-mono text-slate-500 font-bold group-hover:text-brand-cyan transition-colors">
            V-NODE::{project.id.slice(-6).toUpperCase()}
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-brand-cyan transition-colors duration-300 truncate">
            {project.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-medium leading-relaxed italic opacity-70 group-hover:opacity-100">
            "{project.description || 'No description provided for this synapse.'}"
          </p>
        </div>

        {/* Phase Progress Bar */}
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <span>Stability Index</span>
                <span className="text-brand-cyan">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-brand-cyan shadow-[0_0_10px_#06b6d4] transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {(project.tags || []).slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded-md text-[9px] font-bold text-slate-400 uppercase tracking-tighter group-hover:border-brand-cyan/30">
              #{tag}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Last Sync</span>
            <span className="text-[10px] font-bold text-slate-300">{new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-brand-cyan group-hover:text-gray-900 transition-all">
             <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const InnovationBoard: React.FC<InnovationBoardProps> = ({ projects, onSelectProject, onNewProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDiagOpen, setIsDiagOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (p.tags && p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [projects, searchTerm]);

  const activeSyncs = useMemo(() => projects?.length || 0, [projects]);
  const lockedAssets = useMemo(() => Math.floor((projects?.length || 0) * 0.4), [projects]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Dynamic Command Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-cyan/10 rounded-2xl flex items-center justify-center border border-brand-cyan/20 text-brand-cyan shadow-lg shadow-cyan-900/20">
                <Globe className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Innovation <span className="text-brand-cyan">Command</span> Center
                </h2>
                <button 
                    onClick={() => setIsDiagOpen(true)}
                    className="flex items-center gap-2 text-slate-500 text-[10px] mt-2 font-black uppercase tracking-[0.25em] hover:text-brand-cyan transition-colors group"
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                    Active Multi-Tenant Vault Grid // Status: <span className="text-emerald-400 group-hover:underline">NOMINAL</span>
                </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none relative group min-w-[240px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-cyan transition-colors" />
                <input 
                    type="text"
                    placeholder="Search Vault Nodes..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none transition-all placeholder:text-slate-600"
                />
            </div>
            
            <div className="flex p-1 bg-slate-900/50 border border-slate-700 rounded-2xl">
                <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand-cyan text-gray-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-cyan text-gray-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}><ListIcon className="w-4 h-4" /></button>
            </div>

            <button 
                onClick={onNewProject}
                className="px-8 py-3.5 bg-brand-cyan text-gray-900 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-900/30 active:scale-95 flex items-center gap-2"
            >
                <Zap className="w-4 h-4 fill-current" /> Initialize Synapse
            </button>
        </div>
      </div>

      {/* Global Telemetry HUD (Expanded) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Synapses', val: activeSyncs, icon: Activity, color: 'text-brand-cyan', bg: 'bg-cyan-900/10' },
          { label: 'Vault Allocation', val: '64.2%', icon: Database, color: 'text-white', bg: 'bg-slate-800/40' },
          { label: 'Secured Assets', val: lockedAssets, icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-900/10' },
          { label: 'Compute Shards', val: 12, icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-900/10' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} border border-slate-800 p-6 rounded-3xl flex items-center justify-between group hover:border-slate-600 transition-all shadow-lg`}>
            <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{stat.label}</span>
                <span className={`text-3xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</span>
            </div>
            <div className={`p-3 rounded-2xl ${stat.bg.replace('/10', '/20')} text-slate-500 group-hover:text-white transition-all`}>
                <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-950/20 border-2 border-dashed border-slate-800 rounded-[3rem] p-32 text-center space-y-8 animate-fade-in shadow-inner">
          <div className="relative w-fit mx-auto">
             <div className="absolute inset-0 bg-brand-cyan/20 blur-3xl rounded-full"></div>
             <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 border border-slate-700 relative">
                <Search className="w-12 h-12" />
             </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-300 uppercase italic tracking-tighter">
                {searchTerm ? 'Zero Matches Found' : 'Sovereign Vault Empty'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                {searchTerm ? 'Modify your query abstract to identify relevant nodes.' : 'No engineering synapses have been forged in this multi-tenant environment.'}
            </p>
          </div>
          <button 
            onClick={onNewProject}
            className="px-10 py-4 bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 shadow-xl"
          >
            Forge First Project
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" : "space-y-4 animate-fade-in"}>
          {filteredProjects.map(project => (
            viewMode === 'grid' ? (
                <ProjectCard key={project.id} project={project} onSelect={onSelectProject} />
            ) : (
                <div 
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="flex items-center gap-6 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-brand-cyan/50 hover:bg-slate-900 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-brand-cyan font-black border border-slate-700 group-hover:border-brand-cyan/30">
                        {project.name ? project.name.charAt(0) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <h3 className="text-white font-black uppercase italic tracking-tighter truncate group-hover:text-brand-cyan transition-colors">{project.name}</h3>
                            <PhasePill phase="Verification" />
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">{project.description}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Stability</span>
                        <span className="text-sm font-mono font-bold text-white">82.4%</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Last Sync</span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-brand-cyan transition-all" />
                </div>
            )
          ))}
          
          {viewMode === 'grid' && (
            <button 
                onClick={onNewProject}
                className="group flex flex-col items-center justify-center p-12 bg-slate-950/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] hover:border-brand-cyan/30 hover:bg-slate-900/40 transition-all duration-500 min-h-[300px] relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-5 bg-slate-800 rounded-2xl mb-4 group-hover:bg-brand-cyan group-hover:text-gray-900 transition-all duration-500 group-hover:scale-110 shadow-lg relative z-10">
                    <Zap className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] group-hover:text-white transition-colors relative z-10">Initialize New Synapse</span>
            </button>
          )}
        </div>
      )}

      {/* Grid Diagnostic Modal */}
      <SystemDiagnosticsModal isOpen={isDiagOpen} onClose={() => setIsDiagOpen(false)} projectsCount={projects?.length || 0} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};
