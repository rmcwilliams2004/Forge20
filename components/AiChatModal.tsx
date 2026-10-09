import React, { useState, useEffect, useRef } from 'react';
import { AiChatState, ChatMessage } from '../types';

interface AiChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    state: AiChatState;
    history: ChatMessage[];
    sendMessage: (message: string) => void;
    error: string | null;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const text = message.parts[0].text;
    
    // A simple markdown-to-html converter for lists
    // FIX: Re-implemented renderText to avoid props mutation (a runtime error)
    // and use React.ReactNode[] to fix the "Cannot find namespace 'JSX'" compile error.
    const renderText = (txt: string): React.ReactNode[] => {
        const lines = txt.split('\n');
        const elements: React.ReactNode[] = [];
        let currentList: React.ReactNode[] = [];

        const endList = () => {
            if (currentList.length > 0) {
                elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">{currentList}</ul>);
                currentList = [];
            }
        };

        lines.forEach((line, index) => {
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                currentList.push(<li key={index}>{line.trim().substring(2)}</li>);
            } else {
                endList();
                if (line.trim() !== '') {
                    elements.push(<p key={`p-${index}`}>{line}</p>);
                }
            }
        });

        endList(); // Add any remaining list
        return elements;
    };


    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${isUser ? 'bg-brand-cyan text-white' : 'bg-gray-700 text-gray-200'}`}>
                <div className="prose prose-sm prose-invert max-w-none prose-p:my-1">
                     {renderText(text)}
                </div>
            </div>
        </div>
    );
};

export const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose, state, history, sendMessage, error }) => {
    const [input, setInput] = useState('');
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);
    
    useEffect(() => {
      if (isOpen) {
        // Focus the textarea when modal opens
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    }, [isOpen]);

    const handleSend = () => {
        if (input.trim() && state !== 'thinking') {
            sendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in" style={{ animationDuration: '0.3s' }} onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col border-2 border-purple-500 animate-scale-in" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-brand-light flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a.375.375 0 0 1 .265-.108h3.284a3.375 3.375 0 0 0 3.375-3.375V9.75a3.375 3.375 0 0 0-3.375-3.375H5.25a3.375 3.375 0 0 0-3.375 3.375v3.01Z" /></svg>
                        AI Chat
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl font-bold">&times;</button>
                </header>
                <main className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {history.map((msg, index) => (
                        <ChatBubble key={index} message={msg} />
                    ))}
                    {state === 'thinking' && (
                        <div className="flex justify-start">
                             <div className="max-w-[80%] p-3 rounded-lg bg-gray-700 text-gray-200 flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                                <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    )}
                    <div ref={endOfMessagesRef} />
                </main>
                <footer className="p-4 border-t border-gray-700">
                    {error && <p className="text-red-400 text-sm mb-2">Error: {error}</p>}
                    <div className="flex items-center gap-3">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your project, brainstorm ideas, or refine your prompt..."
                            rows={2}
                            className="flex-1 p-2 bg-gray-900 border-2 border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan resize-none disabled:opacity-50"
                            disabled={state === 'thinking'}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || state === 'thinking'}
                            className="py-2 px-4 bg-brand-cyan text-white font-bold rounded-lg hover:bg-cyan-500 transition active:scale-95 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};