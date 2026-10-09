import React, { useState, useEffect } from 'react';
import { Milestone } from '../types';
import { 
  Box, 
  ShieldCheck, 
  Cpu, 
  Flame, 
  Sparkles, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { playMilestoneChime } from '../services/notificationService';

interface SystemToastProps {
  onViewTimeline?: () => void;
}

export const SystemToast: React.FC<SystemToastProps> = ({ onViewTimeline }) => {
  const [activeMilestones, setActiveMilestones] = useState<Milestone[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const handleMilestone = (e: any) => {
      const data: Milestone = e.detail;
      if (!data) return;

      const newMilestone: Milestone = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      };

      setActiveMilestones(prev => [newMilestone, ...prev].slice(0, 3)); // Keep max 3 active in stack

      // Play sound if enabled and not disabled in detail
      if (soundEnabled) {
        playMilestoneChime();
      }
    };

    window.addEventListener('forge-milestone', handleMilestone);
    return () => window.removeEventListener('forge-milestone', handleMilestone);
  }, [soundEnabled]);

  // Auto-dismiss the oldest notification after 7 seconds
  useEffect(() => {
    if (activeMilestones.length === 0) return;

    const timer = setTimeout(() => {
      setActiveMilestones(prev => prev.slice(0, prev.length - 1));
    }, 7000);

    return () => clearTimeout(timer);
  }, [activeMilestones]);

  const dismissMilestone = (id: string) => {
    setActiveMilestones(prev => prev.filter(m => m.id !== id));
  };

  if (activeMilestones.length === 0) return null;

  const current = activeMilestones[0];

  const getMilestoneVisuals = (type: string) => {
    switch (type) {
      case 'FOUNDRY_SYNTHESIS':
        return {
          icon: Box,
          gradient: 'from-cyan-500/20 to-indigo-500/10',
          border: 'border-cyan-500/40',
          text: 'text-brand-cyan',
          badgeBg: 'bg-cyan-500/20 text-cyan-400',
          label: 'Foundry CAD Synthesis'
        };
      case 'GENESIS_AUDIT':
        return {
          icon: ShieldCheck,
          gradient: 'from-emerald-500/20 to-cyan-500/10',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-400',
          label: 'Genesis 4D Physics Audit'
        };
      case 'MASTERMIND_SESSION':
        return {
          icon: Cpu,
          gradient: 'from-violet-500/20 to-indigo-500/10',
          border: 'border-violet-500/40',
          text: 'text-violet-400',
          badgeBg: 'bg-violet-500/20 text-violet-400',
          label: 'Mastermind Council Protocol'
        };
      case 'FEA_SIMULATION':
      case 'SIMULATION':
        return {
          icon: Flame,
          gradient: 'from-rose-500/20 to-amber-500/10',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          badgeBg: 'bg-rose-500/20 text-rose-400',
          label: 'Multiphysics Solver'
        };
      case 'STRUCTURAL':
        return {
          icon: CheckCircle2,
          gradient: 'from-blue-500/20 to-cyan-500/10',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          badgeBg: 'bg-blue-500/20 text-blue-400',
          label: 'Structural Milestone'
        };
      default:
        return {
          icon: Sparkles,
          gradient: 'from-cyan-500/20 to-blue-500/10',
          border: 'border-brand-cyan/40',
          text: 'text-brand-cyan',
          badgeBg: 'bg-brand-cyan/20 text-brand-cyan',
          label: 'Compute Milestone'
        };
    }
  };

  const visuals = getMilestoneVisuals(current.type);
  const Icon = visuals.icon;

  const handleActionClick = () => {
    if (onViewTimeline) {
      onViewTimeline();
    } else {
      // Dispatch event to scroll or switch to timeline
      window.dispatchEvent(new CustomEvent('focus-project-timeline'));
    }
    dismissMilestone(current.id);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-md w-full sm:w-[420px] animate-slide-in-up">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-brand-cyan/15 rounded-3xl blur-2xl -z-10" />

      <div
        className={`bg-gray-950/95 text-white border-2 ${visuals.border} p-5 rounded-3xl shadow-2xl backdrop-blur-2xl transition-all duration-300 relative overflow-hidden`}
      >
        {/* Top Progress / Expiry Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div className="h-full bg-gradient-to-r from-brand-cyan via-indigo-500 to-emerald-400 w-full animate-[shrink_7s_linear_forwards]" />
        </div>

        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2 pt-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${visuals.badgeBg}`}
            >
              {visuals.label}
            </span>
            {current.cost !== undefined && (
              <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded-full text-[9px] font-mono font-bold text-gray-300 flex items-center gap-0.5">
                <DollarSign className="w-2.5 h-2.5 text-brand-cyan" />
                {current.cost.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 text-gray-500 hover:text-gray-300 transition-colors rounded-lg"
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => dismissMilestone(current.id)}
              className="p-1 text-gray-500 hover:text-white transition-colors rounded-lg"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-4 my-2">
          <div
            className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${visuals.gradient} border ${visuals.border} flex items-center justify-center ${visuals.text} shadow-inner flex-shrink-0 mt-0.5`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-white italic uppercase tracking-tight truncate">
              {current.title}
            </h4>
            <p className="text-xs text-gray-300 line-clamp-2 mt-0.5 leading-relaxed">
              {current.description}
            </p>

            {current.projectName && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-900/90 rounded-md border border-gray-800 text-[10px] text-gray-400">
                <span>Active Project:</span>
                <strong className="text-white font-bold truncate max-w-[180px]">
                  {current.projectName}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-800/80 text-xs">
          <span className="text-[10px] font-mono text-gray-500">
            {new Date(current.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>

          <div className="flex items-center gap-2">
            {activeMilestones.length > 1 && (
              <span className="text-[9px] font-bold text-gray-500">
                +{activeMilestones.length - 1} more
              </span>
            )}
            <button
              onClick={handleActionClick}
              className="flex items-center gap-1 px-3 py-1 bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan hover:text-cyan-300 rounded-lg text-xs font-bold transition-all border border-brand-cyan/30 active:scale-95"
            >
              <span>View in Timeline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
