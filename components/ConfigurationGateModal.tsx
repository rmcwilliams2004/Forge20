import React, { useState } from 'react';
import { DomainCategory, EngineeringBranch } from '../types';
import { Modal } from './Modal';

interface ConfigurationGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onForge: (config: { name: string, category: DomainCategory, branch: EngineeringBranch, description: string }) => void;
}

export const ConfigurationGateModal: React.FC<ConfigurationGateModalProps> = ({ isOpen, onClose, onForge }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [category, setCategory] = useState<DomainCategory>(DomainCategory.GENERAL_INNOVATION);
    const [branch, setBranch] = useState<EngineeringBranch>(EngineeringBranch.GENERAL);
    const [description, setDescription] = useState('');

    const handleForge = () => {
        if (!name.trim()) return;
        onForge({ name, category, branch, description });
        setStep(1);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sovereign Vault Calibration"
            confirmText={step < 3 ? "Next Sequence" : "Forge Environment"}
            onConfirm={() => step < 3 ? setStep(s => s + 1) : handleForge()}
            cancelText={step === 1 ? "Discard" : "Back"}
        >
            <div className="space-y-6 py-2">
                {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-3 bg-cyan-900/20 border-l-4 border-brand-cyan rounded">
                            <p className="text-xs text-brand-cyan font-bold uppercase tracking-widest">Protocol: Blank Forge</p>
                            <p className="text-[10px] text-gray-400 mt-1">Initialize a clean-slate vault. All disciplinary constraints are derived from your inputs.</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Asset Identity</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-brand-cyan outline-none"
                                placeholder="Project Name..."
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Goal Abstract</label>
                            <textarea 
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-brand-cyan outline-none"
                                placeholder="High-level project objective..."
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <label className="block text-[10px] font-black text-brand-cyan uppercase tracking-widest text-center mb-4">Select Core Synthesis Engine</label>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.values(DomainCategory).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${category === cat ? 'border-brand-cyan bg-brand-cyan/10 shadow-lg shadow-cyan-900/20' : 'border-gray-700 bg-gray-900/40 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-white uppercase tracking-tight">{cat}</span>
                                        {category === cat && <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse"></div>}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {cat === DomainCategory.APPLIED_PHYSICS && 'Optimized for thermal, mechanical, and structural tensors.'}
                                        {cat === DomainCategory.LOGIC_SYSTEMS && 'Calibrated for recursive systemic deconstruction and protocol mapping.'}
                                        {cat === DomainCategory.GENERAL_INNOVATION && 'Universal synthesis engine for multi-disciplinary R&D.'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-fade-in">
                        <label className="block text-[10px] font-black text-brand-cyan uppercase tracking-widest text-center mb-4">Assign PhD Disciplinary Agent</label>
                        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {Object.values(EngineeringBranch).map(br => (
                                <button
                                    key={br}
                                    onClick={() => setBranch(br)}
                                    className={`p-3 rounded-lg border text-xs font-bold transition-all ${branch === br ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-500'}`}
                                >
                                    {br}
                                </button>
                            ))}
                        </div>
                        <p className="text-[9px] text-center text-gray-500 uppercase tracking-widest mt-4">Security Note: Tenant Isolation is enforced at the NAL layer.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
