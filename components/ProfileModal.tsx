import React, { useState, useEffect } from 'react';
import { User, ProtectionTypePref, SubscriptionStatus } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: User) => void;
  onNavigateToPricing: () => void;
  onNavigateToAccount: () => void;
}

const RolePill = ({ role }: { role: string }) => {
    const roleColors: { [key: string]: string } = {
        'Admin': 'bg-purple-600 text-purple-100',
        'Manager': 'bg-teal-600 text-teal-100',
        'Editor': 'bg-blue-600 text-blue-100',
        'Viewer': 'bg-gray-600 text-gray-100',
    };
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${roleColors[role]}`}>{role}</span>;
}

const PlanBadge = ({ status }: { status: SubscriptionStatus }) => {
    const colors: Record<SubscriptionStatus, string> = {
        [SubscriptionStatus.FREE]: 'bg-gray-700 text-gray-400 border-gray-600',
        [SubscriptionStatus.PRO_TRIAL]: 'bg-cyan-900/30 text-cyan-400 border-cyan-800',
        [SubscriptionStatus.PRO_ACTIVE]: 'bg-cyan-600 text-white border-cyan-500',
        [SubscriptionStatus.ENTERPRISE]: 'bg-purple-600 text-white border-purple-500',
        [SubscriptionStatus.EXPIRED]: 'bg-red-900/30 text-red-400 border-red-800',
    };
    return <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border rounded ${colors[status]}`}>{status.replace('_', ' ')}</span>;
}

export const ProfileModal = ({ isOpen, onClose, user, onSave, onNavigateToPricing, onNavigateToAccount }: ProfileModalProps) => {
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: user.name,
                company_name: user.company_name || '',
                legal_identity: user.legal_identity || '',
                use_company_attribution: user.use_company_attribution || false,
                default_protection_pref: user.default_protection_pref || 'AI_RECOMMENDED',
            });
        }
    }, [isOpen, user]);

    const handleSave = () => {
        if (!formData.name?.trim()) {
            alert('Name cannot be empty.');
            return;
        }
        onSave({ ...user, ...formData } as User);
        onClose();
    };

    if (!isOpen) return null;

    const currentYear = new Date().getFullYear();
    const activeAttribution = formData.use_company_attribution ? (formData.company_name || formData.name) : (formData.legal_identity || formData.name);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in" style={{ animationDuration: '0.2s' }} onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-700 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-brand-light">SaaS Identity & IP Branding</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl font-bold">&times;</button>
                </div>
                
                <div className="flex items-center gap-6 mb-8 p-4 bg-gray-900/40 rounded-xl border border-gray-700">
                    <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full border-4 border-gray-600 shadow-xl" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="text-xl font-bold text-white leading-none">{formData.name}</h3>
                             <PlanBadge status={user.subscriptionStatus} />
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{user.email}</p>
                        <div className="flex items-center gap-2">
                            <RolePill role={user.role} />
                            <button onClick={onNavigateToPricing} className="text-xs text-brand-cyan hover:underline font-bold">Change Plan</button>
                            <span className="text-gray-600 text-xs px-1">|</span>
                            <button onClick={onNavigateToAccount} className="text-xs text-brand-cyan hover:underline font-bold">Full Settings</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-700 pb-2">Tenant Details</h4>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Display Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan"
                            />
                        </div>
                    </div>

                    {/* Legal/IP Info */}
                    <div className="space-y-6 pt-2">
                        <h4 className="text-xs font-black text-brand-cyan uppercase tracking-widest border-b border-cyan-900/50 pb-2 flex justify-between items-center">
                            <span>Intellectual Property Strategy</span>
                            <span className="text-[10px] text-gray-500 lowercase normal-case font-normal">(Dynamic Legal Concierge Active)</span>
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Legal Name (Individual)</label>
                                <input
                                    type="text"
                                    value={formData.legal_identity}
                                    onChange={e => setFormData({ ...formData, legal_identity: e.target.value })}
                                    placeholder="e.g., Richard McWilliams"
                                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Registered Company Name</label>
                                <input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                    placeholder="e.g., Forge Labs Global LLC"
                                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Default Protection Strategy</label>
                            <select
                                value={formData.default_protection_pref}
                                onChange={e => setFormData({ ...formData, default_protection_pref: e.target.value as ProtectionTypePref })}
                                className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan"
                            >
                                <option value="AI_RECOMMENDED">AI-Recommended (Context-Aware)</option>
                                <option value="PATENT">Strict Patent Filing (Non-Provisional)</option>
                                <option value="COPYRIGHT">Copyright Assertion (Source/Docs)</option>
                                <option value="TRADEMARK">Trademark/Branding Priority</option>
                            </select>
                        </div>
                        
                        <div className="p-4 bg-indigo-900/10 rounded-xl border border-indigo-500/20">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-bold text-brand-light group-hover:text-white transition-colors">Assign IP to Entity</p>
                                    <p className="text-xs text-gray-400 mt-1">When enabled, "Forge Labs Global LLC" (Company) will be the legal owner of records instead of your individual name.</p>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={formData.use_company_attribution}
                                        onChange={e => setFormData({...formData, use_company_attribution: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-cyan"></div>
                                </div>
                            </label>
                        </div>

                        {/* Live Legal Preview */}
                        <div className="bg-black/40 p-4 rounded-lg border-l-4 border-brand-cyan">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Live Asset Watermark Preview</p>
                            <div className="font-mono text-xs text-cyan-400/80 italic space-y-1">
                                <p>© {currentYear} {activeAttribution}. All Rights Reserved.</p>
                                <p>Encrypted Ledger ID: SYN-{user.id.slice(-6)}-{Date.now().toString().slice(-4)}</p>
                                <p>Protected via SynapseForge AI (PLaaS Tenant Layer)</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700">
                            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Analyses Run</span>
                            <span className="font-black text-2xl text-white">{user.analysesRun}</span>
                        </div>
                         <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700">
                            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Sync</span>
                            <span className="text-xs text-gray-300 block mt-2 font-mono">{new Date(user.lastActive).toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-10">
                    <button onClick={onClose} className="py-2.5 px-6 bg-gray-700 text-gray-300 font-bold rounded-lg hover:bg-gray-600 transition active:scale-95">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="py-2.5 px-8 bg-brand-cyan text-white font-black uppercase tracking-widest rounded-lg hover:bg-cyan-500 transition active:scale-95 shadow-lg shadow-cyan-900/40">
                        Update Identity
                    </button>
                </div>
            </div>
        </div>
    );
};
