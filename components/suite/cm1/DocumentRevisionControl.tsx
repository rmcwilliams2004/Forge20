import React from 'react';
import { MOCK_ARTIFACTS } from '../../../constants';

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
};

const TypeIcon = ({ type }: { type: string }) => {
    let icon;
    switch (type) {
        case 'Specification': icon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 3.75h16.5M3.75 3.75v16.5" /></svg>; break;
        case 'Report': icon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" /></svg>; break;
        case 'Script': icon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-400"><path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>; break;
        case 'CAD Link': icon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-400"><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>; break;
        default: icon = <div />;
    }
    return <div title={type}>{icon}</div>;
};

export const DocumentRevisionControl: React.FC = () => {
    const sortedArtifacts = [...MOCK_ARTIFACTS].sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold text-brand-light mb-4">Document & Revision Control</h1>
            <p className="text-gray-400 mb-4">Managing artifacts for project: <span className="font-semibold text-brand-light">"Autonomous Drone Prototype"</span>.</p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden flex-1">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-sm text-gray-300 uppercase">
                        <tr>
                            <th className="px-6 py-3 w-12">Type</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Version</th>
                            <th className="px-6 py-3">Last Modified By</th>
                            <th className="px-6 py-3">Last Modified At</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-200">
                        {sortedArtifacts.map(artifact => (
                            <tr key={artifact.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-150">
                                <td className="px-6 py-3"><TypeIcon type={artifact.type} /></td>
                                <td className="px-6 py-3 font-semibold">{artifact.name}</td>
                                <td className="px-6 py-3 font-mono text-cyan-400">{artifact.version}</td>
                                <td className="px-6 py-3">{artifact.modifiedBy}</td>
                                <td className="px-6 py-3 text-gray-400">{formatDate(artifact.modifiedAt)}</td>
                                <td className="px-6 py-3 text-center">
                                    <button className="text-gray-400 hover:text-white transition text-xs font-semibold">View History</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
