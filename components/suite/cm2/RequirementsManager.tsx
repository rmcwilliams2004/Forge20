import React, { useState, useMemo } from 'react';
import { Requirement, RequirementStatus } from '../../../types';
import { MOCK_REQUIREMENTS } from '../../../constants';

const StatusPill: React.FC<{ status: RequirementStatus }> = ({ status }) => {
    const colors = {
        [RequirementStatus.Draft]: 'bg-gray-500 text-gray-100',
        [RequirementStatus.Approved]: 'bg-blue-600 text-blue-100',
        [RequirementStatus.Tested]: 'bg-green-600 text-green-100',
        [RequirementStatus.Obsolete]: 'bg-red-700 text-red-100',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
};

export const RequirementsManager: React.FC = () => {
    const [requirements, setRequirements] = useState<Requirement[]>(MOCK_REQUIREMENTS);
    const [filter, setFilter] = useState<RequirementStatus | 'All'>('All');

    const filteredRequirements = useMemo(() =>
        requirements.filter(req => filter === 'All' || req.status === filter),
        [requirements, filter]
    );
    
    const statusCounts = useMemo(() => {
        const counts = { Draft: 0, Approved: 0, Tested: 0, Obsolete: 0, All: requirements.length };
        requirements.forEach(r => {
            counts[r.status]++;
        });
        return counts;
    }, [requirements]);


    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold text-brand-light mb-4">Requirements Management</h1>
            <div className="flex-1 flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                 <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-4">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <button key={status} onClick={() => setFilter(status as any)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filter === status ? 'bg-brand-cyan text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                            {status} <span className="text-xs opacity-70 ml-1">({count})</span>
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    <ul className="space-y-3">
                        {filteredRequirements.map(req => (
                            <li key={req.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                <div className="flex justify-between items-start">
                                    <p className="font-mono text-brand-cyan font-semibold">{req.id}</p>
                                    <StatusPill status={req.status} />
                                </div>
                                <p className="mt-2 text-gray-300">{req.text}</p>
                                {req.linkedTo.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-gray-600/50 text-xs text-gray-400">
                                        <strong>Linked To:</strong> {req.linkedTo.join(', ')}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
