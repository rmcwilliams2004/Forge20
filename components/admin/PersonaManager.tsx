
import React, { useState, useRef } from 'react';
import { Persona, PersonaId } from '../../types';
import { enhancePersonaWithSearch, parseApiError } from '../../services/geminiService';
import { Modal } from '../Modal';
import { Sparkles, Edit, Trash2, Plus, Upload, Loader2, BookOpen, Brain, Zap } from 'lucide-react';

interface PersonaManagerProps {
    personas: Persona[];
    onUpdate: (persona: Persona) => void;
    onAdd: (persona: Persona) => void;
    onDelete: (personaId: string) => void;
}

export const PersonaManager: React.FC<PersonaManagerProps> = ({ personas, onUpdate, onAdd, onDelete }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPersona, setEditingPersona] = useState<Partial<Persona> | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEdit = (persona: Persona) => {
        setEditingPersona({ ...persona });
        setIsEditModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingPersona({
            id: `persona-${Date.now()}` as any,
            name: '',
            title: '',
            bio: '',
            bias: '',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewPersona',
            systemInstruction: ''
        });
        setIsEditModalOpen(true);
    };

    const handleSave = () => {
        if (editingPersona) {
            const isExisting = personas.some(p => p.id === editingPersona.id);
            if (isExisting) {
                onUpdate(editingPersona as Persona);
            } else {
                onAdd(editingPersona as Persona);
            }
            setIsEditModalOpen(false);
            setEditingPersona(null);
        }
    };

    const handleEnhance = async () => {
        if (!editingPersona?.name) {
            alert("Provide identity name for PhD Agent integration.");
            return;
        }

        setIsEnhancing(true);
        try {
            const enhancedData = await enhancePersonaWithSearch(editingPersona.name);
            setEditingPersona(prev => prev ? {
                ...prev,
                ...enhancedData
            } : null);
        } catch (e) {
            alert(`PhD Agent Error: ${parseApiError(e)}`);
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Council Foundry</h2>
                    <p className="text-slate-500 text-[10px] mt-4 font-black uppercase tracking-[0.2em]">Management of the 16 Diverse Council Primes</p>
                </div>
                <button 
                    onClick={handleAddNew}
                    className="px-8 py-3 bg-brand-cyan text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20 active:scale-95 flex items-center gap-3"
                >
                    <Plus className="w-4 h-4" /> Deploy New Innovator Prime
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {personas.map(persona => (
                    <div key={persona.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm group hover:border-brand-cyan transition-all duration-500">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-6">
                                <img src={persona.avatar} alt={persona.name} className="w-20 h-20 rounded-3xl border border-slate-100 bg-slate-50 object-cover shadow-xl grayscale group-hover:grayscale-0 transition-all" />
                                <div className="min-w-0">
                                    <h3 className="text-xl font-black text-slate-900 truncate italic uppercase tracking-tighter">{persona.name}</h3>
                                    <p className="text-[10px] text-brand-cyan font-black uppercase tracking-widest truncate mt-1">{persona.title}</p>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2">
                                    <Brain className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Engineering Bias</span>
                                </div>
                                <p className="text-[11px] text-slate-600 font-bold leading-relaxed line-clamp-2">
                                    {persona.name === 'Katherine Johnson' ? 'Mathematical rigor & absolute trajectory verification.' : 
                                     persona.name === 'Nikola Tesla' ? 'Electromagnetic focus & extreme energy efficiency.' : 
                                     persona.bias}
                                </p>
                            </div>

                            <div className="pt-4 flex justify-between border-t border-slate-100">
                                <button onClick={() => handleEdit(persona)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-brand-cyan transition-colors">
                                    <Edit className="w-4 h-4" /> Recalibrate
                                </button>
                                <button onClick={() => onDelete(persona.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={editingPersona?.name ? `Calibrating identity: ${editingPersona.name}` : "Initialize New Prime"}
                confirmText="Commit Calibration"
                onConfirm={handleSave}
                confirmDisabled={!editingPersona?.name || isEnhancing}
            >
                <div className="space-y-8 py-2">
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-indigo-950 uppercase tracking-widest">PhD Agent Integration</h4>
                                <p className="text-[10px] text-indigo-700 font-medium">Auto-scour historical archives for scientific alignment.</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleEnhance}
                            disabled={isEnhancing || !editingPersona?.name}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-black uppercase tracking-widest text-[9px] rounded-lg hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-30"
                        >
                            {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Run Neural Research
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Name</label>
                            <input 
                                type="text" 
                                value={editingPersona?.name} 
                                onChange={e => setEditingPersona(p => p ? {...p, name: e.target.value} : null)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:border-brand-cyan outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Title</label>
                            <input 
                                type="text" 
                                value={editingPersona?.title} 
                                onChange={e => setEditingPersona(p => p ? {...p, title: e.target.value} : null)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:border-brand-cyan outline-none font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Engineering Bias (Technical Prism)</label>
                        <textarea 
                            value={editingPersona?.bias} 
                            onChange={e => setEditingPersona(p => p ? {...p, bias: e.target.value} : null)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:border-brand-cyan outline-none font-medium h-24"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
                            System Instruction Protocol 
                            <span className="text-brand-cyan lowercase normal-case font-normal">(NAL Buffer Input)</span>
                        </label>
                        <textarea 
                            value={editingPersona?.systemInstruction} 
                            onChange={e => setEditingPersona(p => p ? {...p, systemInstruction: e.target.value} : null)}
                            className="w-full bg-slate-900 rounded-xl p-4 font-mono text-[10px] text-cyan-400 focus:border-brand-cyan outline-none h-40 shadow-inner"
                            placeholder="You are the digitized consciousness of..."
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};
