import { Project, GeneratedDrawing, GeneratedImage } from '../types';

/**
 * Packs a project and all associated assets into a single "Sovereign Asset" bundle.
 */
export const exportSovereignAsset = async (project: Project, drawings: GeneratedDrawing[], inspirationalImages: GeneratedImage[]): Promise<void> => {
    console.log(`[SOVEREIGN EXPORT] Initiating asset bundle for: ${project.name}`);
    
    const bundle = {
        metadata: {
            app: "SynapseForge AI",
            version: "v12.1",
            exportTimestamp: new Date().toISOString(),
            projectName: project.name,
            vaultId: project.id,
            fingerprint: `SYN-${Date.now().toString().slice(-8)}-SHA256`
        },
        projectData: project,
        visuals: {
            drawings: drawings.filter(d => !!d.url),
            concepts: inspirationalImages.filter(i => !!i.url)
        }
    };

    const jsonString = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sovereign_Asset_${project.name.replace(/\s+/g, '_')}_${Date.now()}.sfa`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`[SOVEREIGN EXPORT] Success. Bundle downloaded.`);
};

/**
 * Logic to read a Sovereign Asset (.sfa) file.
 */
export const importSovereignAsset = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = JSON.parse(e.target?.result as string);
                if (content.metadata?.app !== "SynapseForge AI") {
                    throw new Error("Invalid Asset: Metadata mismatch.");
                }
                resolve(content);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};
