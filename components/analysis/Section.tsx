
import React, { useState } from 'react';

interface SectionProps {
  id?: string;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  defaultOpen?: boolean;
}

export const Section: React.FC<SectionProps> = ({ id, title, children, actions, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div id={id} className="mb-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-brand-cyan transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : '-rotate-90'}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    <h3 className="text-base font-bold text-gray-800 dark:text-white uppercase tracking-tight">
                        {title}
                    </h3>
                </div>
                {actions && <div className="flex gap-2 items-center">{actions}</div>}
            </div>
            {isOpen && <div className="p-6 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>}
        </div>
    );
}
