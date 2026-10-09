import React from 'react';

interface TechDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-xl font-bold text-brand-cyan mb-3 pb-2 border-b-2 border-cyan-800/50">{title}</h3>
        <div className="space-y-3 text-gray-300 leading-relaxed text-sm">{children}</div>
    </div>
);

const Code = ({ children }: { children?: React.ReactNode }) => (
    <code className="bg-gray-900 text-cyan-400 p-1 rounded-md text-xs font-mono">{children}</code>
);

export const TechnicalDocumentModal = ({ isOpen, onClose }: TechDocModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in" style={{ animationDuration: '0.3s' }} onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col border-2 border-gray-600" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-brand-light">Technical Documentation</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl font-bold">&times;</button>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    <Section title="Application Architecture">
                        <p>SynapseForge AI is a modern full-stack web application built with React, TypeScript, and the Google Gemini API. It operates as a client-side application, performing all AI interactions and data processing directly in the user's browser.</p>
                        <p>The state management is handled via a combination of React hooks (<Code>useState</Code>, <Code>useCallback</Code>, etc.) and custom hooks for modularity. Project data is managed locally and can be saved/loaded as <Code>.sfp.json</Code> files.</p>
                    </Section>

                     <Section title="Key Custom Hooks">
                        <ul className="list-disc pl-5 space-y-2">
                           <li><Code>useAnalysis</Code>: Orchestrates the primary analysis workflow, managing loading states and handling API calls to the Gemini model for generating the main report.</li>
                           <li><Code>useProjects</Code>: Manages the lifecycle of projects, including creation, versioning (history), selection, and deletion within the user's session.</li>
                           <li><Code>useDeVinci</Code>: Powers the real-time, conversational AI feature by managing the Gemini Live API session, microphone input, audio output, and function call handling.</li>
                           <li><Code>useDrawingGenerator</Code>: Handles requests to the image generation models for creating technical drawings and concept art, managing individual loading/error states for each image.</li>
                        </ul>
                    </Section>

                    <Section title="Gemini API Integration">
                        <p>All interactions with the Gemini models are centralized in <Code>services/geminiService.ts</Code>. This service abstracts the details of API calls for various features:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Core Analysis:</strong> Uses <Code>gemini-2.5-pro</Code> with a detailed system instruction and a strict JSON output schema to generate the main report.</li>
                            <li><strong>Conversational AI (DeVinci):</strong> Utilizes the <Code>gemini-2.5-flash-native-audio-preview-09-2025</Code> model via the Live API for low-latency voice-to-voice interaction and function calling.</li>
                            <li><strong>Image Generation:</strong> Leverages both <Code>imagen-4.0-generate-001</Code> for photorealistic concepts and <Code>gemini-2.5-flash-image</Code> for technical drawings.</li>
                            <li><strong>Fabrication & Simulation:</strong> Employs powerful reasoning models to generate G-Code, perform DFM checks, and simulate analysis results based on the project context.</li>
                        </ul>
                    </Section>

                     <Section title="Data Persistence">
                        <p>The application uses two primary methods for data persistence:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Session Recovery:</strong> A lightweight version of the current analysis is saved to <Code>localStorage</Code> to allow users to resume their work after a page refresh. To avoid storage limits, generated images (base64) are excluded from this save.</li>
                            <li><strong>File-Based Projects:</strong> Users can save their entire project, including all version history and generated assets, to a local <Code>.sfp.json</Code> file. This file can be opened in a future session to fully restore the project state.</li>
                        </ul>
                    </Section>
                </main>
            </div>
        </div>
    );
};