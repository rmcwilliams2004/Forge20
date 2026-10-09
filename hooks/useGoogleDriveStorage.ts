
import { useState, useCallback, useEffect } from 'react';
import { Project, LogEntry } from '../types';
import * as googleApiService from '../services/googleApiService';

export const useGoogleDriveStorage = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [fileList, setFileList] = useState<{ id: string; name: string; modifiedTime: string }[]>([]);
    const [error, setError] = useState<string | null>(null);

    const checkAuthStatus = useCallback(async () => {
        setIsAuthLoading(true);
        const { authenticated } = await googleApiService.checkAuth();
        setIsAuthenticated(authenticated);
        setIsAuthLoading(false);
    }, []);

    // Check auth on mount and when window focuses (to handle multi-tab/external auth changes)
    useEffect(() => {
        checkAuthStatus();
        window.addEventListener('focus', checkAuthStatus);
        return () => window.removeEventListener('focus', checkAuthStatus);
    }, [checkAuthStatus]);

    const saveProject = useCallback(async (project: Project) => {
        // Double check auth before proceeding
        const { authenticated } = await googleApiService.checkAuth();
        if (!authenticated) {
            setError("Not signed in to Google Drive.");
            return;
        }
        
        setIsSaving(true);
        setError(null);
        addLog('INFO', `Saving project "${project.name}" to Google Drive...`);

        try {
            await googleApiService.saveProjectToDrive(project);
            addLog('INFO', `Project "${project.name}" saved to Google Drive successfully.`);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setError(`Save failed: ${msg}`);
            addLog('ERROR', `Failed to save to Drive: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    }, [addLog]);

    const refreshFileList = useCallback(async () => {
        const { authenticated } = await googleApiService.checkAuth();
        if (!authenticated) {
            setIsAuthenticated(false);
            return;
        }
        
        setIsLoadingList(true);
        setError(null);
        try {
            const files = await googleApiService.listProjectFiles();
            setFileList(files);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setError(`Failed to list files: ${msg}`);
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    const loadProject = useCallback(async (fileId: string): Promise<Project | null> => {
        setIsLoadingFile(true);
        setError(null);
        addLog('INFO', `Loading project from Google Drive...`);
        
        try {
            const project = await googleApiService.downloadProjectFile(fileId);
            addLog('INFO', `Project "${project.name}" loaded from Google Drive.`);
            return project;
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setError(`Load failed: ${msg}`);
            addLog('ERROR', `Failed to load from Drive: ${msg}`);
            return null;
        } finally {
            setIsLoadingFile(false);
        }
    }, [addLog]);

    const clearError = () => setError(null);

    return {
        isAuthenticated,
        isAuthLoading,
        isSaving,
        isLoadingList,
        isLoadingFile,
        fileList,
        error,
        saveProject,
        refreshFileList,
        loadProject,
        clearError,
        checkAuth: checkAuthStatus,
        signIn: async () => {
            await googleApiService.signInWithGoogle();
            setIsAuthenticated(true);
        },
        signOut: async () => {
            await googleApiService.signOutFromGoogle();
            setIsAuthenticated(false);
            setFileList([]);
        }
    };
};
