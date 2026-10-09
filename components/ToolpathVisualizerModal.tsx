import React from 'react';
import { Modal } from './Modal';
import { GCodeSummary } from '../types';

interface ToolpathVisualizerModalProps {
    isOpen: boolean;
    onClose: () => void;
    gcode: string | null;
    summary: GCodeSummary | null;
    isLoading: boolean;
    error: string | null;
}

export const ToolpathVisualizerModal: React.FC<ToolpathVisualizerModalProps> = ({ isOpen, onClose, gcode, summary, isLoading, error }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} onConfirm={onClose} title="G-Code Toolpath & Summary" confirmText="Close" cancelText={null}>
            <div className="space-y-4">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                         <svg className="animate-spin h-8 w-8 text-purple-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-purple-300">Analyzing G-Code...</p>
                    </div>
                )}
                {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}
                {summary && (
                    <div className="animate-fade-in">
                        <h3 className="font-semibold text-brand-light mb-2">AI Summary</h3>
                        <p className="text-sm text-gray-300 mb-3 bg-gray-900/50 p-3 rounded-md border border-gray-600">{summary.summary}</p>
                        <h4 className="font-semibold text-gray-300 text-sm mb-1">Key Operations:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-400">
                            {summary.keyOperations.map((op, i) => <li key={i}>{op}</li>)}
                        </ul>
                    </div>
                )}
                {gcode && (
                    <div>
                        <h3 className="font-semibold text-brand-light mb-2 mt-4">Raw G-Code</h3>
                        <pre className="bg-gray-900 p-2 rounded-md text-cyan-400 text-xs font-mono max-h-48 overflow-y-auto">
                            <code>{gcode}</code>
                        </pre>
                    </div>
                )}
            </div>
        </Modal>
    );
};
