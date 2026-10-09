import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Faction, FactionId, User, Role } from '../types';
import { UseSetupAssistant } from '../hooks/useSetupAssistant';
import { ENGINEERING_PHILOSOPHIES } from '../constants';
import { RoiEditorModal } from './RoiEditorModal';
import { usePromptValidator } from '../hooks/usePromptValidator';

// Icon for cropping
const CropIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21L11.25 21V13.5M13.5 10.5H10.5M13.5 10.5V3M10.5 13.5H3L12.75 3H10.5M10.5 13.5V21" />
    </svg>
);

interface PromptInputProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  onEngage: () => void;
  isLoading: boolean;
  onClearFiles: () => void;
  isReady: boolean;
  authenticatedUser: User;
  setupAssistant: UseSetupAssistant;
  onApplyFactionSuggestion: (factionId: FactionId) => void;
  onReanalyzeWithFaction: () => void;
  selectedFaction: Faction | null;
  activeVersionFactionId: FactionId | undefined;
  promptValidator: ReturnType<typeof usePromptValidator>;
  hasKnowledgeContext?: boolean;
  onTechnicalIntake?: (file: File) => void;
  onPhdResearch?: (file: File) => void;
}

const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;

const TagInput = ({ tags, onTagsChange, disabled }: { tags: string[]; onTagsChange: (tags: string[]) => void; disabled: boolean; }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                onTagsChange([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (indexToRemove: number) => {
        onTagsChange(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div>
             <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-600/50 text-purple-700 dark:text-purple-200">
                        {tag}
                        <button onClick={() => !disabled && removeTag(index)} disabled={disabled} className="text-purple-500 dark:text-purple-200 hover:text-purple-900 dark:hover:white disabled:cursor-not-allowed">
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tags (e.g., consumer electronics)..."
                className="w-full p-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition disabled:opacity-50"
                disabled={disabled}
            />
        </div>
    );
};

export const PromptInput = ({ 
  projectName, 
  onProjectNameChange, 
  prompt, 
  onPromptChange, 
  tags,
  onTagsChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  files, 
  onFilesChange, 
  onEngage, 
  isLoading, 
  onClearFiles,
  isReady,
  authenticatedUser,
  setupAssistant,
  onApplyFactionSuggestion,
  onReanalyzeWithFaction,
  selectedFaction,
  activeVersionFactionId,
  promptValidator,
  hasKnowledgeContext = false,
  onTechnicalIntake,
  onPhdResearch,
}: PromptInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [roiEditorState, setRoiEditorState] = useState<{ isOpen: boolean; file: File | null; fileIndex: number | null }>({ isOpen: false, file: null, fileIndex: null });
  // Fix: Use Role.Viewer from enum instead of string literal to resolve "unintentional comparison" type error.
  const isViewer = authenticatedUser.role === Role.Viewer;
  const { validationResult, isChecking, checkPrompt, clearValidation, error: validationError } = promptValidator;
  
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const debounceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (localPrompt !== prompt) {
        setLocalPrompt(prompt);
    }
  }, [prompt, localPrompt]);

  const handleLocalPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalPrompt(newValue);

    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
        onPromptChange(newValue);
    }, 500);
  };

  const canReanalyze = selectedFaction && activeVersionFactionId && selectedFaction.id !== activeVersionFactionId;

  const handleOpenRoiEditor = (file: File, index: number) => {
      setRoiEditorState({ isOpen: true, file, fileIndex: index });
  };

  const handleCropComplete = (croppedFiles: File[]) => {
      if (roiEditorState.fileIndex !== null) {
          const newFiles = [...files];
          newFiles.splice(roiEditorState.fileIndex, 1, ...croppedFiles);
          onFilesChange(newFiles);
      }
      setRoiEditorState({ isOpen: false, file: null, fileIndex: null });
  };

  const handleClearAllFiles = () => {
    onClearFiles();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isUndo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z';
      const isRedo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y';
      const isMacRedo = event.metaKey && event.shiftKey && event.key.toLowerCase() === 'z';

      if (isUndo && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) onUndo();
      } else if (isRedo || isMacRedo) {
        event.preventDefault();
        if (canRedo) onRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, onUndo, onRedo]);
  
  useEffect(() => {
    checkPrompt(localPrompt);
  }, [localPrompt, checkPrompt]);
  
  useEffect(() => {
    return () => clearValidation();
  }, [clearValidation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = Array.from(e.target.files);
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleDragEvents = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    handleDragEvents(e);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [handleDragEvents]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    handleDragEvents(e);
    setIsDragging(false);
  }, [handleDragEvents]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles: File[] = Array.from(e.dataTransfer.files);
        onFilesChange([...files, ...droppedFiles]);
    }
  }, [handleDragEvents, files, onFilesChange]);

  const recommendedFaction = useMemo(() => {
    if (!setupAssistant.suggestions) return null;
    return ENGINEERING_PHILOSOPHIES.find(f => f.id === setupAssistant.suggestions.recommendedFactionId);
  }, [setupAssistant.suggestions]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-brand-light">2. Project Details & Concept</h2>
              {hasKnowledgeContext && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-brand-cyan">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[10px] font-black text-brand-cyan uppercase tracking-tighter">Retrieval Active</span>
                  </div>
              )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onUndo} disabled={!canUndo || isLoading || isViewer} className="p-2 text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition" title="Undo (Ctrl+Z)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
            </button>
            <button onClick={onRedo} disabled={!canRedo || isLoading || isViewer} className="p-2 text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition" title="Redo (Ctrl+Y)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" /></svg>
            </button>
          </div>
        </div>
         <input
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="Enter a name for your project..."
          className="w-full p-3 mb-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isViewer}
        />
        <textarea
          id="tour-step-2"
          value={localPrompt}
          onChange={handleLocalPromptChange}
          placeholder="e.g., Analyze the gear mechanism and power system of this cordless drill based on the attached images..."
          className="w-full h-48 p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isViewer}
        />

        {(isChecking || validationResult || validationError) && (
          <div className={`mt-4 p-3 rounded-lg animate-fade-in flex items-start gap-3 ${validationError ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700' : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'}`}>
            {isChecking ? (
                <svg className="animate-spin h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : validationError ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            ) : validationResult?.isClear ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            )}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                {isChecking ? 'Checking prompt clarity...' : validationError ? 'Validation Failed' : validationResult?.isClear ? 'Prompt is clear' : 'Prompt could be improved'}
              </h4>
              {validationError ? (
                 <p className="text-sm text-red-600 dark:text-red-300/80 mt-1">{validationError}</p>
              ) : (validationResult && !validationResult.isClear && validationResult.suggestion && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300/80 mt-1">Suggestion: {validationResult.suggestion}</p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3">
            <TagInput tags={tags} onTagsChange={onTagsChange} disabled={isLoading || isViewer} />
        </div>
      </div>
      {(setupAssistant.isLoading || setupAssistant.suggestions || setupAssistant.error) && (
        <div className="p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg animate-fade-in">
          <h3 className="text-md font-semibold text-gray-900 dark:text-brand-light mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
            AI-Powered Setup Assistant
          </h3>
          {setupAssistant.isLoading && <p className="text-sm text-gray-400">Analyzing concept for suggestions...</p>}
          {setupAssistant.error && <p className="text-sm text-red-400">{setupAssistant.error}</p>}
          {setupAssistant.suggestions && recommendedFaction && (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recommended Lens:</h4>
                <button onClick={() => onApplyFactionSuggestion(recommendedFaction.id)} className="text-left w-full p-2 mt-1 bg-cyan-50 dark:bg-cyan-900/40 border border-brand-cyan rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition">
                  <p className="font-bold text-brand-cyan">{recommendedFaction.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{recommendedFaction.philosophy}</p>
                </button>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Suggested Tags:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {setupAssistant.suggestions.suggested_tags.map(tag => (
                    <button key={tag} onClick={() => onTagsChange(Array.from(new Set([...tags, tag])))} className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-600/50 text-purple-700 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-600/80 transition">
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-brand-light mb-3">3. Upload Files (Optional)</h2>
        <div
          id="tour-step-3"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragEvents}
          onDrop={handleDrop}
          onClick={() => !(isLoading || isViewer) && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition
            ${isDragging ? 'border-brand-cyan bg-cyan-50 dark:bg-cyan-900/30' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}
            ${(isLoading || isViewer) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}`
          }
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            disabled={isLoading || isViewer}
          />
          {files.length === 0 ? (
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 mb-2 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V8.25c0-1.121.904-2.025 2.025-2.025h13.95A2.025 2.025 0 0 1 21 8.25v9a2.025 2.025 0 0 1-2.025 2.025H5.025A2.025 2.025 0 0 1 3 17.25Z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop files (Images, PDFs) or click to browse</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">For images, select ROI; for PDFs, trigger Technical Intake.</p>
            </div>
          ) : (
            <div className="w-full text-left">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-brand-light">Attached Files:</h4>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleClearAllFiles(); }} 
                  className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50" 
                  title="Clear all files"
                  disabled={isLoading || isViewer}
                  >
                  Clear
                </button>
              </div>
              <ul className="text-xs space-y-1 max-h-48 overflow-y-auto pr-2">
                {files.map((file, index) => (
                   <li key={index} className="flex flex-col gap-1 p-2 bg-gray-100 dark:bg-gray-700/50 rounded group">
                        <div className="flex items-center gap-2 min-w-0 text-gray-700 dark:text-gray-200">
                            <FileIcon />
                            <span className="truncate flex-1 font-medium" title={file.name}>{file.name}</span>
                            {file.name.startsWith('roi_') && <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-tighter">[ROI]</span>}
                        </div>
                        <div className="flex gap-2 mt-1">
                            {file.type.startsWith('image/') && !file.name.startsWith('roi_') && !isViewer && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenRoiEditor(file, index); }}
                                    className="text-[9px] py-1 px-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-brand-cyan hover:text-white transition-all active:scale-95 text-gray-700 dark:text-gray-200 font-black uppercase tracking-widest"
                                    disabled={isLoading}
                                >
                                    Select ROI
                                </button>
                            )}
                            {file.type === 'application/pdf' && !isViewer && onTechnicalIntake && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onTechnicalIntake(file); }}
                                    className="text-[9px] py-1 px-2 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded hover:bg-brand-cyan hover:text-white transition-all active:scale-95 font-black uppercase tracking-widest"
                                    disabled={isLoading}
                                >
                                    Technical Intake
                                </button>
                            )}
                            {file.type === 'application/pdf' && !isViewer && onPhdResearch && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPhdResearch(file); }}
                                    className="text-[9px] py-1 px-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-600 hover:text-white transition-all active:scale-95 font-black uppercase tracking-widest"
                                    disabled={isLoading}
                                >
                                    PhD Research
                                </button>
                            )}
                        </div>
                    </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
       <RoiEditorModal 
          isOpen={roiEditorState.isOpen}
          file={roiEditorState.file}
          onClose={() => setRoiEditorState({ isOpen: false, file: null, fileIndex: null })}
          onCropComplete={handleCropComplete}
      />
      <div className="flex items-stretch gap-2">
        <button
          id="tour-step-4"
          onClick={onEngage}
          disabled={!isReady || isLoading || isViewer}
          className="flex-grow py-3 px-4 bg-brand-cyan text-white font-bold rounded-lg text-lg hover:bg-cyan-500 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
            {validationResult && !validationResult.isClear && !isViewer && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-300">
                <title>Prompt could be improved</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            )}
            {isViewer ? "Viewing Mode" : "Engage SynapseForge AI"}
            </>
          )}
        </button>
        <button
            onClick={onReanalyzeWithFaction}
            disabled={!canReanalyze || isLoading || isViewer}
            className="py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            title={canReanalyze ? `Apply '${selectedFaction?.name}' and re-run analysis` : 'Select a different faction to enable re-analysis'}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 0 0-3.375-3.375H8.25a3.375 3.375 0 0 0-3.375 3.375v4.992" /></svg>
            Apply Faction
        </button>
      </div>
    </div>
  );
};
