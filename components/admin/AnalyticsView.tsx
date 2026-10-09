import React, { useMemo, useState } from 'react';
import { LogEntry, ProjectIndexEntry } from '../../types';

const BarChart = ({ data, title, subtitle }: { data: { label: string; value: number, color: string }[], title:string, subtitle?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-gray-900/60 border border-gray-800 p-8 rounded-2xl shadow-xl">
            <div className="mb-6">
                <h3 className="text-xl font-black text-brand-light tracking-tight leading-none">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 uppercase tracking-widest mt-2 font-bold">{subtitle}</p>}
            </div>
            <div className="space-y-6">
                {data.map(item => (
                    <div key={item.label} className="grid grid-cols-4 items-center gap-4 group">
                        <span className="text-xs font-bold text-gray-400 col-span-1 truncate group-hover:text-brand-cyan transition-colors">{item.label}</span>
                        <div className="col-span-3 bg-gray-800 rounded-lg h-8 overflow-hidden border border-gray-700/50 relative">
                            <div
                                className={`h-full transition-all duration-1000 ease-out flex items-center justify-end px-3 ${item.color}`}
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                                <span className="text-[10px] font-black text-white mix-blend-overlay">{item.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LogLevelPill = ({ level }: { level: LogEntry['level'] }) => {
    const levelColors: Record<LogEntry['level'], string> = {
        'INFO': 'bg-blue-600/20 text-blue-300 border-blue-500/30',
        'WARN': 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
        'ERROR': 'bg-red-600/20 text-red-300 border-red-500/30',
    };
    return <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${levelColors[level]}`}>{level}</span>;
}


interface AnalyticsViewProps {
    logs: LogEntry[];
    projects: ProjectIndexEntry[];
}

export const AnalyticsView = ({ logs, projects }: AnalyticsViewProps) => {
    const [logFilter, setLogFilter] = useState<LogEntry['level'] | 'ALL'>('ALL');
    const [logSearchTerm, setLogSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState<string>('ALL');

    const businessMetrics = useMemo(() => {
        const trialStarts = logs.filter(l => l.message.includes('Started 1-week free trial')).length;
        const onboardingCompletions = logs.filter(l => l.message.includes('Onboarding complete')).length;
        const ipSecured = logs.filter(l => l.message.includes('Innovation Secured')).length;
        const analysisRequests = logs.filter(l => l.message.includes('Commencing analysis')).length;
        
        return [
            { label: 'Analyses Engine', value: analysisRequests, color: 'bg-brand-cyan' },
            { label: 'IP Secured', value: ipSecured, color: 'bg-green-600' },
            { label: 'Onboarding Finalized', value: onboardingCompletions, color: 'bg-indigo-600' },
            { label: 'Trial Conversions', value: trialStarts, color: 'bg-purple-600' },
        ];
    }, [logs]);
    
    const { uniqueUsers } = useMemo(() => {
        const users = new Set<string>();
        logs.forEach(log => { if (log.user) users.add(log.user); });
        return { uniqueUsers: Array.from(users).sort() };
    }, [logs]);

    const filteredLogs = useMemo(() => {
        const lowercasedSearch = logSearchTerm.toLowerCase();
        return logs
            .filter(log => logFilter === 'ALL' || log.level === logFilter)
            .filter(log => userFilter === 'ALL' || log.user === userFilter)
            .filter(log => 
                log.message.toLowerCase().includes(lowercasedSearch) ||
                (log.user && log.user.toLowerCase().includes(lowercasedSearch))
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, logFilter, logSearchTerm, userFilter]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-brand-light tracking-tight leading-none uppercase italic">Operational Velocity</h2>
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-4">Cross-Tenant Isolation Auditing Active</p>
                </div>
                <div className="flex gap-8">
                    <div className="text-right">
                        <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-2">Health Status</span>
                        <div className="flex items-center gap-2">
                             <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                             <span className="text-lg font-black text-white leading-none">OPTIMAL</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-2">Global Synapses</span>
                        <span className="text-3xl font-black text-brand-cyan leading-none">{projects.length}</span>
                    </div>
                </div>
            </div>
            
            <BarChart data={businessMetrics} title="Production Funnel" subtitle="SaaS Lifecycle & IP Protection metrics" />

            <div className="space-y-6">
                <div className="flex justify-between items-center bg-gray-900/40 p-4 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-black text-brand-light tracking-tight uppercase italic flex items-center gap-3">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m14.506 0A11.954 11.954 0 0012 20.12a11.954 11.954 0 00-8.618-11.724" /></svg>
                        Encrypted Audit Ledger
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-green-500">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        LIVE AUDIT SYNC
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div className="relative">
                        <input
                            type="text"
                            placeholder="Search sovereign ledger..."
                            value={logSearchTerm}
                            onChange={(e) => setLogSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border-2 border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 focus:ring-brand-cyan focus:border-brand-cyan transition-all outline-none"
                        />
                     </div>
                     <select
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value as any)}
                        className="bg-gray-900 border-2 border-gray-800 text-gray-300 text-xs font-bold uppercase tracking-widest rounded-xl focus:ring-purple-500 px-4"
                    >
                        <option value="ALL">All Severities</option>
                        <option value="INFO">Info</option>
                        <option value="WARN">Warning</option>
                        <option value="ERROR">Error</option>
                    </select>
                     <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="bg-gray-900 border-2 border-gray-800 text-gray-300 text-xs font-bold uppercase tracking-widest rounded-xl focus:ring-purple-500 px-4"
                    >
                        <option value="ALL">All Tenants</option>
                        {uniqueUsers.map(user => <option key={user} value={user}>{user}</option>)}
                    </select>
                </div>

                 <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left table-fixed border-collapse">
                            <thead className="bg-gray-950 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] sticky top-0 z-10 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 w-[22%]">Timestamp</th>
                                    <th className="px-6 py-4 w-[18%]">Auth Identity</th>
                                    <th className="px-6 py-4 w-[12%]">Level</th>
                                    <th className="px-6 py-4 w-[48%]">Event Description</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-400 text-xs font-mono">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-gray-600 font-sans italic">No historical events match current filter profile.</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors group">
                                            <td className="px-6 py-4 text-gray-500 group-hover:text-gray-300 transition-colors">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-cyan-500/70 group-hover:text-cyan-400 transition-colors truncate" title={log.user}>{log.user}</td>
                                            <td className="px-6 py-4"><LogLevelPill level={log.level} /></td>
                                            <td className="px-6 py-4 text-gray-400 group-hover:text-gray-200 transition-colors truncate" title={log.message}>{log.message}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
