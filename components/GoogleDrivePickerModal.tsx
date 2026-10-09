
import React, { useEffect } from 'react';
import { Modal } from './Modal';

interface GoogleDrivePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    files: { id: string; name: string; modifiedTime: string }[];
    onSelect: (fileId: string) => void;
    onRefresh: () => void;
    error: string | null;
    isAuthenticated: boolean;
    onSignIn: () => void;
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({ 
    isOpen, onClose, isLoading, files, onSelect, onRefresh, error, isAuthenticated, onSignIn 
}) => {
    
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            onRefresh();
        }
    }, [isOpen, isAuthenticated, onRefresh]);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Open from Google Drive" 
            confirmText="Close" 
            onConfirm={onClose}
            cancelText={null}
        >
            <div className="min-h-[300px] flex flex-col">
                {!isAuthenticated ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-4">
                        <p className="text-gray-400 text-center">Sign in to Google Drive to access your saved projects.</p>
                        <button 
                            onClick={onSignIn} 
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded shadow font-semibold hover:bg-gray-100 transition"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                            Sign in with Google
                        </button>
                    </div>
                ) : (
                    <>
                        {error && <div className="bg-red-900/30 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
                        
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                                <svg className="animate-spin h-8 w-8 text-brand-cyan mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <p>Loading Drive files...</p>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center flex-1 flex items-center justify-center text-gray-400">
                                <p>No project files found in Drive.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">
                                <ul className="space-y-2">
                                    {files.map(file => (
                                        <li key={file.id}>
                                            <button 
                                                onClick={() => onSelect(file.id)}
                                                className="w-full flex justify-between items-center p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition group text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-semibold text-gray-200 group-hover:text-white">{file.name.replace('.sfp.json', '')}</p>
                                                        <p className="text-xs text-gray-400">Modified: {new Date(file.modifiedTime).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <span className="text-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold">Open</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};
