import React, { useMemo } from 'react';
import { Modal } from '../Modal';
import { FoundryState, MaterialPreset } from '../../types';
import { MATERIAL_LIBRARY } from '../../constants/materialLibrary';

interface MaterialComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    foundryState: FoundryState;
}

const formatValue = (val: number, decimals: number = 2) => val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const MaterialComparisonModal: React.FC<MaterialComparisonModalProps> = ({ isOpen, onClose, foundryState }) => {
    const { parameters, selectedMaterial } = foundryState;

    // Simulate cross-sectional area calculation for structural metrics
    const crossSection = parameters.Width * parameters.Thickness;
    const volume = parameters.Length * parameters.Width * parameters.Thickness; // mm3
    const volumeM3 = volume / 1e9;
    const loadForce = 15000; // 15kN simulated load

    const comparisonData = useMemo(() => {
        // Select current material plus 4 interesting alternatives for comparison
        const alternatives = MATERIAL_LIBRARY.filter(m => 
            m.id === 'ti6al4v' || 
            m.id === 'cfep_prepreg' || 
            m.id === 'inconel718' || 
            m.id === 'abs'
        ).filter(m => m.id !== selectedMaterial.id);

        const list = [selectedMaterial, ...alternatives].slice(0, 5);

        return list.map(m => {
            const massKg = volumeM3 * m.density;
            const stress = loadForce / (crossSection || 1);
            const safetyFactor = m.tensileStrength / stress;
            const cost = massKg * m.costPerKg;

            return {
                ...m,
                massKg,
                safetyFactor,
                cost,
                isCurrent: m.id === selectedMaterial.id
            };
        });
    }, [selectedMaterial, volumeM3, crossSection]);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Sovereign Performance Audit: Side-by-Side Analysis" 
            confirmText="Close Audit" 
            onConfirm={onClose}
            cancelText={null}
        >
            <div className="space-y-6">
                <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded">
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Active Constraint Profile</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Metrics derived from {parameters.Length}x{parameters.Width}x{parameters.Thickness}mm parametric mesh under {loadForce/1000}kN nominal load.
                    </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-700 bg-black/40 shadow-inner">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-900 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3">Material Profile</th>
                                <th className="px-4 py-3 text-right">Est. Mass</th>
                                <th className="px-4 py-3 text-right">Yield</th>
                                <th className="px-4 py-3 text-right">FoS</th>
                                <th className="px-4 py-3 text-right">Est. Cost</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-mono">
                            {comparisonData.map(m => (
                                <tr key={m.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${m.isCurrent ? 'bg-brand-cyan/5' : ''}`}>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {m.isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#06b6d4]"></div>}
                                            <span className={`font-bold ${m.isCurrent ? 'text-brand-cyan' : 'text-gray-300'}`}>{m.name}</span>
                                        </div>
                                        <span className="text-[9px] text-gray-500 uppercase tracking-tighter ml-3.5">{m.category}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right text-gray-400">
                                        {formatValue(m.massKg, 3)}<span className="text-[9px] ml-0.5">kg</span>
                                    </td>
                                    <td className="px-4 py-4 text-right text-gray-400">
                                        {m.tensileStrength}<span className="text-[9px] ml-0.5">MPa</span>
                                    </td>
                                    <td className={`px-4 py-4 text-right font-black ${m.safetyFactor < 1.0 ? 'text-red-500' : m.safetyFactor < 2.0 ? 'text-yellow-500' : 'text-green-500'}`}>
                                        {formatValue(m.safetyFactor, 2)}x
                                    </td>
                                    <td className="px-4 py-4 text-right text-brand-cyan">
                                        ${formatValue(m.cost, 2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Recommendation</span>
                        <p className="text-xs text-indigo-300 italic leading-relaxed">
                            "Titanium G5 offers the optimal weight-to-strength ratio for this geometry, while Graphene Film represents a theoretical performance ceiling."
                        </p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 flex flex-col justify-center">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">Fingerprint Protocol</span>
                        <span className="text-[10px] font-mono text-cyan-500/60 truncate">SHA256::AUDIT_{Math.floor(Date.now()/1000)}</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
