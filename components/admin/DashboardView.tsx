
import React, { useMemo } from 'react';
import { User, ProjectIndexEntry, LogEntry, Role } from '../../types';
import { Activity, Layers, Zap, Globe, ShieldCheck, ChevronRight } from 'lucide-react';

interface DashboardViewProps {
    users: User[];
    projects: ProjectIndexEntry[];
    logs: LogEntry[];
}

const SummaryCard = ({ label, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between h-48 group hover:border-brand-cyan transition-all duration-300">
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl bg-slate-50 ${color} group-hover:bg-brand-cyan group-hover:text-white transition-all shadow-sm`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+{trend}%</span>}
        </div>
        <div>
            <p className="text-4xl font-black text-slate-900 italic tracking-tighter leading-none mb-2">{value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
    </div>
);

export const DashboardView = ({ users, projects, logs }: DashboardViewProps) => {
    const activeSyncs = useMemo(() => projects.length, [projects]);
    const analysesRun = useMemo(() => users.reduce((sum, u) => sum + u.analysesRun, 0), [users]);

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Strategic Overview</h2>
                    <p className="text-slate-500 text-[10px] mt-4 font-black uppercase tracking-[0.2em]">Cross-Tenant Innovation Metrics</p>
                </div>
                <div className="bg-brand-cyan/5 border border-brand-cyan/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <Globe className="w-4 h-4 text-brand-cyan animate-pulse" />
                    <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">PLaaS Global Shard 01 Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard label="Active Synapses" value={activeSyncs} icon={Layers} trend="12" color="text-brand-cyan" />
                <SummaryCard label="Total Physical Solves" value={analysesRun} icon={Zap} trend="5" color="text-purple-500" />
                <SummaryCard label="Identity Nodes" value={users.length} icon={ShieldCheck} color="text-emerald-500" />
                <SummaryCard label="Compute Shards" value="12" icon={Activity} color="text-slate-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent High-Fidelity Events */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Live Bus Activity Monitor</h3>
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="divide-y divide-slate-100">
                            {logs.slice(0, 6).map(log => (
                                <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-2 h-2 rounded-full ${log.level === 'INFO' ? 'bg-brand-cyan' : log.level === 'WARN' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{log.message}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Tenant: {log.user} // ID: {log.id}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 font-bold group-hover:text-slate-900 transition-colors">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid Status Quick Actions */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Control Interlocks</h3>
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-20 h-20 text-white" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left">
                                <div>
                                    <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-1">Agnostic Wipe</p>
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Hard Reset session buffers</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left">
                                <div>
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Compute Overdrive</p>
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Priority token allocation</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Mesh Solver Capacity</span>
                                    <span className="text-[10px] font-black text-emerald-400">92%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-[92%] h-full bg-brand-cyan shadow-[0_0_10px_#06b6d4]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
