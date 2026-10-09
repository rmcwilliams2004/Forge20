
import React, { useState, useMemo, useEffect } from 'react';
import { Standard } from '../../../types';
import { MOCK_STANDARDS } from '../../../constants';

export const StandardsLibrary: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ organization: 'All', status: 'All' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, [filters]);

    // FIX: Explicitly typed the memoized organizations array to string[] to resolve type-checking errors in the map function.
    const organizations = useMemo<string[]>(() => ['All', ...Array.from(new Set(MOCK_STANDARDS.map(s => s.organization)))], []);

    const filteredStandards = useMemo(() =>
        MOCK_STANDARDS.filter(s =>
            (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.organization === 'All' || s.organization === filters.organization) &&
            (filters.status === 'All' || s.status === filters.status)
        ), [searchTerm, filters]);
    
    const handleFilterChange = (filterType: 'organization' | 'status', value: string) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold text-brand-light mb-4">Project Standards & Code Library</h1>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col flex-1">
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:ring-brand-cyan focus:border-brand-cyan md:col-span-2 transition-all"
                    />
                     <select value={filters.organization} onChange={e => handleFilterChange('organization', e.target.value)} className="bg-gray-900/50 border-2 border-gray-700 rounded-lg px-4 py-2 text-gray-300 outline-none focus:border-brand-cyan transition-colors">
                        {organizations.map(org => <option key={org} value={org}>{org === 'All' ? 'All Organizations' : org}</option>)}
                    </select>
                     <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="bg-gray-900/50 border-2 border-gray-700 rounded-lg px-4 py-2 text-gray-300 outline-none focus:border-brand-cyan transition-colors">
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Withdrawn">Withdrawn</option>
                    </select>
                </div>

                {/* Standards List */}
                <div className="flex-1 overflow-hidden relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4 bg-gray-800/20 backdrop-blur-sm rounded-lg z-10">
                            <svg className="animate-spin h-10 w-10 text-brand-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Syncing Standards Ledger...</p>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                            <ul className="space-y-3">
                                {filteredStandards.length === 0 ? (
                                    <li className="text-center py-20 text-gray-500 italic">No standards match the selected profile.</li>
                                ) : (
                                    filteredStandards.map(standard => (
                                        <li key={standard.id} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 hover:border-brand-cyan/40 transition-colors animate-fade-in group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-brand-light group-hover:text-brand-cyan transition-colors">{standard.name}</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">{standard.organization} &bull; {standard.publicationYear}</p>
                                                </div>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${standard.status === 'Active' ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-red-900/20 text-red-400 border-red-500/30'}`}>
                                                    {standard.status}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm text-gray-400 leading-relaxed">{standard.description}</p>
                                            <div className="mt-4 pt-3 border-t border-gray-700/50 text-right">
                                                <button className="text-[10px] font-black text-brand-cyan hover:text-cyan-300 uppercase tracking-widest transition-colors flex items-center gap-1 ml-auto">
                                                    Link to Design Step
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            `}</style>
        </div>
    );
};
