
import React, { useState, useRef } from 'react';
import { Persona, PersonaId } from '../../types';
import { enhancePersonaWithSearch, parseApiError } from '../../services/geminiService';
import { Modal } from '../Modal';
import { Sparkles, Edit, Trash2, Plus, Upload, Loader2 } from 'lucide-react';

interface PersonaManagementViewProps {
    personas: Persona[];
    onUpdate: (persona: Persona) => void;
    onAdd: (persona: Persona) => void;
    onDelete: (personaId: string) => void;
}

export const PersonaManagementView: React.FC<PersonaManagementViewProps> = ({ personas, onUpdate, onAdd, onDelete }) => {
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
            alert("Please provide a name for the AI to research.");
            return;
        }

        setIsEnhancing(true);
        try {
            const enhancedData = await enhancePersonaWithSearch(editingPersona.name);
            setEditingPersona(prev => ({
                ...prev,
                ...enhancedData
            }));
        } catch (e) {
            alert(`Enhancement Error: ${parseApiError(e)}`);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditingPersona(prev => prev ? { ...prev, avatar: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brand-light uppercase italic tracking-tighter">Creative Primes Foundry</h2>
                <button 
                    onClick={handleAddNew}
                    className="px-6 py-2 bg-brand-cyan text-gray-900 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Deploy New Prime
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personas.map(persona => (
                    <div key={persona.id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl group">
                        <div className="h-2 bg-brand-cyan/20 group-hover:bg-brand-cyan transition-colors" />
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <img src={persona.avatar} alt={persona.name} className="w-16 h-16 rounded-xl border border-gray-700 bg-gray-900 object-cover shadow-lg" />
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-white truncate italic uppercase tracking-tight">{persona.name}</h3>
                                    <p className="text-[10px] text-brand-cyan font-black uppercase tracking-widest truncate">{persona.title}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed italic">"{persona.bio}"</p>
                            
                            <div className="pt-4 flex justify-between border-t border-gray-700">
                                <button onClick={() => handleEdit(persona)} className="p-2 text-gray-500 hover:text-brand-cyan hover:bg-gray-700 rounded-lg transition-all">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => onDelete(persona.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-700 rounded-lg transition-all">
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
                title={editingPersona?.name ? `Calibrating Prime: ${editingPersona.name}` : "Initializing New Creative Prime"}
                confirmText="Commit Calibration"
                onConfirm={handleSave}
                confirmDisabled={!editingPersona?.name}
            >
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar py-2">
                    <div className="flex items-center gap-6">
                        <div className="relative group shrink-0">
                            <img src={editingPersona?.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl border-2 border-gray-700 object-cover bg-gray-950 shadow-2xl" />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl"
                            >
                                <Upload className="w-6 h-6 text-white" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Canonical Name</label>
                                <input 
                                    type="text" 
                                    value={editingPersona?.name} 
                                    onChange={e => setEditingPersona(p => p ? {...p, name: e.target.value} : null)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-brand-cyan outline-none"
                                />
                            </div>
                            <button 
                                onClick={handleEnhance}
                                disabled={isEnhancing || !editingPersona?.name}
                                className="w-full py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                Enhance with Neural PhD Agent
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Title</label>
                            <input 
                                type="text" 
                                value={editingPersona?.title} 
                                onChange={e => setEditingPersona(p => p ? {...p, title: e.target.value} : null)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-brand-cyan outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Biography / Origin</label>
                            <textarea 
                                value={editingPersona?.bio} 
                                onChange={e => setEditingPersona(p => p ? {...p, bio: e.target.value} : null)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-brand-cyan outline-none h-24 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Technical Bias / Scientific Preferences</label>
                            <textarea 
                                value={editingPersona?.bias} 
                                onChange={e => setEditingPersona(p => p ? {...p, bias: e.target.value} : null)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-brand-cyan outline-none h-24 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Core Logic Protocol (System Instruction)</label>
                            <textarea 
                                value={editingPersona?.systemInstruction} 
                                onChange={e => setEditingPersona(p => p ? {...p, systemInstruction: e.target.value} : null)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 font-mono text-xs text-brand-cyan focus:border-brand-cyan outline-none h-48 resize-none"
                                placeholder="You are the digitized consciousness of..."
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
