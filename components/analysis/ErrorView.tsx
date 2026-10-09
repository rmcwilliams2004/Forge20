import React from 'react';

const ClearIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
    </svg>
);

interface ErrorViewProps {
    error: string;
    onClear: () => void;
}

export const ErrorView = ({ error, onClear }: ErrorViewProps) => (
  <div className="bg-red-900/50 border-2 border-red-700 rounded-lg p-8 h-full flex flex-col items-center justify-center text-center animate-fade-in">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-400 mb-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
    <h2 className="text-xl font-bold text-red-300">Analysis Failed</h2>
    <p className="text-red-300 mt-4 max-w-md">
      {error}
    </p>
    <p className="text-red-400 mt-2 text-sm">
      <strong>Suggestion:</strong> Please try modifying your prompt, selecting a different image, or choosing another faction and try again.
    </p>
    <button
      onClick={onClear}
      className="mt-6 py-2 px-4 bg-red-600/50 text-white font-semibold rounded-lg border border-red-500 hover:bg-red-500/50 transition flex items-center gap-2"
    >
      <ClearIcon className="w-5 h-5" />
      Clear Error
    </button>
  </div>
);