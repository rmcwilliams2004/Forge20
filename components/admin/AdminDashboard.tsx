
import React, { useState } from 'react';
import { User, ProjectIndexEntry, LogEntry, Role, Persona, ComputeEvent, IpAuditEntry } from '../../types';
import { Sidebar } from './Sidebar';
import { DashboardView } from './DashboardView';
import { UserManagementView } from './UserManagementView';
import { AnalyticsView } from './AnalyticsView';
import { PersonaManager } from './PersonaManager';
import { MonetizationView } from './MonetizationView';
import { SecurityAuditView } from './SecurityAuditView';
import { Activity, ShieldCheck, CreditCard, Users, Layers, BookOpen, Settings } from 'lucide-react';

interface AdminDashboardProps {
    authenticatedUser: User;
    users: User[];
    projects: ProjectIndexEntry[];
    logs: LogEntry[];
    personas: Persona[];
    computeEvents: ComputeEvent[];
    ipAuditLogs: IpAuditEntry[];
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onUpdatePersona: (persona: Persona) => void;
    onAddPersona: (persona: Persona) => void;
    onDeletePersona: (personaId: string) => void;
    onOpenTechDoc: () => void;
}

export type AdminViewType = 'overview' | 'users' | 'monetization' | 'security' | 'primes' | 'analytics';

export const AdminDashboard = (props: AdminDashboardProps) => {
    const [activeView, setActiveView] = useState<AdminViewType>('overview');

    const renderActiveView = () => {
        switch (activeView) {
            case 'overview':
                return <DashboardView users={props.users} projects={props.projects} logs={props.logs} />;
            case 'users':
                return <UserManagementView authenticatedUser={props.authenticatedUser} users={props.users} onUpdateUser={props.onUpdateUser} onDeleteUser={props.onDeleteUser} />;
            case 'monetization':
                return <MonetizationView users={props.users} events={props.computeEvents} onUpdateUser={props.onUpdateUser} />;
            case 'security':
                return <SecurityAuditView logs={props.ipAuditLogs} users={props.users} />;
            case 'primes':
                return <PersonaManager personas={props.personas} onUpdate={props.onUpdatePersona} onAdd={props.onAddPersona} onDelete={props.onDeletePersona} />;
            case 'analytics':
                 return <AnalyticsView logs={props.logs} projects={props.projects} />;
            default:
                return <DashboardView users={props.users} projects={props.projects} logs={props.logs} />;
        }
    }

    return (
        <div className="flex h-full bg-slate-50 overflow-hidden">
            {/* Command Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-cyan rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-900/20">
                        <Settings className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">Command <span className="text-brand-cyan">Core</span></h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SF Control Center</p>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <NavButton active={activeView === 'overview'} onClick={() => setActiveView('overview')} icon={Activity} label="Strategic Overview" />
                    <NavButton active={activeView === 'users'} onClick={() => setActiveView('users')} icon={Users} label="Identity Ledger" />
                    <NavButton active={activeView === 'monetization'} onClick={() => setActiveView('monetization')} icon={CreditCard} label="Compute & Billing" />
                    <NavButton active={activeView === 'security'} onClick={() => setActiveView('security')} icon={ShieldCheck} label="Sovereign Security" />
                    <NavButton active={activeView === 'primes'} onClick={() => setActiveView('primes')} icon={Layers} label="Council Foundry" />
                    <div className="h-px bg-slate-100 my-6" />
                    <NavButton active={false} onClick={props.onOpenTechDoc} icon={BookOpen} label="Technical Library" />
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                        <img src={props.authenticatedUser.picture} className="w-10 h-10 rounded-full border-2 border-brand-cyan" alt="Admin" />
                        <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate uppercase">{props.authenticatedUser.name}</p>
                            <p className="text-[9px] text-brand-cyan font-black uppercase tracking-widest">{props.authenticatedUser.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Stage Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* System Status Bar */}
                <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Grid Status: Operational</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NAL Precision Layer: 0.001 SEN</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ledger Sync</span>
                        <span className="text-[9px] font-mono text-slate-500">{new Date().toLocaleTimeString()}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {renderActiveView()}
                </div>
            </main>
        </div>
    );
};

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-black text-[11px] uppercase tracking-widest ${
            active 
            ? 'bg-slate-100 text-brand-cyan shadow-sm border border-slate-200' 
            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
        }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-brand-cyan' : 'text-slate-300'}`} />
        {label}
    </button>
);
