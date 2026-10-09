import React, { useState, useRef, useEffect } from 'react';
import { Role, User, Milestone } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { Bell, Box, ShieldCheck, Cpu, Flame, CheckCircle2, Trash2, ArrowRight, Workflow } from 'lucide-react';

interface HeaderProps {
    onStartTour: () => void;
    onOpenUserManual: () => void;
    authenticatedUser: User | null;
    onLogout: () => void;
    onOpenProfile: () => void;
    viewMode: 'app' | 'admin' | 'suite' | 'pricing' | 'account' | 'neural' | 'telemetry';
    onSwitchView: (view: 'app' | 'admin' | 'suite' | 'pricing' | 'account' | 'neural' | 'telemetry') => void;
    onMobileDiagnostics?: () => void;
}

const ViewToggle = ({ mode, currentMode, onSwitch, icon, label }: { mode: 'app' | 'admin' | 'suite' | 'pricing' | 'account' | 'neural' | 'telemetry', currentMode: string, onSwitch: (v: any) => void, icon: React.ReactNode, label: string }) => {
    const isActive = mode === currentMode;
    return (
        <button
            onClick={() => onSwitch(mode)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 relative z-10 ${
                isActive 
                    ? (mode === 'neural' ? 'bg-orange-600 text-white shadow-md shadow-orange-950/30' : 'bg-brand-cyan text-white shadow-md') 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-brand-light hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
        >
            <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
                {icon}
            </span>
            <span className="hidden md:inline">{label}</span>
        </button>
    );
};

export const Header = ({ onStartTour, onOpenUserManual, authenticatedUser, onLogout, onOpenProfile, viewMode, onSwitchView, onMobileDiagnostics }: HeaderProps) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [hasKey, setHasKey] = useState(false);
    const [milestonesHistory, setMilestonesHistory] = useState<Milestone[]>([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    // Fix: Changed NodeJS.Timeout to number to resolve "Cannot find namespace 'NodeJS'" error in browser environment
    const longPressTimer = useRef<number | null>(null);

    // Listen for compute milestones
    useEffect(() => {
        const handleMilestoneEvent = (e: any) => {
            const data: Milestone = e.detail;
            if (data) {
                setMilestonesHistory(prev => [data, ...prev.filter(m => m.id !== data.id)].slice(0, 10));
                setUnreadCount(prev => prev + 1);
            }
        };
        window.addEventListener('forge-milestone', handleMilestoneEvent);
        return () => window.removeEventListener('forge-milestone', handleMilestoneEvent);
    }, []);

    const handleTouchStart = () => {
        if (authenticatedUser?.role === Role.Admin && onMobileDiagnostics) {
            // Fix: Use window.setTimeout for number return type in browser
            longPressTimer.current = window.setTimeout(() => {
                onMobileDiagnostics();
                // Vibration feedback if supported
                if ('vibrate' in navigator) navigator.vibrate(50);
            }, 1000);
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const checkKeyStatus = async () => {
        if (typeof (window as any).aistudio !== 'undefined') {
            const status = await (window as any).aistudio.hasSelectedApiKey();
            setHasKey(status);
        }
    };

    const handleSelectKey = async () => {
        if (typeof (window as any).aistudio !== 'undefined') {
            await (window as any).aistudio.openSelectKey();
            setHasKey(true);
        }
    };

    useEffect(() => {
        checkKeyStatus();
        const interval = setInterval(checkKeyStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!authenticatedUser) return null;

    const getSubtitle = () => {
        switch(viewMode) {
            case 'admin': return 'Administration Dashboard';
            case 'suite': return 'Engineering Tool Suite';
            case 'pricing': return 'Sovereign Licensing';
            case 'account': return 'Identity Settings';
            case 'app':
            default: return 'Reverse Engineering Workspace';
        }
    }

    const canAccessAdmin = [Role.Admin, Role.Manager].includes(authenticatedUser.role);

    return (
      <header className="py-4 px-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <svg className="w-9 h-9 text-brand-cyan" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="3.5" fill="currentColor"/>
          </svg>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-brand-light tracking-tight leading-none italic">
              SYNAPSE<span className="text-brand-cyan">FORGE</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-bold mt-1">{getSubtitle()}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 relative">
            <ViewToggle 
                mode="app" 
                currentMode={viewMode === 'pricing' || viewMode === 'account' ? 'app' : viewMode} 
                onSwitch={onSwitchView} 
                label="Workspace"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>}
            />
            <ViewToggle 
                mode="neural" 
                currentMode={viewMode} 
                onSwitch={onSwitchView} 
                label="Neural Forge"
                icon={<Flame className="w-4 h-4 text-orange-400" />}
            />
            <ViewToggle 
                mode="telemetry" 
                currentMode={viewMode} 
                onSwitch={onSwitchView} 
                label="Live Telemetry"
                icon={<Workflow className="w-4 h-4 text-cyan-400" />}
            />
            {canAccessAdmin ? (
                <>
                <ViewToggle 
                    mode="suite" 
                    currentMode={viewMode} 
                    onSwitch={onSwitchView} 
                    label="Tool Suite"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.829-5.83m-4.251 4.251-.524.524a2.5 2.5 0 0 1-3.536 0l-1.414-1.414a2.5 2.5 0 0 1 0-3.536l.524-.524m4.251 4.251.488-.488a2.5 2.5 0 0 0 0-3.536l-.488-.489m4.251 4.251a2.5 2.5 0 0 1-3.536 0l-.489-.488m4.251 4.251.524-.524a2.5 2.5 0 0 0 0-3.536l-1.414-1.414a2.5 2.5 0 0 0-3.536 0l-.524.524" /></svg>}
                />
                <ViewToggle 
                    mode="admin" 
                    currentMode={viewMode} 
                    onSwitch={onSwitchView} 
                    label="Admin Console"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>}
                />
                </>
            ) : (
                <>
                <div className="flex-1 px-4 py-2 pointer-events-none opacity-0" aria-hidden="true">Placeholder</div>
                <div className="flex-1 px-4 py-2 pointer-events-none opacity-0" aria-hidden="true">Placeholder</div>
                </>
            )}
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
                <button
                    onClick={handleSelectKey}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${hasKey ? 'bg-green-900/20 text-green-400 border-green-500/50' : 'bg-red-900/20 text-red-400 border-red-500/50 animate-pulse'}`}
                    title={hasKey ? "Gemini API Key Connected" : "Action Required: Connect Gemini API Key"}
                >
                    <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-400' : 'bg-red-400 animate-ping'}`} />
                    {hasKey ? 'API Active' : 'Connect Key'}
                </button>
                <button onClick={onOpenUserManual} className="p-2 text-gray-500 dark:text-gray-400 hover:text-brand-cyan transition-colors" title="User Manual">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                </button>
                <button onClick={onStartTour} className="p-2 text-gray-500 dark:text-gray-400 hover:text-brand-cyan transition-colors" title="Interactive Tour">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
                </button>

                {/* Milestone Notification Center */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => {
                            setIsNotificationOpen(!isNotificationOpen);
                            setUnreadCount(0);
                        }}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-brand-cyan transition-colors relative"
                        title="Compute Milestone Alerts"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotificationOpen && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
                            <div className="p-4 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-brand-cyan" />
                                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                        Compute Milestone Alerts
                                    </h4>
                                </div>
                                {milestonesHistory.length > 0 && (
                                    <button
                                        onClick={() => setMilestonesHistory([])}
                                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/80">
                                {milestonesHistory.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-gray-400">
                                        <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-cyan" />
                                        <p className="font-bold text-gray-700 dark:text-gray-300">No compute milestones yet.</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Foundry synthesis, Genesis audits, and solver sessions will notify here.</p>
                                    </div>
                                ) : (
                                    milestonesHistory.map((m) => (
                                        <div key={m.id} className="p-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                                                    {m.type.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-400">
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                                                {m.title}
                                            </h5>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                                {m.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100 dark:border-slate-800 text-[10px]">
                                                {m.projectName ? (
                                                    <span className="text-gray-400 truncate max-w-[180px]">
                                                        Project: <strong className="text-gray-700 dark:text-gray-300">{m.projectName}</strong>
                                                    </span>
                                                ) : <span />}
                                                {m.cost !== undefined && (
                                                    <span className="font-mono font-bold text-brand-cyan">
                                                        -${m.cost.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 border-t border-gray-200 dark:border-slate-800 text-center">
                                <button
                                    onClick={() => {
                                        onSwitchView('app');
                                        setIsNotificationOpen(false);
                                    }}
                                    className="text-xs font-bold text-brand-cyan hover:underline inline-flex items-center gap-1"
                                >
                                    <span>Open Active Project Timeline</span>
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <ThemeToggle />
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            </div>

            <div className="relative" ref={profileRef}>
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="flex items-center gap-2.5 p-1 pr-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                    <img src={authenticatedUser.picture} alt={authenticatedUser.name} className="w-8 h-8 rounded-full border-2 border-brand-cyan shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                    <span className="hidden sm:inline font-bold text-gray-700 dark:text-brand-light text-sm">{authenticatedUser.name.split(' ')[0]}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </button>
                {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vault Status</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{authenticatedUser.subscriptionStatus}</p>
                        </div>
                        <div className="p-1">
                            <button onClick={() => { onOpenProfile(); setIsProfileOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-cyan hover:text-white rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                Identity Settings
                            </button>
                            <button onClick={() => { onSwitchView('pricing'); setIsProfileOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-cyan hover:text-white rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                Manage Licensing
                            </button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            <button onClick={onLogout} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                                Secure Log Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </header>
    );
}