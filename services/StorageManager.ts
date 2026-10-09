import { backendApiService } from './backendApiService';

const notifyIoProgress = (status: 'IDLE' | 'READING' | 'WRITING' | 'VERIFYING' | 'JAMMED', progress?: number) => {
    window.dispatchEvent(new CustomEvent('forge-io', { detail: { status, progress } }));
};

export const persistProjectData = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                notifyIoProgress('READING', percent);
            }
        };

        reader.onloadstart = () => {
            notifyIoProgress('READING', 0);
        };

        reader.onload = async (e) => {
            try {
                notifyIoProgress('WRITING', 50);
                const result = e.target?.result as string;
                if (!result) throw new Error("File read failed");

                // Route through unified FastAPI backend vault endpoint
                await backendApiService.uploadVaultFile(file.name, result);
                
                notifyIoProgress('VERIFYING', 90);
                window.dispatchEvent(new CustomEvent('forge-log', { 
                    detail: `[IO_BUS]: Persisted ${file.name} to FastAPI sovereign vault... (100%)` 
                }));
                notifyIoProgress('IDLE');
                
                window.dispatchEvent(new CustomEvent('FILE_READY', { detail: file.name }));
                resolve(result);
            } catch (err) {
                notifyIoProgress('JAMMED');
                reject(err);
            }
        };

        reader.onerror = () => {
            notifyIoProgress('JAMMED');
            reject(new Error("File reader error"));
        };

        reader.readAsDataURL(file);
    });
};

export const clearVaultBuffer = async () => {
    await backendApiService.clearVaultBuffer();
    window.dispatchEvent(new CustomEvent('forge-log', { detail: '[I/O_GUARD]: Vault buffer cleared via FastAPI backend.' }));
    notifyIoProgress('IDLE');
};

/**
 * AGNOSTIC WIPE: Purges session specific context via backend vault clearing and memory refresh.
 */
export const performAgnosticWipe = async () => {
    console.log("[SYSTEM]: Initiating Sovereign Reset of Inference Buffers via backend...");
    await clearVaultBuffer();
    
    window.dispatchEvent(new CustomEvent('forge-log', { 
        detail: `[AUDIT]: Sovereign Agnostic Wipe complete. Backend buffer cleared. System state: NEUTRAL.` 
    }));
    
    window.dispatchEvent(new CustomEvent('forge-webgl-reset'));
};

export const defrostSystem = async () => {
    await clearVaultBuffer();
    window.dispatchEvent(new CustomEvent('forge-webgl-reset'));
};
