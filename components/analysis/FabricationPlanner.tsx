import React, { useState } from 'react';
import { FabricationPlan, ManufacturingProcessType, AnalysisResult, User } from '../../types';
import { useFabricationPlanner } from '../../hooks/useFabricationPlanner';
import { useGCodeVisualizer } from '../../hooks/useGCodeVisualizer';
import { Loader2, Wrench, Settings } from 'lucide-react';

interface FabricationPlannerProps {
    fabricationPlanner: ReturnType<typeof useFabricationPlanner>;
    analysisResult: AnalysisResult;
    isViewer: boolean;
    gcodeVisualizer: ReturnType<typeof useGCodeVisualizer>;
}

const processOptions: ManufacturingProcessType[] = [
    'CNC Machining', 
    '3D Printing', 
    'Sheet Metal', 
    'Injection Molding', 
    'Die Casting', 
    'Forging', 
    'Laser Cutting', 
    'Waterjet Cutting', 
    'Extrusion', 
    'Robotic Assembly', 
    'Manual Assembly', 
    'Composite Layup'
];

export const FabricationPlanner: React.FC<FabricationPlannerProps> = ({ fabricationPlanner, analysisResult, isViewer, gcodeVisualizer }) => {
    const [selectedProcess, setSelectedProcess] = useState<ManufacturingProcessType>('CNC Machining');
    const [selectedMaterial, setSelectedMaterial] = useState<string>(analysisResult.material_suggestions[0]?.name || 'Aluminum 6061');

    const handleRunPlanner = () => {
        if (fabricationPlanner.isLoading) return; 

        const productContext = `
        Product: ${analysisResult.product_name}.
        Summary: ${analysisResult.executive_summary}.
        BOM: ${analysisResult.billOfMaterials.map(item => item.name).join(', ')}.
        Key Components: ${analysisResult.designDocument.component_designs.map(c => `${c.component_name}: ${c.design_details}`).join('; ')}.
        `;
        
        setTimeout(() => {
            fabricationPlanner.runPlanner(selectedProcess, selectedMaterial, productContext);
        }, 500); 
    };

    const { plan, isLoading, error } = fabricationPlanner;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4 transition-colors duration-300">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Select Manufacturing Process</label>
                        <select
                            value={selectedProcess}
                            onChange={(e) => setSelectedProcess(e.target.value as ManufacturingProcessType)}
                            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 transition-colors"
                            disabled={isLoading || isViewer}
                        >
                            {processOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2. Confirm Material</label>
                        <select
                            value={selectedMaterial}
                            onChange={(e) => setSelectedMaterial(e.target.value)}
                            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 transition-colors"
                            disabled={isLoading || isViewer}
                        >
                            {analysisResult.material_suggestions.map(mat => <option key={mat.name} value={mat.name}>{mat.name}</option>)}
                            <option value="Custom">-- Enter Custom --</option>
                        </select>
                    </div>
                </div>
                {!isViewer && (
                    <button
                        onClick={handleRunPlanner}
                        disabled={isLoading}
                        className={`w-full py-3 px-5 bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl border border-purple-500 hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden ${isLoading ? 'shadow-inner' : 'shadow-lg shadow-purple-900/30'}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="animate-breathe">Synthesizing fabrication data...</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer -translate-x-full"></div>
                            </>
                        ) : (
                            'Generate Fabrication Plan'
                        )}
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="text-center p-8 bg-gray-800/20 rounded-2xl border border-gray-700 border-dashed animate-pulse">
                    <div className="relative w-fit mx-auto mb-4">
                        <Settings className="h-10 w-10 text-purple-400 animate-spin opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-purple-200 animate-bounce" />
                        </div>
                    </div>
                    <p className="text-purple-600 dark:text-purple-300 font-bold uppercase tracking-widest text-xs">AI is analyzing manufacturability...</p>
                </div>
            )}
            {error && <p className="text-red-500 dark:text-red-400 bg-red-900/20 p-4 rounded-xl border border-red-900/50">{error}</p>}

            {plan && (
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in transition-colors duration-300">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-brand-light">Fabrication Plan Results</h4>
                    <div>
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Design for Manufacturability (DFM) Checks</h5>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-2">Component</th>
                                        <th className="px-4 py-2">Issue</th>
                                        <th className="px-4 py-2">Recommendation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plan.dfmChecks.map((check, i) => (
                                        <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{check.component}</td>
                                            <td className="px-4 py-2 text-yellow-600 dark:text-yellow-300">{check.issue}</td>
                                            <td className="px-4 py-2">{check.recommendation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Tolerancing Notes</h5>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {plan.tolerancingNotes.map((note, i) => <li key={i}>{note}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{plan.processSpecificOutput.title}</h5>
                        <pre className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-md text-cyan-700 dark:text-cyan-300 text-xs overflow-x-auto font-mono border border-gray-200 dark:border-gray-600">
                            <code>{plan.processSpecificOutput.data}</code>
                        </pre>
                        {selectedProcess === 'CNC Machining' && plan.processSpecificOutput.data && (
                            <button
                                onClick={() => gcodeVisualizer.openModal(plan.processSpecificOutput.data)}
                                className="mt-3 py-2 px-4 bg-cyan-600 text-white font-semibold rounded-lg border border-cyan-500 hover:bg-cyan-500 transition active:scale-95 text-sm flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5v4.5m0-.75h4.5" /></svg>
                                Visualize Toolpath & Summary
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};