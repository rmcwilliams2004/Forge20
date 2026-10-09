

import React, { useState, useMemo, useEffect } from 'react';
import { FmeaItem } from '../../../types';
import { MOCK_FMEA_ITEMS } from '../../../constants';

interface FmeaAnalyzerProps {
    items?: FmeaItem[];
}

const RPN_LEVELS = {
    high: 120,
    medium: 80,
};

const getRpnColor = (rpn: number) => {
    if (rpn >= RPN_LEVELS.high) return 'bg-red-500/80 text-white font-bold';
    if (rpn >= RPN_LEVELS.medium) return 'bg-yellow-500/80 text-black font-bold';
    return 'bg-green-500/70 text-black';
};

export const FmeaAnalyzer: React.FC<FmeaAnalyzerProps> = ({ items: propItems }) => {
    // If props are provided, use them (controlled mode). Otherwise use internal state (uncontrolled mode).
    const [localItems, setLocalItems] = useState<FmeaItem[]>(MOCK_FMEA_ITEMS);
    
    const items = propItems || localItems;

    // NOTE: In a real app with controlled components, the update logic would need to bubble up.
    // For this prototype, we'll keep local state update logic for the uncontrolled scenario
    // but the controlled scenario (via props) will be read-only in this specific view unless 
    // we refactor the props to include an onChange handler. 
    // Given the prompt requirements, displaying the dynamic update from SPC is key.
    
    const updateItem = (id: number, field: keyof FmeaItem, value: any) => {
        if (propItems) return; // Read-only if controlled by parent for this demo
        
        setLocalItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                // Fix: Cast 'field' to string to satisfy Array.includes type requirement
                if (['severity', 'occurrence', 'detection'].includes(field as string)) {
                    updatedItem.rpn = updatedItem.severity * updatedItem.occurrence * updatedItem.detection;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const sortedItems = useMemo(() => [...items].sort((a, b) => b.rpn - a.rpn), [items]);

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold text-brand-light mb-4">FMEA / Risk Analyzer</h1>
            {propItems && (
                <div className="mb-4 p-2 bg-blue-900/30 border border-blue-700 rounded text-sm text-blue-200">
                    <span className="font-bold">Live Mode:</span> This FMEA is linked to the SPC module. Risk scores update automatically based on production data.
                </div>
            )}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col flex-1">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900 text-gray-300 uppercase sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Process Step / Component</th>
                                <th className="px-4 py-3">Potential Failure Mode</th>
                                <th className="px-4 py-3">Potential Effects</th>
                                <th className="px-4 py-3 text-center">Sev</th>
                                <th className="px-4 py-3">Potential Causes</th>
                                <th className="px-4 py-3 text-center">Occ</th>
                                <th className="px-4 py-3">Current Controls</th>
                                <th className="px-4 py-3 text-center">Det</th>
                                <th className="px-4 py-3 text-center">RPN</th>
                                <th className="px-4 py-3">Recommended Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-200">
                            {sortedItems.map(item => (
                                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-2 font-semibold">{item.processStep}</td>
                                    <td className="px-4 py-2">{item.failureMode}</td>
                                    <td className="px-4 py-2">{item.failureEffects}</td>
                                    <td className="px-4 py-2"><input type="number" min="1" max="10" value={item.severity} onChange={e => updateItem(item.id, 'severity', parseInt(e.target.value))} className="w-12 bg-gray-900 border border-gray-600 rounded text-center" disabled={!!propItems} /></td>
                                    <td className="px-4 py-2">{item.potentialCauses}</td>
                                    <td className="px-4 py-2"><input type="number" min="1" max="10" value={item.occurrence} onChange={e => updateItem(item.id, 'occurrence', parseInt(e.target.value))} className={`w-12 bg-gray-900 border border-gray-600 rounded text-center transition-colors duration-500 ${propItems && item.actionStatus === 'Pending' ? 'bg-red-900 text-white font-bold border-red-500' : ''}`} disabled={!!propItems} /></td>
                                    <td className="px-4 py-2">{item.currentControls}</td>
                                    <td className="px-4 py-2"><input type="number" min="1" max="10" value={item.detection} onChange={e => updateItem(item.id, 'detection', parseInt(e.target.value))} className="w-12 bg-gray-900 border border-gray-600 rounded text-center" disabled={!!propItems} /></td>
                                    <td className={`px-4 py-2 text-center font-mono text-lg transition-all duration-500 ${getRpnColor(item.rpn)}`}>{item.rpn}</td>
                                    <td className="px-4 py-2">{item.recommendedAction}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
