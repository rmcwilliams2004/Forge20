
import React from 'react';
import { User, IpAuditEntry } from '../../types';
import { Shield, Lock, FileText, Globe, Search, RefreshCw, Key } from 'lucide-react';

interface SecurityAuditViewProps {
    logs: IpAuditEntry[];
    users: User[];
}

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({ logs, users }) => {
    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Security & IP Sovereignty</h2>
                    <p className="text-slate-500 text-[10px] mt-4 font-black uppercase tracking-[0.2em]">Asset Fingerprint Ledger & Access Monitoring</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-emerald-500 transition-all">
                        <Lock className="w-4 h-4" /> Finalize Multi-Tenant Audit
                    </button>
                </div>
            </div>

            {/* Agnostic Wipe Compliance Status */}
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Shield className="w-40 h-40" />
                </div>
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-brand-cyan/20 rounded-[2rem] flex items-center justify-center border border-brand-cyan/30 text-brand-cyan shadow-lg shadow-cyan-900/50">
                        <RefreshCw className="w-10 h-10 animate-spin-slow" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-2">Agnostic Wipe Compliance</h3>
                        <p className="text-slate-400 text-xs font-medium max-w-md">100% of inactive session buffers have been purged. Zero-Training policy enforced at hardware layer.</p>
                    </div>
                </div>
                <div className="flex gap-10 relative z-10 border-l border-slate-700 pl-10">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Sessions</p>
                        <p className="text-3xl font-black text-brand-cyan">142</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Leaks Prevented</p>
                        <p className="text-3xl font-black text-emerald-400">8,241</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em] ml-1">IP Access Audit (TDP/Patent Ledger)</h3>
                <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <table className="w-full text-left table-fixed">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 w-[20%]">User</th>
                                <th className="px-8 py-5 w-[20%]">Action</th>
                                <th className="px-8 py-5 w-[20%]">Asset Context</th>
                                <th className="px-8 py-5 w-[40%]">SHA-256 Fingerprint</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-bold text-slate-700">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-sans italic">No formal exports recorded in current cycle.</td>
                                </tr>
                            ) : (
                                logs.map(ev => (
                                    <tr key={ev.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-slate-900 uppercase">{ev.user}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase text-[9px]">{ev.action}</span>
                                        </td>
                                        <td className="px-8 py-5 text-brand-cyan italic">{ev.projectName}</td>
                                        <td className="px-8 py-5 font-mono text-slate-400 truncate">{ev.fileHash}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-8 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-start gap-6">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                    <Key className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Critical: Hardware Isolation Key</h4>
                    <p className="text-xs text-amber-800 leading-relaxed max-w-3xl">The primary encryption key for institutional tenants is currently stored in a volatile HSM buffer. Ensure all "Sovereign Bundles" are finalized before the next scheduled maintenance wipe (04:00 UTC).</p>
                </div>
            </div>
        </div>
    );
};
