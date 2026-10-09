import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  Check, 
  Flame, 
  Cpu, 
  ShieldCheck, 
  Calendar, 
  User, 
  Building2, 
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { ComputeEvent } from '../../types';
import { 
  exportComputeStakeholderReportPDF, 
  StakeholderMilestoneItem,
  aggregateHeatmapData 
} from '../../services/stakeholderReportService';

interface StakeholderReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  events: ComputeEvent[];
  milestones: StakeholderMilestoneItem[];
  defaultReviewerName?: string;
  defaultReviewerTitle?: string;
}

export const StakeholderReportModal: React.FC<StakeholderReportModalProps> = ({
  isOpen,
  onClose,
  projectName,
  events,
  milestones,
  defaultReviewerName = 'Dr. R. McWilliams',
  defaultReviewerTitle = 'Lead Systems Architect & Auditor'
}) => {
  const [reviewerName, setReviewerName] = useState(defaultReviewerName);
  const [reviewerTitle, setReviewerTitle] = useState(defaultReviewerTitle);
  const [organization, setOrganization] = useState('SynapseForge Autonomous Systems');
  const [notes, setNotes] = useState(
    'Validated compute allocations, solver latency profiles, and multi-physics verification milestones for active engineering sprint review.'
  );

  const [includeHeatmap, setIncludeHeatmap] = useState(true);
  const [includeSurgeAnalysis, setIncludeSurgeAnalysis] = useState(true);
  const [includeMilestones, setIncludeMilestones] = useState(true);
  const [includeSignoff, setIncludeSignoff] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const aggregated = aggregateHeatmapData(events);
  const totalMilestones = milestones.length;
  const verifiedCount = milestones.filter(m => 
    m.status === 'VERIFIED' || m.status === 'OPTIMIZED' || m.status === 'SUCCESS'
  ).length;

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      await exportComputeStakeholderReportPDF({
        projectName,
        reviewerName: reviewerName.trim() || 'Principal Systems Auditor',
        reviewerTitle: reviewerTitle.trim() || 'Engineering Governance Lead',
        organization: organization.trim() || 'SynapseForge Autonomous Systems',
        notes: notes.trim(),
        events,
        milestones,
        options: {
          includeHeatmapVisual: includeHeatmap,
          includeSurgeAnalysis,
          includeMilestoneTable: includeMilestones,
          includeSignoff
        }
      });

      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to export stakeholder report PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Export Stakeholder PDF Report
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-500/10 text-brand-cyan border border-brand-cyan/20">
                  Audit Grade
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate an auditable PDF report containing the compute consumption heatmap & milestone ledger.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Compute</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                ${aggregated.totalCost.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{events.length} tracked events</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Logged Milestones</span>
              <span className="text-lg font-black text-brand-cyan">
                {totalMilestones} Milestones
              </span>
              <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">{verifiedCount} verified</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Peak Window</span>
              <span className="text-xs font-black text-rose-500 mt-1 block truncate">
                {aggregated.peakCells[0] ? `${aggregated.peakCells[0].dayName} ${aggregated.peakCells[0].blockLabel}:00 UTC` : 'Mid-week Sprints'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">GPU Surge Alert</span>
            </div>
          </div>

          {/* Configuration Inputs */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-brand-cyan" /> Stakeholder & Auditor Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Stakeholder / Reviewer Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Dr. R. McWilliams"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={reviewerTitle}
                  onChange={(e) => setReviewerTitle(e.target.value)}
                  placeholder="e.g. Principal Systems Auditor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organization / Entity
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. SynapseForge Autonomous Systems"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Executive Notes / Review Comments
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter governance notes or scope justification for stakeholder sign-off..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan resize-none"
                />
              </div>
            </div>
          </div>

          {/* Report Sections Toggle */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-brand-cyan" /> Included Report Sections
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeHeatmap}
                  onChange={(e) => setIncludeHeatmap(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-cyan focus:ring-brand-cyan accent-cyan-500"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Visual 7x12 Heatmap Matrix</span>
                  <span className="text-[10px] text-slate-400">Temporal vector grid with color intensity scale</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeSurgeAnalysis}
                  onChange={(e) => setIncludeSurgeAnalysis(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-cyan focus:ring-brand-cyan accent-cyan-500"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Surge & Bottleneck Table</span>
                  <span className="text-[10px] text-slate-400">Peak GPU load & congestion window breakdown</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeMilestones}
                  onChange={(e) => setIncludeMilestones(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-cyan focus:ring-brand-cyan accent-cyan-500"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Milestone Ledger & Logs</span>
                  <span className="text-[10px] text-slate-400">{totalMilestones} Foundry CAD, Genesis & FEA milestones</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeSignoff}
                  onChange={(e) => setIncludeSignoff(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-cyan focus:ring-brand-cyan accent-cyan-500"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Stakeholder Sign-Off Block</span>
                  <span className="text-[10px] text-slate-400">Formal governance attestation & signature lines</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Format: <strong className="text-slate-700 dark:text-slate-300">A4 PDF Document</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleExport}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-lg active:scale-95 ${
                successNotice
                  ? 'bg-emerald-600 shadow-emerald-900/20'
                  : 'bg-brand-cyan hover:bg-cyan-600 shadow-cyan-900/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Report...
                </>
              ) : successNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded Successfully!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
