import React, { useState } from 'react';
import { 
  Flame, 
  Box, 
  BarChart2, 
  Sparkles, 
  Cpu, 
  ArrowLeft, 
  Download, 
  ExternalLink,
  Zap,
  Layers,
  Terminal,
  Activity
} from 'lucide-react';
import { PyTorchStudio } from './PyTorchStudio';
import { TensorFlowStudio } from './TensorFlowStudio';
import { TensorBoardDashboard } from './TensorBoardDashboard';
import { PinnsSurrogateLab } from './PinnsSurrogateLab';
import { User, ComputeEvent } from '../../types';

interface NeuralWorkbenchProps {
  user?: User;
  onAddComputeEvent?: (event: ComputeEvent) => void;
  onBackToApp?: () => void;
  className?: string;
}

export const NeuralWorkbench: React.FC<NeuralWorkbenchProps> = ({
  user,
  onAddComputeEvent,
  onBackToApp,
  className = ''
}) => {
  const [activeModule, setActiveModule] = useState<'pytorch' | 'tensorflow' | 'tensorboard' | 'pinns'>('tensorboard');

  const handleTriggerComputeEvent = (type: string, details: string, cost: number) => {
    if (onAddComputeEvent) {
      onAddComputeEvent({
        id: `ev-ml-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type,
        user: user?.name || 'ML Architect',
        cost,
        status: 'SUCCESS',
        details
      });
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-slate-950 text-slate-100 ${className}`}>
      {/* Top Banner Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold transition border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Projects</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center p-1.5 shadow-md shadow-orange-950/40">
              <Zap className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-sm font-black uppercase font-mono tracking-wider text-white">
                Neural Forge ML Engine
              </span>
              <span className="hidden sm:inline-block text-[11px] text-slate-400 ml-2 font-mono">
                Full PyTorch & TensorFlow / TensorBoard Capabilities
              </span>
            </div>
          </div>
        </div>

        {/* Module Switcher Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveModule('pytorch')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${
              activeModule === 'pytorch'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>PyTorch</span>
          </button>

          <button
            onClick={() => setActiveModule('tensorflow')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${
              activeModule === 'tensorflow'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>TensorFlow</span>
          </button>

          <button
            onClick={() => setActiveModule('tensorboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${
              activeModule === 'tensorboard'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>TensorBoard</span>
          </button>

          <button
            onClick={() => setActiveModule('pinns')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${
              activeModule === 'pinns'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PINNs Lab</span>
          </button>
        </div>
      </nav>

      {/* Main Module Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeModule === 'pytorch' && (
            <PyTorchStudio onTriggerComputeEvent={handleTriggerComputeEvent} />
          )}

          {activeModule === 'tensorflow' && (
            <TensorFlowStudio onTriggerComputeEvent={handleTriggerComputeEvent} />
          )}

          {activeModule === 'tensorboard' && (
            <TensorBoardDashboard onTriggerComputeEvent={handleTriggerComputeEvent} />
          )}

          {activeModule === 'pinns' && (
            <PinnsSurrogateLab onTriggerComputeEvent={handleTriggerComputeEvent} />
          )}
        </div>
      </main>
    </div>
  );
};
