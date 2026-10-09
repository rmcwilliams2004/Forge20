import React, { useState } from 'react';
import { User, EngineeringBranch, SubscriptionStatus } from '../types';

interface OnboardingFlowProps {
    user: User;
    onComplete: (updatedUser: User) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        legal_identity: user.name || '',
        company_name: '',
        use_company_attribution: false,
        branch: EngineeringBranch.GENERAL,
    });

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => Math.max(1, prev - 1));

    const handleTrialActivation = () => {
        setIsProcessing(true);
        // High-fidelity payment processing simulation
        setTimeout(() => {
            const updatedUser: User = {
                ...user,
                legal_identity: formData.legal_identity,
                company_name: formData.company_name,
                use_company_attribution: formData.use_company_attribution,
                branch: formData.branch,
                subscriptionStatus: SubscriptionStatus.PRO_TRIAL,
            };
            
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 7);
            updatedUser.trialEndsAt = trialEnd.toISOString();
            
            setIsProcessing(false);
            onComplete(updatedUser);
        }, 3000);
    };

    const handleSkip = () => {
        const updatedUser: User = {
            ...user,
            legal_identity: formData.legal_identity,
            company_name: formData.company_name,
            use_company_attribution: formData.use_company_attribution,
            branch: formData.branch,
            subscriptionStatus: SubscriptionStatus.FREE,
        };
        onComplete(updatedUser);
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-cyan/5 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[150px] rounded-full"></div>
            </div>

            <div className="w-full max-w-2xl bg-gray-900/60 backdrop-blur-3xl border border-gray-700/50 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.7)] overflow-hidden animate-fade-in flex flex-col h-[700px] z-10">
                {/* Progress Header */}
                <div className="bg-gray-900/40 p-8 flex justify-between items-center border-b border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all duration-500 ${step >= 1 ? 'bg-brand-cyan border-brand-cyan text-gray-900 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-gray-700 text-gray-600'}`}>1</div>
                        <div className={`h-1 w-12 rounded-full transition-all duration-700 ${step >= 2 ? 'bg-brand-cyan' : 'bg-gray-800'}`}></div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all duration-500 ${step >= 2 ? 'bg-brand-cyan border-brand-cyan text-gray-900 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-gray-700 text-gray-600'}`}>2</div>
                        <div className={`h-1 w-12 rounded-full transition-all duration-700 ${step >= 3 ? 'bg-brand-cyan' : 'bg-gray-800'}`}></div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all duration-500 ${step >= 3 ? 'bg-brand-cyan border-brand-cyan text-gray-900 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-gray-700 text-gray-600'}`}>3</div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block leading-none mb-1">Identity Protocol</span>
                        <span className="text-xs font-mono text-cyan-500/70 uppercase">Sovereign Forge Link</span>
                    </div>
                </div>

                <div className="flex-1 p-12 overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-10 animate-fade-in">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-brand-light tracking-tight leading-none uppercase italic">Identity Sovereignty</h2>
                                <p className="text-gray-400 text-lg leading-relaxed">Establish who should be the legal owner of record for the innovations created in this vault.</p>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setFormData({...formData, use_company_attribution: false})}
                                        className={`p-6 border-2 rounded-2xl transition-all text-left ${!formData.use_company_attribution ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan shadow-lg shadow-cyan-900/20' : 'border-gray-700 bg-gray-800/40 text-gray-500 hover:border-gray-600'}`}
                                    >
                                        <span className="block font-black uppercase tracking-widest text-sm mb-1">Individual</span>
                                        <span className="text-[10px] opacity-70">Attributed to you personally</span>
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, use_company_attribution: true})}
                                        className={`p-6 border-2 rounded-2xl transition-all text-left ${formData.use_company_attribution ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan shadow-lg shadow-cyan-900/20' : 'border-gray-700 bg-gray-800/40 text-gray-500 hover:border-gray-600'}`}
                                    >
                                        <span className="block font-black uppercase tracking-widest text-sm mb-1">Entity</span>
                                        <span className="text-[10px] opacity-70">Attributed to your organization</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] ml-1">
                                        {formData.use_company_attribution ? 'Registered Company Name' : 'Full Legal Identity'}
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full p-4 bg-black/40 text-white rounded-2xl border border-gray-700 focus:border-brand-cyan outline-none transition-all"
                                        value={formData.use_company_attribution ? formData.company_name : formData.legal_identity}
                                        onChange={e => {
                                            if (formData.use_company_attribution) setFormData({...formData, company_name: e.target.value});
                                            else setFormData({...formData, legal_identity: e.target.value});
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-10 animate-fade-in">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-brand-light tracking-tight leading-none uppercase italic">Domain Calibration</h2>
                                <p className="text-gray-400 text-lg leading-relaxed">Select your primary engineering discipline to calibrate the disciplinary PhD AI Agents for your first project.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {Object.values(EngineeringBranch).map(branch => (
                                    <button
                                        key={branch}
                                        onClick={() => setFormData({...formData, branch})}
                                        className={`group p-5 text-left rounded-2xl border-2 transition-all duration-300 ${formData.branch === branch ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan shadow-[0_10px_30px_rgba(6,182,212,0.1)]' : 'bg-black/20 border-gray-700/50 text-gray-500 hover:border-gray-600 hover:bg-black/40'}`}
                                    >
                                        <div className="text-xs font-black uppercase tracking-[0.2em] mb-2">{branch}</div>
                                        <div className="text-[10px] leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                                            {branch === EngineeringBranch.AEROSPACE && 'FAA/EASA Airworthiness Calibrations'}
                                            {branch === EngineeringBranch.NUCLEAR && 'IAEA Structural & Shielding focus'}
                                            {branch === EngineeringBranch.MECHANICAL && 'Fatigue & Dynamic Load Specialization'}
                                            {branch === EngineeringBranch.GENERAL && 'Standard Physical Reasoning Engine'}
                                            {![EngineeringBranch.AEROSPACE, EngineeringBranch.NUCLEAR, EngineeringBranch.MECHANICAL, EngineeringBranch.GENERAL].includes(branch) && 'Advanced Technical Ingestion Active'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-10 animate-fade-in">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-brand-light tracking-tight leading-none uppercase italic">Unlock Pro Features</h2>
                                <p className="text-gray-400 text-lg leading-relaxed">Join 2,400+ innovators securing their work with automated patent claims and IP certificates.</p>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-600 to-brand-cyan rounded-3xl p-10 text-white space-y-6 shadow-[0_25px_60px_rgba(6,182,212,0.25)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-1000">
                                    <svg className="w-40 h-40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Professional Plan</h3>
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mt-2">Multi-Tenant PLaaS Tier</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-black italic leading-none">$99<span className="text-sm font-normal">/mo</span></div>
                                            <p className="text-[10px] font-black uppercase opacity-60 mt-1">Starting in 7 days</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 text-sm font-black"><svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg> Automated Patent Drafts</div>
                                        <div className="flex items-center gap-3 text-sm font-black"><svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg> 10 Innovation Certs/mo</div>
                                        <div className="flex items-center gap-3 text-sm font-black"><svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg> Legal Identity Branding</div>
                                        <div className="flex items-center gap-3 text-sm font-black"><svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg> Full Ph.D RAG Library</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center gap-6">
                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Identity-Verified Trial activation</p>
                                <div className="flex gap-8 items-center opacity-40">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Google_Pay_Logo.svg" alt="GPay" className="h-6" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-10 bg-gray-900/80 border-t border-gray-800 flex justify-between gap-6 items-center">
                    {step > 1 ? (
                        <button onClick={handleBack} disabled={isProcessing} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors disabled:opacity-30">
                            Back
                        </button>
                    ) : <div />}

                    <div className="flex items-center gap-6">
                        {step === 3 && (
                            <button onClick={handleSkip} disabled={isProcessing} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                                Skip & Proceed as Free Tier
                            </button>
                        )}
                        
                        {step < 3 ? (
                            <button onClick={handleNext} className="px-14 py-4 bg-brand-cyan text-gray-900 font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-900/20">
                                Next Protocol
                            </button>
                        ) : (
                            <button 
                                onClick={handleTrialActivation} 
                                disabled={isProcessing}
                                className="px-14 py-4 bg-white text-gray-900 font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-3 relative overflow-hidden"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Establishing Sovereignty...
                                    </>
                                ) : (
                                    <>
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Google_Pay_Logo.svg" alt="GPay" className="h-5" />
                                        Start 7-Day Free Trial
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};