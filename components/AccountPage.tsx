import React, { useState, useEffect } from 'react';
import { User, SubscriptionStatus, ProtectionTypePref, Role } from '../types';

interface AccountPageProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onNavigateToPricing: () => void;
  onBack: () => void;
}

const StatBox = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
    <div className="bg-gray-900/40 border border-gray-700/50 p-6 rounded-2xl flex items-center gap-6 shadow-sm">
        <div className="p-3 bg-brand-cyan/10 rounded-xl text-brand-cyan">
            {Icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-2">{label}</p>
            <p className="text-2xl font-black text-white leading-none">{value}</p>
        </div>
    </div>
);

export const AccountPage: React.FC<AccountPageProps> = ({ user, onUpdate, onNavigateToPricing, onBack }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: user.name,
    legal_identity: user.legal_identity || '',
    company_name: user.company_name || '',
    use_company_attribution: user.use_company_attribution || false,
    default_protection_pref: user.default_protection_pref || 'AI_RECOMMENDED',
  });

  const [savedMaterialsCount, setSavedMaterialsCount] = useState(0);

  useEffect(() => {
    const STORAGE_KEY = `synapseforge_materials_${user.id}`;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const mats = JSON.parse(stored);
            setSavedMaterialsCount(mats.length || 0);
        } catch(e) {}
    }
  }, [user.id]);

  const handleSave = () => {
    if (!formData.name?.trim()) {
        alert("Display name cannot be empty.");
        return;
    }
    onUpdate({ ...user, ...formData } as User);
    alert('Sovereign identity profile updated successfully.');
  };

  const currentYear = new Date().getFullYear();
  const attributionPreview = formData.use_company_attribution ? (formData.company_name || formData.name) : (formData.legal_identity || formData.name);

  return (
    <div className="min-h-screen bg-brand-dark p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-gray-800 pb-8">
          <div>
            <button 
                onClick={onBack}
                className="mb-4 flex items-center gap-2 text-gray-500 hover:text-brand-cyan transition-colors text-xs font-black uppercase tracking-widest"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                Back to Forge
            </button>
            <h1 className="text-4xl font-black text-brand-light tracking-tighter italic uppercase">Identity Management</h1>
            <p className="text-gray-500 mt-2 font-medium">Configure your professional PLaaS identity and innovation sovereignty settings.</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={onBack}
                className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors text-sm font-bold"
            >
                Discard
            </button>
            <button 
                onClick={handleSave}
                className="px-10 py-2.5 bg-brand-cyan text-gray-900 font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
            >
                Save Protocol
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Summary & Navigation */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-gray-800/40 backdrop-blur-md p-8 rounded-3xl border border-gray-700/50 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${user.subscriptionStatus === SubscriptionStatus.FREE ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'}`}>
                            {user.subscriptionStatus.replace('_', ' ')}
                        </span>
                    </div>
                    
                    <img src={user.picture} alt={user.name} className="w-28 h-28 rounded-full mx-auto border-4 border-brand-cyan shadow-xl shadow-cyan-900/20 mb-6" />
                    <h2 className="text-2xl font-black text-white tracking-tight">{user.name}</h2>
                    <p className="text-sm text-gray-500 font-medium mb-6">{user.email}</p>
                    
                    <div className="p-4 bg-black/30 rounded-2xl border border-gray-700/30 text-left mb-6">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Account ID</span>
                             <span className="text-[10px] font-mono text-brand-cyan">SF-{user.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Member Since</span>
                             <span className="text-[10px] font-mono text-white">JAN 2024</span>
                        </div>
                    </div>

                    <button 
                        onClick={onNavigateToPricing}
                        className="w-full py-4 bg-gray-700/50 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-700 transition-all border border-gray-600/50"
                    >
                        Manage Subscription
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <StatBox label="Analyses Performed" value={user.analysesRun} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-3.515 1.058l-1.574-1.574a2 2 0 00-2.828 0l-1.574 1.574a2 2 0 01-3.515-1.058l.727-2.903a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-1.574-1.574a2 2 0 010-2.828l1.574-1.574a2 2 0 00.547-1.022l.477-2.387a2 2 0 00-1.414-1.96L.727 7.071a2 2 0 01-1.058-3.515l1.574-1.574a2 2 0 000-2.828l-1.574-1.574a2 2 0 011.058-3.515l2.903.727a2 2 0 001.96-1.414l.477-2.387a2 2 0 001.022-.547l1.574 1.574a2 2 0 012.828 0l1.574-1.574a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.727-2.903a2 2 0 013.515-1.058l1.574 1.574a2 2 0 002.828 0l1.574-1.574a2 2 0 013.515 1.058l-.727 2.903a2 2 0 001.96 1.414l2.387-.477a2 2 0 001.022-.547l1.574 1.574a2 2 0 010 2.828l-1.574 1.574a2 2 0 00-.547 1.022l-.477 2.387a2 2 0 001.414 1.96l2.903.727a2 2 0 011.058 3.515l-1.574 1.574a2 2 0 000 2.828l1.574 1.574a2 2 0 01-1.058 3.515l-2.903-.727a2 2 0 00-1.96 1.414l-.477 2.387z" /></svg>} />
                    <StatBox label="Custom Tensors" value={savedMaterialsCount} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75" /></svg>} />
                    <StatBox label="Certificates Secured" value={user.certificatesGenerated || 0} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m14.506 0A11.954 11.954 0 0012 20.12a11.954 11.954 0 00-8.618-11.724" /></svg>} />
                </div>
            </div>

            {/* Right Col: Detailed Settings */}
            <div className="lg:col-span-8 space-y-8">
                {/* Identity Form */}
                <section className="bg-gray-800/40 backdrop-blur-md p-10 rounded-3xl border border-gray-700/50 shadow-2xl">
                    <h3 className="text-xl font-black text-brand-cyan mb-8 uppercase tracking-widest flex items-center gap-3 italic">
                        <span className="w-2 h-2 bg-brand-cyan rounded-full shadow-[0_0_10px_#06b6d4]"></span>
                        Legal Identity & Attribution
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                            <input 
                                type="text" 
                                value={formData.legal_identity}
                                onChange={e => setFormData({...formData, legal_identity: e.target.value})}
                                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white focus:border-brand-cyan outline-none transition-all shadow-inner"
                                placeholder="Your personal identifier for patents"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Entity Name (Company)</label>
                            <input 
                                type="text" 
                                value={formData.company_name}
                                onChange={e => setFormData({...formData, company_name: e.target.value})}
                                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white focus:border-brand-cyan outline-none transition-all shadow-inner"
                                placeholder="e.g. Forge Labs Global LLC"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-900/10 rounded-2xl border border-indigo-500/20 mb-8">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <p className="text-sm font-black text-white uppercase tracking-wider group-hover:text-brand-cyan transition-colors">Default to Entity Attribution</p>
                                <p className="text-xs text-gray-400 mt-1 max-w-md">Automatically assign IP ownership to the registered company for all new innovation synapses.</p>
                            </div>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={formData.use_company_attribution}
                                    onChange={e => setFormData({...formData, use_company_attribution: e.target.checked})}
                                />
                                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-cyan"></div>
                            </div>
                        </label>
                    </div>

                    <div className="bg-black/40 p-6 rounded-2xl border-l-4 border-brand-cyan shadow-inner">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Sovereignty Preview</h4>
                            <span className="text-[9px] font-bold text-brand-cyan/50 animate-pulse">ENCRYPTING...</span>
                        </div>
                        <div className="font-mono text-xs text-cyan-400/80 italic space-y-1">
                            <p>© {currentYear} {attributionPreview}. All Rights Reserved.</p>
                            <p className="text-[10px] opacity-60">FINGERPRINT ID: SF-LEDGER-{(Date.now()/1000).toFixed(0)}-{user.id.slice(-4).toUpperCase()}</p>
                            <p className="text-[10px] opacity-60">PROTECTED VIA SYNAPSEFORGE AES-256 PLaaS LAYER</p>
                        </div>
                    </div>
                </section>

                {/* Preferences Form */}
                <section className="bg-gray-800/40 backdrop-blur-md p-10 rounded-3xl border border-gray-700/50 shadow-2xl">
                    <h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3 italic">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        Platform Preferences
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Primary Protection Strategy</label>
                            <select 
                                value={formData.default_protection_pref}
                                onChange={e => setFormData({...formData, default_protection_pref: e.target.value as ProtectionTypePref})}
                                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white focus:border-brand-cyan outline-none transition-all"
                            >
                                <option value="AI_RECOMMENDED">AI-RECOMMENDED (PHD AGENT SELECT)</option>
                                <option value="PATENT">UTILITY PATENT (NON-PROVISIONAL)</option>
                                <option value="COPYRIGHT">COPYRIGHT ASSERTION (LOGIC & DOCS)</option>
                                <option value="TRADEMARK">TRADEMARK PRIORITY (BRAND ASSETS)</option>
                            </select>
                            <p className="text-[10px] text-gray-500 ml-1">This preference calibrates how the IP Synthesis module drafts your formal claims.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Assigned Role</span>
                                <span className="text-sm font-bold text-indigo-400">{user.role}</span>
                            </div>
                            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Disciplinary Domain</span>
                                <span className="text-sm font-bold text-teal-400">{user.branch}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
};
