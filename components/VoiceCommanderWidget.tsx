import React from 'react';
import { VoiceCommanderState } from '../types';

interface VoiceCommanderWidgetProps {
    state: VoiceCommanderState;
    startListening: () => void;
    stopListening: () => void;
}

const MicIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v1.5m-6 0v-1.5a6 6 0 0 1 6-6v1.5m0 0v1.5m0-1.5a6 6 0 0 0-6 6v1.5m6-7.5a6 6 0 0 1 6 6v1.5" />
    </svg>
);

export const VoiceCommanderWidget: React.FC<VoiceCommanderWidgetProps> = ({ state, startListening, stopListening }) => {

    const isListening = state === 'listening' || state === 'thinking';

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };
    
    const getStyles = () => {
        switch(state) {
            case 'listening':
                return {
                    button: 'bg-green-600 text-white animate-pulse-mic',
                    tooltip: 'Listening... Click to stop.'
                };
            case 'thinking':
                 return {
                    button: 'bg-yellow-500 text-white animate-pulse-mic',
                    tooltip: 'Processing command...'
                };
            case 'error':
                 return {
                    button: 'bg-red-600 text-white',
                    tooltip: 'Error occurred. Click to retry.'
                };
            case 'idle':
            default:
                 return {
                    button: 'bg-brand-cyan text-white',
                    tooltip: 'Click to activate voice commands.'
                };
        }
    };
    
    const { button, tooltip } = getStyles();

    return (
        <div className="fixed bottom-6 right-6 z-30 group">
            <button
                onClick={handleClick}
                className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-100 ${button}`}
                aria-label={tooltip}
            >
                <MicIcon className="w-8 h-8" />
            </button>
            <div className="absolute bottom-1/2 right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none transform translate-y-1/2">
                {tooltip}
                <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gray-900 transform -translate-y-1/2 rotate-45" />
            </div>
        </div>
    );
};