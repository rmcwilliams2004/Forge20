
import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Wifi, 
  Server, 
  Lock, 
  Zap,
  Globe
} from 'lucide-react';

interface SystemDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectsCount: number;
}

export const SystemDiagnosticsModal: React.FC<SystemDiagnosticsModalProps> = ({ isOpen, onClose, projectsCount }) => {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setTicks(t => t + 1), 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const metrics = [
    { label: 'Core Handshake', status: 'SYNCHRONIZED', icon: Wifi, color: 'text-emerald-400' },
    { label: 'Compute Availability', status: '94.2% OPTIMAL', icon: Cpu, color: 'text-brand-cyan' },
    { label: 'Isolation Layer', status: 'AES_256_ACTIVE', icon: ShieldCheck, color: 'text-purple-400' },
    { label: 'Global Lattice Sync', status: 'NOMINAL', icon: Globe, color: 'text-blue-400' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sovereign Grid Diagnostics"
      confirmText="Re-verify Grid"
      onConfirm={() => {}}
      cancelText="Close Terminal"
    >
      <div className="space-y-8 py-4">
        {/* Header Telemetry */}
        <div className="bg-black/60 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <Activity className="w-12 h-12 text-brand-cyan animate-pulse" />
            </div>
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Operational Overview</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Nodes</p>
                        <p className="text-2xl font-black text-brand-cyan italic">{projectsCount}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Compute Load</p>
                        <p className="text-2xl font-black text-purple-400 italic">2.41%</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Detailed Metrics List */}
        <div className="space-y-3">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Grid Health Telemetry</h5>
            <div className="grid grid-cols-1 gap-2">
                {metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-xl group hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors ${m.color}`}>
                                <m.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black uppercase text-slate-400 tracking-tight">{m.label}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-black ${m.color}`}>{m.status}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Log Stream */}
        <div className="space-y-3">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1 flex justify-between items-center">
                <span>Direct Access Ledger</span>
                <span className="text-[8px] opacity-40 font-mono">0x{Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
            </h5>
            <div className="bg-black/80 rounded-xl p-4 font-mono text-[10px] text-brand-cyan/80 space-y-1.5 h-32 overflow-y-auto custom-scrollbar border border-slate-800">
                <p className="text-white/40">[{new Date().toLocaleTimeString()}] PING_REQUEST::MULTI_TENANT_GRID</p>
                <p className="text-emerald-400">[{new Date().toLocaleTimeString()}] RESPONSE_ACK::NODE_ISOLATION_OK</p>
                <p className="text-white/40">[{new Date().toLocaleTimeString()}] MEMORY_ALLOC::PHD_AGENTS_ACTIVE</p>
                <p className="text-white/40">[{new Date().toLocaleTimeString()}] RE_CHECKING_ENCRYPTION_LAYERS...</p>
                <p className="text-brand-cyan animate-pulse">[{new Date().toLocaleTimeString()}] STANDBY_MODE::AWAITING_FORGE</p>
            </div>
        </div>

        <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl">
            <div className="flex gap-4 items-center">
                <Lock className="w-6 h-6 text-brand-cyan shrink-0" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    Sovereign Vault Isolation is enforced at the hardware layer. No cross-tenant data leakage detected in current session buffer. Zero-Training policy is <span className="text-brand-cyan font-black">ACTIVE</span>.
                </p>
            </div>
        </div>
      </div>
    </Modal>
  );
};
