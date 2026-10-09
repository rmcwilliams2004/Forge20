
import React from 'react';
import { CadViewerTool } from '../../types';

interface CadViewerToolbarProps {
  activeTool: CadViewerTool;
  onToolChange: (tool: CadViewerTool) => void;
  onResetView: () => void;
  isExploded: boolean;
  onToggleExplode: () => void;
  isSectionEnabled: boolean;
  onToggleSection: () => void;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  isMeshMode: boolean;
  onToggleMeshMode: () => void;
}

const ToolButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        title={label}
        className={`p-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-brand-cyan text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-brand-cyan' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
        {icon}
    </button>
);

const Icons = {
    Select: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
        </svg>
    ),
    Reset: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 0 0-3.375-3.375H8.25a3.375 3.375 0 0 0-3.375 3.375v4.992" />
        </svg>
    ),
    Explode: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
    ),
    Section: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    Rotate: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 0 0-3.375-3.375H8.25a3.375 3.375 0 0 0-3.375 3.375v4.992" />
        </svg>
    ),
    Grid: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
        </svg>
    ),
    Mesh: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A8.953 8.953 0 0112 10.5c-2.998 0-5.74-1.467-7.843-3.918m15.686 0A8.953 8.953 0 0112 10.5c-2.998 0-5.74-1.467-7.843-3.918" />
        </svg>
    )
};

// Fix: Completed the CadViewerToolbar component and exported it.
export const CadViewerToolbar: React.FC<CadViewerToolbarProps> = ({ 
  activeTool, onToolChange, onResetView, isExploded, onToggleExplode, isSectionEnabled, onToggleSection, 
  isAutoRotate, onToggleAutoRotate, showGrid, onToggleGrid, isMeshMode, onToggleMeshMode 
}) => {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-700 shadow-2xl z-10">
            <ToolButton label="Selection Tool" icon={<Icons.Select />} isActive={activeTool === 'select'} onClick={() => onToolChange('select')} />
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <ToolButton label="Reset Camera" icon={<Icons.Reset />} isActive={false} onClick={onResetView} />
            <ToolButton label="Explode Assembly" icon={<Icons.Explode />} isActive={isExploded} onClick={onToggleExplode} />
            <ToolButton label="Section Cut" icon={<Icons.Section />} isActive={isSectionEnabled} onClick={onToggleSection} />
            <ToolButton label="Auto Rotate" icon={<Icons.Rotate />} isActive={isAutoRotate} onClick={onToggleAutoRotate} />
            <ToolButton label="Show Grid" icon={<Icons.Grid />} isActive={showGrid} onClick={onToggleGrid} />
            <ToolButton label="Mesh Visualization" icon={<Icons.Mesh />} isActive={isMeshMode} onClick={onToggleMeshMode} />
        </div>
    );
};
