
import { Project, GeneratedDrawing, GoogleDocContent } from '../types';

// Mock/Simulated Google API Service
// In a real application, this would use gapi (Google API Client Library)
// to handle OAuth2 and make real API calls. For this environment, we simulate
// the behavior and responses.

const GOOGLE_AUTH_STORAGE_KEY = 'synapseforge_google_exporter_auth';
const GOOGLE_DRIVE_FILES_KEY = 'synapseforge_mock_drive_files';

/**
 * Simulates checking for an existing, valid auth token from sessionStorage.
 */
export const checkAuth = async (): Promise<{ authenticated: boolean; user?: any }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const authData = sessionStorage.getItem(GOOGLE_AUTH_STORAGE_KEY);
    if (authData) {
        try {
            const user = JSON.parse(authData);
            return { authenticated: true, user };
        } catch (e) {
            return { authenticated: false };
        }
    }
    return { authenticated: false };
};


/**
 * Simulates the process of signing in with a Google account and storing session.
 */
export const signInWithGoogle = async () => {
    // Simulate a delay for the sign-in process
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return mock user data
    const user = {
        name: 'Demo User',
        email: 'demo.user@example.com',
        picture: `https://i.pravatar.cc/150?u=demo.user@example.com`,
    };
    sessionStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
};

/**
 * Simulates signing out by clearing the session storage.
 */
export const signOutFromGoogle = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    sessionStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
};

/**
 * Simulates creating a new folder in Google Drive.
 * @returns A mock folder ID.
 */
export const createDriveFolder = async (folderName: string) => {
    console.log(`(Simulated) Creating Google Drive folder: "${folderName}"`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return `mock_folder_${Date.now()}`;
};

/**
 * Simulates uploading a file (like a drawing) to Google Drive.
 * @returns A mock file object with an ID and a web view link.
 */
export const uploadImageToDrive = async (dataUrl: string, fileName: string, folderId: string) => {
    console.log(`(Simulated) Uploading "${fileName}" to Google Drive folder "${folderId}"`);
    // In a real app, you'd convert the data URL to a Blob and use multipart upload.
    await new Promise(resolve => setTimeout(resolve, 800));
    const fileId = `mock_file_${Date.now()}`;
    return {
        id: fileId,
        webViewLink: `https://docs.google.com/a/example.com/file/d/${fileId}/`,
    };
};

/**
 * Simulates creating a Google Doc from a structured content object.
 * @returns A mock document object with its URL.
 */
export const createGoogleDoc = async (title: string, content: GoogleDocContent, folderId: string) => {
    console.log(`(Simulated) Creating Google Doc "${title}" in folder "${folderId}"`);
    console.log("(Simulated) with content:", content);
    // In a real app, this would make a request to the Google Docs API `documents.create`
    // followed by a `batchUpdate` with the content requests.
    await new Promise(resolve => setTimeout(resolve, 1500));
    const docId = `mock_doc_${Date.now()}`;
    return {
        documentId: docId,
        title,
        documentUrl: `https://docs.google.com/document/d/${docId}/edit`,
    };
};

// This is a simplified conversion utility. A real one would generate the
// complex JSON structure required by the Google Docs API `batchUpdate` method.
export const convertAnalysisToDocContent = (project: Project, uploadedDrawings: { prompt: string, driveUrl: string }[]): GoogleDocContent => {
    const latestVersion = project.history[0];
    const result = latestVersion.result;
    if (!result) return [];

    const content: GoogleDocContent = [];
    const add = (type: any, data: any) => content.push({ type, ...data });

    // Title Page
    add('h1', { text: 'Reverse Engineering & Product Analysis Report' });
    add('h2', { text: project.name });
    add('p', { text: project.description });
    add('p', { text: `Tags: ${project.tags.join(', ')}` });
    add('p', { text: `Report Generated: ${new Date().toLocaleString()}`, isMuted: true });

    // Content
    add('h2', { text: 'Executive Summary' });
    add('p', { text: result.executive_summary });
    
    add('h2', { text: 'Faction Rationale' });
    add('h3', { text: 'Pros' });
    add('bulletList', { items: result.faction_rationale.pros });
    add('h3', { text: 'Cons' });
    add('bulletList', { items: result.faction_rationale.cons });
    add('p', { text: `Summary: ${result.faction_rationale.summary}` });

    add('h2', { text: 'Bill of Materials (BOM)' });
    add('table', {
        headers: ['#', 'Name', 'Qty', 'Material', 'Description'],
        rows: result.billOfMaterials.map(item => [item.part_number, item.name, item.quantity, item.material, item.description])
    });
    
    add('h2', { text: '2D Technical Drawings' });
    if (uploadedDrawings.length > 0) {
        uploadedDrawings.forEach(d => {
            add('image', { url: d.driveUrl, caption: d.prompt });
        });
    } else {
        add('p', { text: 'No drawings were included in this export.' });
    }

    // Add other sections in a similar fashion...
    // This is a truncated example for brevity. A full implementation would map all report sections.

    return content;
};

// --- PROJECT PERSISTENCE (MOCK DRIVE) ---

interface DriveFile {
    id: string;
    name: string;
    modifiedTime: string;
    content: string; // JSON string of the project
}

const getMockDriveFiles = (): DriveFile[] => {
    const stored = localStorage.getItem(GOOGLE_DRIVE_FILES_KEY);
    return stored ? JSON.parse(stored) : [];
};

const saveMockDriveFiles = (files: DriveFile[]) => {
    localStorage.setItem(GOOGLE_DRIVE_FILES_KEY, JSON.stringify(files));
};

export const saveProjectToDrive = async (project: Project): Promise<string> => {
    console.log(`(Simulated) Saving project "${project.name}" to Google Drive`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    const files = getMockDriveFiles();
    const existingIndex = files.findIndex(f => f.id === project.id); // Use project ID as file ID for simplicity in mock
    
    const fileEntry: DriveFile = {
        id: project.id, // Persist ID
        name: `${project.name}.sfp.json`,
        modifiedTime: new Date().toISOString(),
        content: JSON.stringify(project),
    };

    if (existingIndex >= 0) {
        files[existingIndex] = fileEntry;
    } else {
        files.push(fileEntry);
    }

    saveMockDriveFiles(files);
    return fileEntry.id;
};

export const listProjectFiles = async (): Promise<{ id: string, name: string, modifiedTime: string }[]> => {
    console.log(`(Simulated) Listing project files from Google Drive`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const files = getMockDriveFiles();
    // Filter for .sfp.json files (simulating a mimetype filter)
    return files
        .filter(f => f.name.endsWith('.sfp.json'))
        .map(({ id, name, modifiedTime }) => ({ id, name, modifiedTime }));
};

export const downloadProjectFile = async (fileId: string): Promise<Project> => {
    console.log(`(Simulated) Downloading file "${fileId}" from Google Drive`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const files = getMockDriveFiles();
    const file = files.find(f => f.id === fileId);

    if (!file) {
        throw new Error("File not found in simulated Drive.");
    }

    try {
        return JSON.parse(file.content) as Project;
    } catch (e) {
        throw new Error("Failed to parse project file.");
    }
};
