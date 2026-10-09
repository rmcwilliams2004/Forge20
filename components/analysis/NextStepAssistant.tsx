
import React from 'react';
import { NextStepSuggestion } from '../../types';

interface NextStepAssistantProps {
    suggestions: NextStepSuggestion[];
    isLoading: boolean;
    error: string | null;
    onAction: (actionId: string) => void;
    onRefresh: () => void;
}

const IconMap: Record<NextStepSuggestion['icon'], React.ReactNode> = {
    beaker: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v-5.714m0 0a24.298 24.298 0 0 0-4.5 0m4.5 0a24.298 24.298 0 0 1-4.5 0M9 14.5h6v3.104c-.251.023-.501.05-.75.082m-4.5.082c-.249-.032-.499-.059-.75-.082m-4.5.082h15" /></svg>,
    cube: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
    bolt: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>,
    ruler: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a5.25 5.25 0 0 1 0 10.5m0-10.5a5.25 5.25 0 0 0 0 10.5m0-10.5V3m0 3.75h.008v.008H12v-.008Zm0 10.5h.008v.008H12v-.008Zm0 0v2.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V6.75c0-.621-.504-1.125-1.125-1.125H18.75m-7.5 15h.008v.008H12v-.008Zm0 0-.008.008H12v-.008Zm0 0V15m0 3.75V15m-4.5-3.75h.008v.008H7.5v-.008Zm0 0h.008v.008H7.5v-.008Zm0 0V15m0 3.75V15" /></svg>,
    chart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
    dollar: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
    conversation: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a.375.375 0 0 1 .265-.108h3.284a3.375 3.375 0 0 0 3.375-3.375V9.75a3.375 3.375 0 0 0-3.375 3.375H5.25a3.375 3.375 0 0 0-3.375 3.375v3.01Z" /></svg>,
    play: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" /></svg>,
};

const SuggestionCard: React.FC<{ suggestion: NextStepSuggestion; onAction: (actionId: string) => void; }> = ({ suggestion, onAction }) => (
    <button
        onClick={() => onAction(suggestion.actionId)}
        title={suggestion.rationale}
        className="flex items-center gap-4 text-left p-4 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/40 hover:border-brand-cyan transition-all duration-200 hover:-translate-y-1 w-full"
    >
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-brand-cyan">
            {IconMap[suggestion.icon]}
        </div>
        <div>
            <h4 className="font-bold text-gray-900 dark:text-brand-light">{suggestion.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.rationale}</p>
        </div>
    </button>
);


export const NextStepAssistant: React.FC<NextStepAssistantProps> = ({ suggestions, isLoading, error, onAction, onRefresh }) => {
    return (
        <div className="mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-cyan-500/30 dark:border-cyan-800/50">
                <h3 className="text-xl font-bold text-brand-cyan flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
                    AI-Suggested Next Steps
                </h3>
                <button onClick={onRefresh} disabled={isLoading} className="p-2 text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition" title="Refresh Suggestions">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 0 0-3.375-3.375H8.25a3.375 3.375 0 0 0-3.375 3.375v4.992" /></svg>
                </button>
            </div>
            <div className="pl-8">
                {isLoading && suggestions.length === 0 && <p className="text-gray-500 dark:text-gray-400">Thinking of next steps...</p>}
                {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
                <div className="space-y-4">
                    {suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} onAction={onAction} />)}
                </div>
            </div>
        </div>
    );
};
