
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'SynapseForgeVault';
const STORE_UPLOADS = 'uploads';
const STORE_PROJECTS = 'projects';
const STORE_VISUALS = 'visual_docs';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, 2, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    db.createObjectStore(STORE_UPLOADS);
                    db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
                }
                if (oldVersion < 2) {
                    if (!db.objectStoreNames.contains(STORE_VISUALS)) {
                        db.createObjectStore(STORE_VISUALS, { autoIncrement: true });
                    }
                }
            },
        });
    }
    return dbPromise;
};

const notifyIoProgress = (status: 'IDLE' | 'READING' | 'WRITING' | 'VERIFYING' | 'JAMMED', progress?: number) => {
    window.dispatchEvent(new CustomEvent('forge-io', { detail: { status, progress } }));
};

export const persistProjectData = async (file: File): Promise<string> => {
    const db = await getDB();
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
                sessionStorage.removeItem('current_analysis_context');
                
                const result = e.target?.result;
                if (!result) throw new Error("File read failed");

                await db.put(STORE_UPLOADS, result, file.name);
                
                // NAL HANDSHAKE SIMULATION
                notifyIoProgress('VERIFYING', 90);
                await new Promise(r => setTimeout(r, 1000));
                
                window.dispatchEvent(new CustomEvent('forge-log', { 
                    detail: `[IO_BUS]: Writing ${file.name} to IndexedDB... (100%)` 
                }));
                notifyIoProgress('IDLE');
                
                window.dispatchEvent(new CustomEvent('FILE_READY', { detail: file.name }));
                
                resolve(result as string);
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
    const db = await getDB();
    const tx = db.transaction(STORE_UPLOADS, 'readwrite');
    await tx.objectStore(STORE_UPLOADS).clear();
    await tx.done;
    sessionStorage.clear();
    window.dispatchEvent(new CustomEvent('forge-log', { detail: '[I/O_GUARD]: File buffer cleared. Lens Selector unlocked.' }));
    notifyIoProgress('IDLE');
};

/**
 * AGNOSTIC WIPE: Purges session specific context and scrubs proprietary strings.
 * PROTECTS: Any keys prefixed with 'sf_project_' or 'sf_projects_index' to prevent accidental data loss.
 * SCRUBS: sessionStorage and specific 'bias' keys in localStorage.
 */
export const performAgnosticWipe = async () => {
    console.log("[SYSTEM]: Initiating Hard Reset of Inference Buffers...");
    
    // 1. Target non-persistent leakage points
    sessionStorage.clear();
    
    // 2. Identify and purge ONLY session-related bias, protecting the project ledger
    const protectedPrefixes = ['sf_project_', 'sf_projects_index', 'sf_profile_'];
    const biasKeywords = [
        'nommo', 'alpha', 'aegis', 'intelligent shielding', 
        'hydrographene', 'hyg', 'z-pinch', 'propulsion', 
        'ignition', 'coil', 'fusion'
    ];
    
    let purgedCount = 0;
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const isProtected = protectedPrefixes.some(pref => key.startsWith(pref));
            if (!isProtected) {
                const val = localStorage.getItem(key)?.toLowerCase() || "";
                if (biasKeywords.some(word => val.includes(word))) {
                    keysToRemove.push(key);
                }
            }
        }
    }
    
    keysToRemove.forEach(k => {
        localStorage.removeItem(k);
        purgedCount++;
    });
    
    // 3. Reset I/O Buffers
    await clearVaultBuffer();
    
    window.dispatchEvent(new CustomEvent('forge-log', { 
        detail: `[AUDIT]: Agnostic Wipe complete. Purged ${purgedCount} session records. Primary ledger preserved. System state: NEUTRAL.` 
    }));
    
    // 4. Clear UI Visual Buffers
    window.dispatchEvent(new CustomEvent('forge-webgl-reset'));
};

export const defrostSystem = async () => {
    await clearVaultBuffer();
    window.dispatchEvent(new CustomEvent('forge-webgl-reset'));
};
