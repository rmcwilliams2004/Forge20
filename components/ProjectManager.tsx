
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, User, Role, ProjectIndexEntry, IngestedDocument, EngineeringBranch } from '../types';
import { Modal } from './Modal';
import { agenticKnowledgeIngestion } from '../services/knowledgeService';

interface ProjectManagerProps {
    projects: ProjectIndexEntry[];
    activeProject: Project | null;
    activeVersionIndex: number;
    onSelectProject: (projectId: string) => void;
    onNewProject: () => void;
    onOpenFile: (file: File) => void;
    onSaveProject: () => void;
    hasUnsavedChanges: boolean;
    onCommitVersion: () => void;
    onStartWithDeVinci: () => void;
    onStartFromImage: (file: File) => void;
    isParsingImage: boolean;
    onStartFromPdf: (file: File) => void;
    isParsingPdf: boolean;
    onStartBrainstormFromPdf: (file: File) => void;
    isParsingForBrainstorm: boolean;
    onIdentifyImage: (file: File) => void;
    isIdentifyingImage: boolean;
    onOpenVideoImport: () => void;
    isParsingVideo: boolean;
    onEditProject: (project: Project) => void;
    onDeleteProject: (projectId: string) => void;
    onLoadVersion: (index: number) => void;
    onRevertVersion: (index: number) => void;
    onCompareVersions: (project: Project, newVersionIndex: number) => void;
    disabled: boolean;
    authenticatedUser: User;
    onSaveToDrive: () => void;
    onOpenFromDrive: () => void;
    isSavingToDrive: boolean;
    isDriveAuthenticated: boolean;
    onAddDocument?: (doc: IngestedDocument) => void;
    onRemoveDocument?: (id: string) => void;
    addLog: (level: 'INFO' | 'WARN' | 'ERROR', message: string) => void;
}

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
};

const Icons = {
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>,
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
    Restore: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 0 0-3.375-3.375H8.25a3.375 3.375 0 0 0-3.375 3.375v4.992" /></svg>,
    Edit: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>,
    Commit: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
    SaveFile: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>,
    Drive: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12.01 1.485c2.082 0 3.754.025 4.568.06C18.722 1.636 20.343 2.138 21.556 3.351c1.213 1.213 1.715 2.834 1.806 4.976.035.814.06 2.486.06 4.568 0 2.057-.025 3.696-.058 4.502-.09 2.14-.592 3.759-1.803 4.97-1.211 1.211-2.829 1.713-4.964 1.803-.807.034-2.448.06-4.508.06s-3.77-.025-4.587-.06c-2.133-.09-3.751-.592-4.963-1.803-1.21-1.211-1.712-2.83-1.802-4.965C.705 15.337.68 13.637.68 11.493c0-2.082.025-3.754.06-4.568C.832 4.783 1.333 3.162 2.546 1.95 3.759.737 5.38.235 7.522.143 8.336.108 10.008.083 12.01.083v1.402zm-1.95 16.09h8.736l-2.812-4.888h-5.88l-2.865 4.888H10.06zm-2.288-1.613l2.848-4.905L7.85 6.3H2.19l5.582 9.662zM9.518 9.23h6.428L13.12 4.3H9.518v4.93zM14.95 11.15h5.896l-2.864-4.888H12.1l2.85 4.888z" /></svg>,
    Brain: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6 6 0 1 0-6 6 6 6 0 0 0 6-6Zm0 0a6 6 0 1 1 6 6 6 6 0 0 1-6-6ZM11.25 15.75h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008ZM12 11.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" /></svg>,
    Photo: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
    Pdf: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12.75h4.875c.621 0 1.125-.504 1.125-1.125V11.25a2.25 2.25 0 0 0-2.25-2.25H6.375a2.25 2.25 0 0 0-2.25 2.25v6.75c0 .621.504 1.125 1.125 1.125H6.375m1.5-12.75-1.5-1.5m0 0A2.25 2.25 0 0 1 6.375 3h.625c.621 0 1.125.504 1.125 1.125v1.5m-1.5-1.5Z" /></svg>,
    Video: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>,
    Research: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>,
    Lightbulb: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6 6 0 10-6 6 6 6 0 006-6Zm0 0a6 6 0 116 6 6 6 0 01-6-6ZM11.25 15.75h.008v.008H12v-.008Zm0-3h.008v.008H12v-.008ZM12 11.25a.75.75 0 100-1.5.75.75 0 000 1.5Z" /></svg>,
    Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 00 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 00 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 00 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 00 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>,
};

export const ProjectManager = ({ 
    projects, activeProject, activeVersionIndex, onSelectProject, onNewProject, onOpenFile, onSaveProject, 
    hasUnsavedChanges, onCommitVersion, onStartWithDeVinci, onStartFromImage, isParsingImage, onStartFromPdf, isParsingPdf, 
    onStartBrainstormFromPdf, isParsingForBrainstorm, onIdentifyImage, isIdentifyingImage, onOpenVideoImport, isParsingVideo, 
    onEditProject, onDeleteProject, onLoadVersion, onRevertVersion, onCompareVersions, disabled, authenticatedUser,
    onSaveToDrive, onOpenFromDrive, isSavingToDrive, isDriveAuthenticated,
    onAddDocument, onRemoveDocument, addLog
}: ProjectManagerProps) => {
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'last-updated' | 'name-asc' | 'name-desc' | 'date-created-desc' | 'date-created-asc'>('last-updated');
    const [isKnowledgeLibraryOpen, setIsKnowledgeLibraryOpen] = useState(false);
    const [ingestingCount, setIngestingCount] = useState(0);
    const [selectedBranch, setSelectedBranch] = useState<EngineeringBranch>(EngineeringBranch.GENERAL);
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [filesToIngest, setFilesToIngest] = useState<File[]>([]);
    const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

    const openFileInputRef = useRef<HTMLInputElement>(null);
    const knowledgeFileInputRef = useRef<HTMLInputElement>(null);
    
    // Workflow-specific hidden inputs
    const startImageInputRef = useRef<HTMLInputElement>(null);
    const startPdfInputRef = useRef<HTMLInputElement>(null);
    const brainstormPdfInputRef = useRef<HTMLInputElement>(null);
    const identifyImageInputRef = useRef<HTMLInputElement>(null);
    
    // Simulate background polling for updates
    useEffect(() => {
        if (!activeProject || !isKnowledgeLibraryOpen) return;
        const interval = setInterval(() => {
            setLastSyncTime(new Date().toLocaleTimeString());
        }, 15000);
        return () => clearInterval(interval);
    }, [activeProject, isKnowledgeLibraryOpen]);

    const handleKnowledgeFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length > 0) {
            setFilesToIngest(files);
            setIsBranchModalOpen(true);
        }
        if (e.target) e.target.value = '';
    };

    const confirmIngestion = async () => {
        setIsBranchModalOpen(false);
        if (filesToIngest.length > 0 && onAddDocument) {
            setIngestingCount(prev => prev + filesToIngest.length);
            for (const file of filesToIngest) {
                try {
                    const doc = await agenticKnowledgeIngestion(file, selectedBranch, addLog);
                    onAddDocument(doc);
                } catch (err) {
                    console.error("Knowledge Ingestion Failed", err);
                } finally {
                    setIngestingCount(prev => Math.max(0, prev - 1));
                }
            }
        }
        setFilesToIngest([]);
    };

    const processedProjects = useMemo(() => {
        const filtered = searchTerm
            ? projects.filter(project => {
                const lowercasedFilter = searchTerm.toLowerCase();
                const searchCorpus = [
                    project.name,
                    project.description,
                    ...(project.tags || []),
                    project.searchKeywords || ''
                ].join(' ').toLowerCase();
                
                return searchCorpus.includes(lowercasedFilter);
            })
            : projects;

        return [...filtered].sort((a, b) => {
            switch (sortOption) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'date-created-desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'date-created-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'last-updated':
                default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
        });
    }, [projects, searchTerm, sortOption]);

    const isViewer = authenticatedUser.role === Role.Viewer;

    const ToolButton = ({ label, icon: Icon, onClick, loading, color = 'bg-gray-200 dark:bg-gray-700' }: any) => (
        <button
            onClick={onClick}
            disabled={disabled || loading || isViewer}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-300 dark:border-gray-600 ${color} text-gray-800 dark:text-gray-200 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <Icon />}
            <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">{label}</span>
        </button>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-brand-light">Foundry Management</h2>
                <div className="flex gap-2">
                    {activeProject && (
                        <button 
                            onClick={onSaveProject}
                            className="flex items-center gap-2 px-3 py-1.5 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-cyan hover:text-white transition-all shadow-lg shadow-cyan-900/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                            Export Sovereign Asset
                        </button>
                    )}
                </div>
            </div>
            
            {!isViewer && (
                <div className="space-y-4 mb-4">
                    {/* Primary Action Row */}
                    <div className="grid grid-cols-2 gap-2">
                        <input type="file" ref={openFileInputRef} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onOpenFile(file);
                            if (e.target) e.target.value = '';
                        }} accept=".sfa,.json" className="hidden" disabled={disabled} />
                        <button onClick={() => openFileInputRef.current?.click()} disabled={disabled} className="py-2.5 px-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-black uppercase tracking-widest rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                            Import Asset
                        </button>
                        <button onClick={onNewProject} disabled={disabled} className="py-2.5 px-3 bg-brand-cyan text-white font-black uppercase tracking-widest rounded-lg hover:bg-cyan-500 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs">
                            + Forge Environment
                        </button>
                    </div>

                    {/* Neural Toolbelt Section */}
                    <div className="bg-gray-100 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Synthesis Protocols</p>
                        <div className="grid grid-cols-3 gap-3">
                            <ToolButton 
                                label="Synthesis Assistant" 
                                icon={Icons.Sparkles} 
                                onClick={onStartWithDeVinci} 
                                color="bg-purple-100 dark:bg-purple-900/20"
                            />
                            
                            <input type="file" accept="image/*" className="hidden" ref={startImageInputRef} onChange={e => { if(e.target.files?.[0]) onStartFromImage(e.target.files[0]); e.target.value = ''; }} />
                            <ToolButton 
                                label="Image Synthesis" 
                                icon={Icons.Photo} 
                                onClick={() => startImageInputRef.current?.click()} 
                                loading={isParsingImage}
                            />
                            
                            <input type="file" accept="application/pdf" className="hidden" ref={startPdfInputRef} onChange={e => { if(e.target.files?.[0]) onStartFromPdf(e.target.files[0]); e.target.value = ''; }} />
                            <ToolButton 
                                label="Technical Intake" 
                                icon={Icons.Pdf} 
                                onClick={() => startPdfInputRef.current?.click()} 
                                loading={isParsingPdf}
                            />

                            <ToolButton 
                                label="Visual Intake" 
                                icon={Icons.Video} 
                                onClick={onOpenVideoImport} 
                                loading={isParsingVideo}
                            />

                            <input type="file" accept="application/pdf" className="hidden" ref={brainstormPdfInputRef} onChange={e => { if(e.target.files?.[0]) onStartBrainstormFromPdf(e.target.files[0]); e.target.value = ''; }} />
                            <ToolButton 
                                label="Recursive Logic" 
                                icon={Icons.Lightbulb} 
                                onClick={() => brainstormPdfInputRef.current?.click()} 
                                loading={isParsingForBrainstorm}
                                color="bg-yellow-100 dark:bg-yellow-900/20"
                            />

                            <input type="file" accept="image/*" className="hidden" ref={identifyImageInputRef} onChange={e => { if(e.target.files?.[0]) onIdentifyImage(e.target.files[0]); e.target.value = ''; }} />
                            <ToolButton 
                                label="System Mapping" 
                                icon={Icons.Research} 
                                onClick={() => identifyImageInputRef.current?.click()} 
                                loading={isIdentifyingImage}
                                color="bg-cyan-100 dark:bg-cyan-900/20"
                            />
                        </div>
                    </div>

                    {/* Cloud Sovereignty Section */}
                    <div className="bg-gray-100 dark:bg-indigo-900/10 p-3 rounded-2xl border border-gray-200 dark:border-indigo-500/20">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 px-1 flex justify-between items-center">
                            Cloud Management
                            {isDriveAuthenticated && <span className="text-[8px] text-green-500 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span> Linked</span>}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <ToolButton 
                                label="Backup to Drive" 
                                icon={Icons.Drive} 
                                onClick={onSaveToDrive} 
                                loading={isSavingToDrive}
                                color="bg-indigo-100 dark:bg-indigo-900/30"
                            />
                            <ToolButton 
                                label="Restore from Cloud" 
                                icon={Icons.Restore} 
                                onClick={onOpenFromDrive} 
                                color="bg-indigo-100 dark:bg-indigo-900/30"
                            />
                        </div>
                    </div>
                </div>
            )}
                 
            {activeProject && (
              <div className="bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
                <button 
                    onClick={() => setIsKnowledgeLibraryOpen(!isKnowledgeLibraryOpen)}
                    className="flex items-center justify-between w-full text-sm font-bold text-gray-700 dark:text-gray-300"
                >
                    <div className="flex items-center gap-2">
                        <Icons.Brain />
                        Context library (NAL Layer)
                        {activeProject.knowledgeBase && activeProject.knowledgeBase.length > 0 && (
                            <span className="bg-brand-cyan/20 text-brand-cyan text-[10px] px-1.5 rounded-full">{activeProject.knowledgeBase.length}</span>
                        )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${isKnowledgeLibraryOpen ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </button>
                
                {isKnowledgeLibraryOpen && (
                    <div className="mt-3 space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <p className="text-gray-500 uppercase tracking-tighter">Sovereign Data Isolation Active</p>
                            <div className="flex items-center gap-1 text-green-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span>POLLING ENGINE: {lastSyncTime}</span>
                            </div>
                        </div>
                        {!isViewer && (
                            <>
                            <input type="file" ref={knowledgeFileInputRef} onChange={handleKnowledgeFileSelected} multiple className="hidden" accept=".pdf,image/*" />
                            <button 
                                onClick={() => knowledgeFileInputRef.current?.click()}
                                disabled={ingestingCount > 0}
                                className="w-full py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-md text-xs font-bold transition flex items-center justify-center gap-2"
                            >
                                {ingestingCount > 0 ? (
                                    <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Calibrating {ingestingCount} Blocks...</>
                                ) : '+ Import Context Ore'}
                            </button>
                            </>
                        )}
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {(activeProject.knowledgeBase || []).map(doc => (
                                <div key={doc.id} className="group relative flex flex-col gap-1 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-[11px] hover:border-brand-cyan transition-colors">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 truncate">
                                            <div className="flex items-center gap-1">
                                                <span className={`text-[9px] px-1 rounded-sm uppercase font-black ${doc.branch === EngineeringBranch.AEROSPACE ? 'bg-blue-900/30 text-blue-300' : doc.branch === EngineeringBranch.NUCLEAR ? 'bg-yellow-900/30 text-yellow-300' : 'bg-indigo-900/30 text-indigo-300'}`}>
                                                    {doc.branch}
                                                </span>
                                                <p className="font-semibold text-gray-700 dark:text-gray-200 truncate">{doc.name}</p>
                                            </div>
                                        </div>
                                        {!isViewer && onRemoveDocument && (
                                            <button onClick={() => onRemoveDocument(doc.id)} className="text-gray-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100"><Icons.Trash /></button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(doc.phd_metadata?.governing_physics || []).slice(0, 2).map((p, i) => (
                                            <span key={i} className="text-[8px] bg-brand-cyan/10 text-brand-cyan px-1 rounded-sm whitespace-nowrap">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2 max-h-48 overflow-y-auto">
                {processedProjects.length === 0 ? (
                    <p className="text-gray-500 text-center p-4 text-xs">{searchTerm ? 'No matches found.' : 'Blank Forge.'}</p>
                ) : (
                    <ul className="space-y-1">
                        {processedProjects.map((project) => (
                            <li
                                key={project.id}
                                onClick={() => !disabled && onSelectProject(project.id)}
                                className={`p-2 rounded-md transition-all duration-200 cursor-pointer ${activeProject?.id === project.id ? 'bg-brand-cyan/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 truncate">
                                        <p className={`font-semibold truncate ${activeProject?.id === project.id ? 'text-brand-cyan' : 'text-gray-800 dark:text-brand-light'}`}>{project.name || 'Untitled'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(project.updatedAt)}</p>
                                    </div>
                                    {authenticatedUser.role === Role.Admin && (
                                        <button onClick={(e) => { e.stopPropagation(); setProjectToDelete(activeProject?.id === project.id ? activeProject : { ...project, history: [] } as any); }} disabled={disabled} className="p-2 text-gray-500 hover:text-red-400 transition-transform active:scale-95 rounded-full disabled:opacity-50 flex-shrink-0"><Icons.Trash /></button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Modal
                isOpen={isBranchModalOpen}
                onClose={() => setIsBranchModalOpen(false)}
                title="Select Disciplinary Domain"
                confirmText="Calibrate PhD Agent"
                onConfirm={confirmIngestion}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Choose the primary synthesis branch to deploy the specialized Research Agent for this context ore.</p>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(EngineeringBranch).map(branch => (
                            <button
                                key={branch}
                                onClick={() => setSelectedBranch(branch)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${selectedBranch === branch ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                            >
                                {branch}
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!projectToDelete} onClose={() => setProjectToDelete(null)} onConfirm={() => { if(projectToDelete) {onDeleteProject(projectToDelete.id); setProjectToDelete(null);} }} title="Confirm Disposal" confirmText="Dispose">
                Are you sure you want to permanently dispose of the vault data for "<strong>{projectToDelete?.name}</strong>"?
            </Modal>
        </div>
    );
};
