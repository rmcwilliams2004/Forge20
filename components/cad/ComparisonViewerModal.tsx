import React from 'react';
import { CadComponent, CadComparisonResult } from '../../types';
import { usePanZoom } from '../../hooks/usePanZoom';
import { ComparisonData } from '../../hooks/useVersionComparer';

interface ComparisonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  comparisonData: ComparisonData | null;
}

const WORLD_SIZE = 1000;

const CadComponentShape: React.FC<{ component: CadComponent; color: string; opacity: number; }> = ({ component, color, opacity }) => {
    const { shape, dimensions, position } = component;
    const strokeWidth = "2";

    switch (shape) {
        case 'cylinder':
            return <ellipse cx={position.x} cy={position.y} rx={dimensions.x / 2} ry={dimensions.x / 2} fill={color} fillOpacity={opacity} stroke={color} strokeWidth={strokeWidth} />;
        case 'sphere':
            return <circle cx={position.x} cy={position.y} r={dimensions.x / 2} fill={color} fillOpacity={opacity} stroke={color} strokeWidth={strokeWidth} />;
        case 'cube':
        default:
            return <rect x={position.x - dimensions.x / 2} y={position.y - dimensions.y / 2} width={dimensions.x} height={dimensions.y} fill={color} fillOpacity={opacity} stroke={color} strokeWidth={strokeWidth} />;
    }
};

const ChangeSidebar = ({ diff, baseCommit, newCommit }: { diff: CadComparisonResult; baseCommit: string; newCommit: string; }) => (
    <div className="w-80 bg-gray-800/80 backdrop-blur-sm border-l border-gray-600 p-4 flex flex-col h-full text-white">
        <h3 className="text-lg font-bold text-brand-cyan mb-1">Comparison Details</h3>
        <p className="text-xs text-gray-400 mb-4">Comparing "{newCommit}" (New) vs. "{baseCommit}" (Base)</p>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
                <h4 className="font-semibold text-green-400 mb-2">Additions ({diff.additions.length})</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                    {diff.additions.map(name => <li key={`add-${name}`}>{name}</li>)}
                    {diff.additions.length === 0 && <li className="list-none italic text-gray-500">None</li>}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-red-400 mb-2">Deletions ({diff.deletions.length})</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                    {diff.deletions.map(name => <li key={`del-${name}`}>{name}</li>)}
                    {diff.deletions.length === 0 && <li className="list-none italic text-gray-500">None</li>}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-yellow-400 mb-2">Modifications ({diff.modifications.length})</h4>
                <div className="space-y-3 text-sm">
                    {diff.modifications.map(mod => (
                        <div key={`mod-${mod.name}`}>
                            <p className="font-semibold text-gray-200">{mod.name}</p>
                            <ul className="list-disc pl-5 text-gray-400">
                                {mod.changes.map((change, i) => <li key={i}>{change}</li>)}
                            </ul>
                        </div>
                    ))}
                    {diff.modifications.length === 0 && <p className="italic text-gray-500">None</p>}
                </div>
            </div>
        </div>
    </div>
);

export const ComparisonViewerModal: React.FC<ComparisonViewerModalProps> = ({ isOpen, onClose, isLoading, error, comparisonData }) => {
    const { svgRef, viewBoxString, onMouseDown, onMouseMove, onMouseUp, onWheel, resetZoom } = usePanZoom(WORLD_SIZE, WORLD_SIZE);
    
    if (!isOpen) return null;

    const baseComponents = comparisonData?.baseCad.components.reduce((acc, comp) => {
        acc[comp.name] = comp;
        return acc;
    }, {} as Record<string, CadComponent>) || {};
    
    const newComponents = comparisonData?.newCad.components.reduce((acc, comp) => {
        acc[comp.name] = comp;
        return acc;
    }, {} as Record<string, CadComponent>) || {};

    const allComponentNames = [...new Set([...Object.keys(baseComponents), ...Object.keys(newComponents)])];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40 animate-fade-in" style={{ animationDuration: '0.3s' }} onClick={onClose}>
            <div className="bg-gray-900 rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col border-2 border-purple-500" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-brand-light">Version Comparison</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl font-bold">&times;</button>
                </header>
                <main className="flex-1 flex overflow-hidden">
                    <div className="flex-1 relative bg-grid-pattern">
                        {isLoading && (
                             <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center gap-4 text-center z-20">
                                <svg className="animate-spin h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <p className="text-purple-300 font-semibold">Comparing Versions...</p>
                                <p className="text-gray-400 text-sm max-w-sm">Generating CAD data and running AI-powered comparison. This may take a moment.</p>
                            </div>
                        )}
                        {error && (
                             <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center gap-4 text-center z-20 p-4">
                                <h3 className="text-lg font-bold text-red-300">Comparison Failed</h3>
                                <p className="text-red-300">{error}</p>
                                <button onClick={onClose} className="mt-4 py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition">Close</button>
                            </div>
                        )}
                        {comparisonData && (
                            <>
                                <div className="absolute top-2 left-2 z-10 p-2 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg flex gap-4 text-sm">
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-green-500"></div><span className="text-green-300">Added</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-red-500"></div><span className="text-red-300">Deleted</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-yellow-400"></div><span className="text-yellow-300">Modified</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-gray-500"></div><span className="text-gray-300">Unchanged</span></div>
                                </div>
                                <svg
                                    ref={svgRef}
                                    className="w-full h-full cursor-grab active:cursor-grabbing"
                                    viewBox={viewBoxString}
                                    onMouseDown={onMouseDown}
                                    onMouseMove={onMouseMove}
                                    onMouseUp={onMouseUp}
                                    onWheel={onWheel}
                                >
                                    <g transform={`translate(${WORLD_SIZE / 2}, ${WORLD_SIZE / 2})`}>
                                        {allComponentNames.map(name => {
                                            const inBase = name in baseComponents;
                                            const inNew = name in newComponents;
                                            const isModified = comparisonData.diff.modifications.some(m => m.name === name);

                                            if (isModified) {
                                                return <CadComponentShape key={name} component={newComponents[name]} color="#FBBF24" opacity={0.5} />;
                                            } else if (inNew && !inBase) {
                                                return <CadComponentShape key={name} component={newComponents[name]} color="#22C55E" opacity={0.5} />;
                                            } else if (inBase && !inNew) {
                                                return <CadComponentShape key={name} component={baseComponents[name]} color="#EF4444" opacity={0.5} />;
                                            } else {
                                                return <CadComponentShape key={name} component={newComponents[name]} color="#6B7280" opacity={0.15} />;
                                            }
                                        })}
                                    </g>
                                </svg>
                            </>
                        )}
                    </div>
                    {comparisonData && <ChangeSidebar diff={comparisonData.diff} baseCommit={comparisonData.baseVersionCommit} newCommit={comparisonData.newVersionCommit} />}
                </main>
            </div>
        </div>
    );
};