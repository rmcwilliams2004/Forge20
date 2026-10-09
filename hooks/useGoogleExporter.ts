import { useState, useCallback, useEffect } from 'react';
import { Project, GeneratedDrawing, User, LogEntry, GoogleDocContent } from '../types';
import * as googleApiService from '../services/googleApiService';

export const useGoogleExporter = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authenticatedUser, setAuthenticatedUser] = useState<{ name: string; email: string } | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState('');
    const [exportError, setExportError] = useState<string | null>(null);
    const [exportedDocContent, setExportedDocContent] = useState<GoogleDocContent | null>(null);

    useEffect(() => {
        const checkAuthentication = async () => {
            setIsAuthLoading(true);
            const { authenticated, user } = await googleApiService.checkAuth();
            setIsAuthenticated(authenticated);
            if (authenticated && user) {
                setAuthenticatedUser({ name: user.name, email: user.email });
            }
            setIsAuthLoading(false);
        };
        checkAuthentication();
    }, []);

    const signIn = useCallback(async () => {
        try {
            const user = await googleApiService.signInWithGoogle();
            setIsAuthenticated(true);
            setAuthenticatedUser({ name: user.name, email: user.email });
            addLog('INFO', 'Successfully authenticated with Google for export.');
        } catch (error) {
            addLog('ERROR', 'Google Sign-In for export failed.');
            setExportError('Google Sign-In failed.');
        }
    }, [addLog]);

    const signOut = useCallback(async () => {
        await googleApiService.signOutFromGoogle();
        setIsAuthenticated(false);
        setAuthenticatedUser(null);
        setExportedDocContent(null);
        setExportError(null);
        addLog('INFO', 'Signed out from Google exporter.');
    }, [addLog]);

    const exportToGoogle = useCallback(async (project: Project, drawings: GeneratedDrawing[], user: User) => {
        if (!isAuthenticated) {
            setExportError("You must be signed in to Google to export.");
            return;
        }
        if (!project.history[0]?.result) {
            setExportError("The project has no analysis result to export.");
            return;
        }

        setIsExporting(true);
        setExportError(null);
        setExportedDocContent(null);
        addLog('INFO', `Starting Google export for project "${project.name}".`);

        try {
            setExportStatus('Creating Drive folder...');
            const folderName = `SynapseForge - ${project.name}`;
            const folderId = await googleApiService.createDriveFolder(folderName);
            
            const drawingsToUpload = drawings.filter(d => d.includeInReport && d.url);
            const uploadedDrawings: { prompt: string, driveUrl: string }[] = [];

            for (let i = 0; i < drawingsToUpload.length; i++) {
                const drawing = drawingsToUpload[i];
                setExportStatus(`Uploading drawing ${i + 1} of ${drawingsToUpload.length}...`);
                const fileName = `${drawing.prompt.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                const uploadedFile = await googleApiService.uploadImageToDrive(drawing.url!, fileName, folderId);
                uploadedDrawings.push({ prompt: drawing.prompt, driveUrl: uploadedFile.webViewLink });
            }

            setExportStatus('Generating document content...');
            const docContent = googleApiService.convertAnalysisToDocContent(project, uploadedDrawings);

            setExportStatus('Creating Google Doc...');
            await googleApiService.createGoogleDoc(project.name, docContent, folderId);
            
            setExportedDocContent(docContent);
            setExportStatus('Export successful!');
            addLog('INFO', `Google export for "${project.name}" completed.`);

        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            setExportError(`Export failed: ${message}`);
            addLog('ERROR', `Google export for "${project.name}" failed: ${message}`);
            setExportStatus('Export failed');
        } finally {
            setTimeout(() => {
                setIsExporting(false);
                setExportStatus('');
            }, 5000);
        }

    }, [addLog, isAuthenticated]);

    const clearGoogleExport = useCallback(() => {
        setExportedDocContent(null);
        setExportError(null);
    }, []);

    return {
        isAuthenticated,
        authenticatedUser,
        isAuthLoading,
        signIn,
        signOut,
        isExporting,
        exportStatus,
        exportError,
        exportedDocContent,
        exportToGoogle,
        clearGoogleExport,
    };
};