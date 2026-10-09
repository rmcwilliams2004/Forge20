import React, { useState, useEffect, useCallback } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Shield, 
  Eye, 
  Edit3, 
  Trash2, 
  Users, 
  Clock, 
  Mail, 
  Lock, 
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';
import { Project, ProjectSharePermission, ProjectShareRecord, ProjectCollaborator, User } from '../types';
import { backendApiService } from '../services/backendApiService';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  currentUser?: User | null;
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUser
}) => {
  const [permission, setPermission] = useState<ProjectSharePermission>('view');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedShare, setGeneratedShare] = useState<ProjectShareRecord | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [existingShares, setExistingShares] = useState<ProjectShareRecord[]>([]);
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing shares for this project
  const loadExistingShares = useCallback(async () => {
    if (!project?.id) return;
    setIsLoadingHistory(true);
    try {
      const data = await backendApiService.getProjectShares(project.id);
      setExistingShares(data.shares || []);
      setCollaborators(data.collaborators || []);
    } catch (err) {
      console.warn('Failed to load project share history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [project?.id]);

  useEffect(() => {
    if (isOpen && project?.id) {
      loadExistingShares();
      setGeneratedShare(null);
      setErrorMsg(null);
      setSuccessMsg(null);
      setHasCopied(false);
    }
  }, [isOpen, project?.id, loadExistingShares]);

  if (!isOpen || !project) return null;

  const getFullShareUrl = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${pathname}?share=${encodeURIComponent(token)}`;
  };

  const handleGenerateShare = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await backendApiService.createProjectShare(
        project.id,
        permission,
        invitedEmail.trim() || undefined,
        expiresInDays,
        project,
        currentUser?.name || 'Project Lead'
      );

      setGeneratedShare(result.share_record);
      setSuccessMsg(
        permission === 'edit'
          ? 'Collaborative edit link generated and synced to shared schema.'
          : 'Read-only inspection link generated and synced to shared schema.'
      );
      // Reload shares history
      await loadExistingShares();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create project share link.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async (token: string) => {
    const url = getFullShareUrl(token);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share URL:', err);
    }
  };

  const handleRevokeShare = async (token: string) => {
    if (!project?.id) return;
    try {
      await backendApiService.revokeProjectShare(project.id, token);
      if (generatedShare?.share_token === token) {
        setGeneratedShare(null);
      }
      await loadExistingShares();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to revoke share link.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800/80 bg-gradient-to-r from-brand-cyan/10 via-transparent to-indigo-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan flex items-center justify-center shadow-inner">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Share Project
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                  Shared Schema
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md mt-0.5">
                {project.name} &bull; <span className="font-mono text-[11px]">{project.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-500 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Permission Tier Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Collaborator Permission Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Can View */}
              <button
                type="button"
                onClick={() => setPermission('view')}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  permission === 'view'
                    ? 'bg-brand-cyan/10 border-brand-cyan shadow-sm dark:shadow-cyan-950/30 ring-1 ring-brand-cyan'
                    : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`p-1.5 rounded-lg ${permission === 'view' ? 'bg-brand-cyan text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Can View (Read-Only)
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Inspect 3D CAD B-Rep, multi-physics convergence charts, RAG intelligence, and export formal PDF reports.
                </p>
              </button>

              {/* Can Edit */}
              <button
                type="button"
                onClick={() => setPermission('edit')}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  permission === 'edit'
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-sm dark:shadow-indigo-950/30 ring-1 ring-indigo-500'
                    : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`p-1.5 rounded-lg ${permission === 'edit' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Can Edit (Collaborative)
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Modify engineering parameters, dispatch PINN simulations, edit task trees, and commit version milestones.
                </p>
              </button>
            </div>
          </div>

          {/* Invitation Configuration (Email & Expiration) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-cyan" />
                Invite Specific Email (Optional)
              </label>
              <input
                type="email"
                placeholder="colleague@engineering.org"
                value={invitedEmail}
                onChange={(e) => setInvitedEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                Expires In
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan font-mono"
              >
                <option value={7}>7 Days</option>
                <option value={30}>30 Days (Default)</option>
                <option value={90}>90 Days</option>
                <option value={365}>1 Year</option>
              </select>
            </div>
          </div>

          {/* Generate Link Trigger */}
          <div>
            <button
              onClick={handleGenerateShare}
              disabled={isGenerating}
              className="w-full py-3 bg-brand-cyan hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering in Shared Schema...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Unique Shareable Link</span>
                </>
              )}
            </button>
          </div>

          {/* Newly Generated Share Link Box */}
          {generatedShare && (
            <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/30 rounded-2xl space-y-3 animate-slide-in-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-brand-cyan">
                    Active Share Link Generated
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  generatedShare.permission === 'edit'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {generatedShare.permission.toUpperCase()} ACCESS
                </span>
              </div>

              {/* Link Input & Copy Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getFullShareUrl(generatedShare.share_token)}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-gray-800 dark:text-gray-200 select-all focus:outline-none"
                />
                <button
                  onClick={() => handleCopyLink(generatedShare.share_token)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                    hasCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-cyan hover:bg-cyan-500 text-white'
                  }`}
                >
                  {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                <span>Token: <strong className="font-mono text-gray-700 dark:text-gray-300">{generatedShare.share_token}</strong></span>
                <a
                  href={getFullShareUrl(generatedShare.share_token)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-brand-cyan hover:underline font-bold"
                >
                  <span>Test Link in New Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Active Links & Collaborators History */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-cyan" />
                Active Share Links ({existingShares.length})
              </h4>
              {isLoadingHistory && (
                <span className="text-[10px] font-mono text-gray-400 animate-pulse">Syncing...</span>
              )}
            </div>

            {existingShares.length === 0 ? (
              <div className="p-4 bg-gray-50 dark:bg-slate-800/30 rounded-xl text-center text-xs text-gray-400">
                No active share links created for this project yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {existingShares.map((share) => (
                  <div
                    key={share.id || share.share_token}
                    className="p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                          share.permission === 'edit'
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {share.permission.toUpperCase()}
                        </span>
                        <span className="font-mono text-gray-700 dark:text-gray-300 text-[11px] truncate">
                          {share.share_token}
                        </span>
                        {share.invited_email && (
                          <span className="text-[10px] text-gray-400 truncate">
                            &bull; {share.invited_email}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-3">
                        <span>Created: {new Date(share.created_at).toLocaleDateString()}</span>
                        <span>Accesses: {share.access_count || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleCopyLink(share.share_token)}
                        className="p-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-brand-cyan hover:text-white rounded-lg transition"
                        title="Copy Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRevokeShare(share.share_token)}
                        className="p-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white rounded-lg transition"
                        title="Revoke Share Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security & Cryptographic Provenance Attestation */}
          <div className="p-3 bg-gray-50 dark:bg-slate-800/30 rounded-2xl border border-gray-100 dark:border-slate-800 flex items-start gap-3 text-[11px] text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Shared links save the current project state into the shared database schema. Recipient clients inherit strictly enforced granular permissions (read-only verification or collaborative authoring). Revoking a link terminates access instantaneously.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-mono">
            SynapseForge Project Access Protocol
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-xl text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
