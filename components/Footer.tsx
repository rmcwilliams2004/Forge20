import React from 'react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="w-full py-6 px-8 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-brand-dark/50 backdrop-blur-sm text-[9px] text-gray-400 dark:text-gray-500 font-mono uppercase tracking-widest z-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                         <svg className="w-4 h-4 text-brand-cyan/50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        </svg>
                        <span className="font-black text-gray-300">SYNAPSEFORGE AI</span>
                    </div>
                    <div className="h-4 w-px bg-gray-700 hidden md:block" />
                    <div className="flex gap-4">
                        <button className="hover:text-brand-cyan transition-colors">Terms of Service</button>
                        <button className="hover:text-brand-cyan transition-colors">Privacy Policy</button>
                        <button className="hover:text-brand-cyan transition-colors">IP Agreement</button>
                    </div>
                </div>
                
                <div className="text-center md:text-right max-w-lg leading-relaxed">
                    <span className="text-red-900 dark:text-red-500 font-black">CRITICAL DISCLAIMER:</span> ALL FORGE OUTPUTS ARE THEORETICAL 
                    AND PROVISIONAL. PHYSICAL VIABILITY MUST BE VERIFIED BY A LICENSED PROFESSIONAL ENGINEER (PE). 
                    © {currentYear} CAIDI INSTITUTE | RICHARD MCWILLIAMS CONSULTING LLC.
                </div>
            </div>
        </footer>
    );
};