import React from 'react';
import { Modal } from './Modal';
import { ExplorationResult } from '../types';

interface SuggestionExplorerModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    error: string | null;
    result: ExplorationResult | null;
}

export const SuggestionExplorerModal: React.FC<SuggestionExplorerModalProps> = ({ isOpen, onClose, isLoading, error, result }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Explore AI Suggestion"
            confirmText="Close"
            onConfirm={onClose}
            cancelText={null}
        >
            <div className="space-y-4">
                {result && (
                     <p className="p-3 bg-gray-900/50 rounded-md border border-gray-600 text-gray-400 italic">
                        "{result.suggestionText}"
                    </p>
                )}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
                        <svg className="animate-spin h-8 w-8 text-brand-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-brand-light font-semibold">Exploring Concept...</p>
                        <p className="text-gray-400 text-sm">Generating explanation and visual concept...</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-300">
                        <h4 className="font-bold mb-2">An Error Occurred</h4>
                        <p>{error}</p>
                    </div>
                )}
                {result && !isLoading && (
                    <div className="animate-fade-in space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-brand-cyan mb-2">Explanation</h3>
                            <p className="text-gray-300">{result.explanation}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-brand-cyan mb-2">Visual Concept</h3>
                            <img src={result.imageUrl} alt={`Visual concept for ${result.suggestionText}`} className="w-full h-auto object-cover rounded-lg bg-gray-900/50 border border-gray-600" />
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};