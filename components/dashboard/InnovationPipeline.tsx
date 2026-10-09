
import React from 'react';

interface InnovationPipelineProps {
  currentPhase: number;
  onPhaseClick?: (phase: number) => void;
}

const BrainIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6 6 0 1 0-6 6 6 6 0 0 0 6-6Zm0 0a6 6 0 1 1 6 6 6 6 0 0 1-6-6ZM11.25 15.75h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008ZM12 11.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" /></svg>;
const MicroscopeIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" /></svg>;
const CuboidIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>;
const FileOutputIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;
const ShieldCheckIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>;
const CheckIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;

export const InnovationPipeline: React.FC<InnovationPipelineProps> = ({ currentPhase, onPhaseClick }) => {
  const steps = [
    { id: 1, title: 'Ingestion', icon: BrainIcon, description: 'Idea Intake' },
    { id: 2, title: 'Verification', icon: MicroscopeIcon, description: 'Physics Audit' },
    { id: 3, title: 'HoloEngineering', icon: CuboidIcon, description: '4D Analysis' },
    { id: 4, title: 'Documentation', icon: FileOutputIcon, description: 'IP Packaging' },
    { id: 5, title: 'Sovereign bundle', icon: ShieldCheckIcon, description: 'Sealed Exit' }
  ];

  const calculateProgress = () => {
    return ((currentPhase - 1) / (steps.length - 1)) * 100;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6 px-8 mb-6 transition-all duration-300 shadow-sm z-20">
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          {/* Progress Bar Background */}
          <div className="absolute top-[20px] left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full -z-0" />
          
          {/* Active Progress Bar */}
          <div 
            className="absolute top-[20px] left-0 h-1 bg-brand-cyan -z-0 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            style={{ width: `${calculateProgress()}%` }}
          />

          <div className="flex justify-between relative z-10">
            {steps.map((step) => {
              const isComplete = step.id < currentPhase;
              const isActive = step.id === currentPhase;
              const isFuture = step.id > currentPhase;

              return (
                <button
                  key={step.id}
                  onClick={() => onPhaseClick && !isFuture && onPhaseClick(step.id)}
                  className={`flex flex-col items-center group focus:outline-none transition-all ${isFuture ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
                  disabled={isFuture}
                >
                  <div 
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 bg-white dark:bg-gray-900
                      ${isComplete ? 'border-brand-cyan text-brand-cyan shadow-lg shadow-cyan-900/10' : ''}
                      ${isActive ? 'border-brand-cyan text-white bg-brand-cyan shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-110' : ''}
                      ${isFuture ? 'border-gray-300 dark:border-gray-800 text-gray-300 dark:text-gray-700' : ''}
                    `}
                  >
                    {isComplete ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="mt-3 text-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest block transition-colors duration-300 ${
                      isActive ? 'text-brand-cyan' : 
                      isComplete ? 'text-gray-700 dark:text-gray-300' : 
                      'text-gray-400 dark:text-gray-600'
                    }`}>
                      {step.title}
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest block transition-colors duration-300 mt-1 ${
                       isActive ? 'text-brand-cyan/60' : 'text-gray-400 dark:text-gray-700'
                    }`}>
                      {step.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
