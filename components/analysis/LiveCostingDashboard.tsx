
import React from 'react';
import { useLiveCosting } from '../../hooks/useLiveCosting';
import { PreliminaryCostEstimate, User } from '../../types';

interface LiveCostingDashboardProps {
    liveCosting: ReturnType<typeof useLiveCosting>;
    isViewer: boolean;
}

const CostTable: React.FC<{ estimate: PreliminaryCostEstimate | null }> = ({ estimate }) => {
    if (!estimate) return null;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700/50">
                    <tr>
                        <th scope="col" className="px-4 py-2">Item</th>
                        <th scope="col" className="px-4 py-2">Cost Estimate</th>
                        <th scope="col" className="px-4 py-2">Rationale</th>
                    </tr>
                </thead>
                <tbody>
                    {(estimate.breakdown || []).map((item, i) => (
                        <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{item.item}</td>
                            <td className="px-4 py-2">{item.cost_estimate}</td>
                            <td className="px-4 py-2">{item.rationale}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const LiveCostingDashboard: React.FC<LiveCostingDashboardProps> = ({ liveCosting, isViewer }) => {
    const { originalEstimate, currentEstimate, editableBom, isRecalculating, error, updateBomItem, recalculate, hasChanges } = liveCosting;

    if (!originalEstimate) return null;

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6 transition-colors duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-brand-light">Live Costing Dashboard</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Modify parameters and recalculate the cost estimate in real-time.</p>
                </div>
                {!isViewer && (
                     <button
                        onClick={recalculate}
                        disabled={isRecalculating}
                        className="py-2 px-5 bg-purple-600 text-white font-bold rounded-lg border border-purple-500 hover:bg-purple-500 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isRecalculating ? 'Recalculating...' : 'Recalculate Cost'}
                    </button>
                )}
            </div>
            
            {error && <p className="text-red-500 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900/30 rounded-md">{error}</p>}

            <div>
                <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Editable Bill of Materials</h5>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-2">Part #</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Quantity</th>
                                <th className="px-4 py-2">Material</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editableBom.map(item => (
                                <tr key={item.part_number} className="border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-4 py-2">{item.part_number}</td>
                                    <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{item.name}</td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateBomItem(item.part_number, 'quantity', parseInt(e.target.value, 10))}
                                            className="w-20 p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan"
                                            disabled={isViewer || isRecalculating}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text"
                                            value={item.material}
                                            onChange={(e) => updateBomItem(item.part_number, 'material', e.target.value)}
                                            className="w-full p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan"
                                            disabled={isViewer || isRecalculating}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-6">
                 <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Original Estimate</h5>
                     <div className="p-4 bg-gray-100 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700/50">
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-300">{originalEstimate.total_estimate_range}</p>
                        <CostTable estimate={originalEstimate} />
                    </div>
                </div>
                 <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Estimate</h5>
                    <div className={`p-4 rounded-lg border ${hasChanges ? 'bg-cyan-50 dark:bg-cyan-900/20 border-brand-cyan' : 'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700/50'}`}>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentEstimate?.total_estimate_range}</p>
                        <CostTable estimate={currentEstimate} />
                    </div>
                </div>
            </div>
        </div>
    );
};
