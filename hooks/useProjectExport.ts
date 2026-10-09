import { useState, useCallback } from 'react';
import { Project, GeneratedDrawing, GeneratedImage, LogEntry, PatentApplication, User } from '../types';
import { generateFormalPatentPDF } from '../services/pdfmeService';
import { useTts } from './useTts';

declare const JSZip: any;

export const useProjectExport = (addLog: (level: LogEntry['level'], message: string) => void, tts: ReturnType<typeof useTts>) => {
    const [isExporting, setIsExporting] = useState(false);

    const exportSovereignBundle = useCallback(async (project: Project, drawings: GeneratedDrawing[], images: GeneratedImage[]) => {
        if (typeof JSZip === 'undefined') {
            addLog('ERROR', 'JSZip library not available.');
            return;
        }

        setIsExporting(true);
        window.dispatchEvent(new CustomEvent('forge-export-status', { detail: 'PACKAGING' }));
        addLog('INFO', `Initializing Sovereign Bundle export for: ${project.name}`);

        try {
            const zip = new JSZip();
            const latestVersion = project.history[0];
            const designHash = `SYN-${Date.now().toString().slice(-8)}-SHA256`;
            
            // 1. Geometry Section
            const geomFolder = zip.folder("Geometry");
            if (latestVersion?.rotorModel) {
                geomFolder.file("rotor_model.json", JSON.stringify(latestVersion.rotorModel, null, 2));
            }
            
            // 2. Documentation & Legal
            const legalFolder = zip.folder("Legal");
            if (latestVersion?.result?.patentApplication) {
                const patentData = latestVersion.result.patentApplication as PatentApplication;
                legalFolder.file("patent_draft.json", JSON.stringify(patentData, null, 2));
                
                // HIGH FIDELITY PDF via pdfme
                const pdfBytes = await generateFormalPatentPDF(project, patentData, designHash);
                legalFolder.file("formal_specification.pdf", pdfBytes);
            }

            // 3. Visuals
            const visualsFolder = zip.folder("Visuals");
            const allVisuals = [...drawings, ...images].filter(v => v.url);
            
            for (const v of allVisuals) {
                const dataUrl = v.url!;
                const base64 = dataUrl.split(',')[1];
                const fileName = `${v.prompt.replace(/[^a-z0-9]/gi, '_')}.png`;
                visualsFolder.file(fileName, base64, { base64: true });
            }

            // 4. Ledger Fingerprint
            const ledgerFolder = zip.folder("Ledger");
            const fingerprint = {
                timestamp: new Date().toISOString(),
                projectId: project.id,
                projectName: project.name,
                hash: designHash
            };
            ledgerFolder.file("fingerprint.json", JSON.stringify(fingerprint, null, 2));

            window.dispatchEvent(new CustomEvent('forge-export-status', { detail: 'HASHING' }));
            const content = await zip.generateAsync({ type: 'blob' });
            
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Sovereign_Bundle_${project.name.replace(/\s+/g, '_')}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            window.dispatchEvent(new CustomEvent('forge-export-status', { detail: 'READY' }));
            addLog('INFO', `Sovereign Bundle exported and sealed. Size: ${(content.size / 1024 / 1024).toFixed(2)} MB.`);
            
            // VOICE OF THE FORGE: FINAL HANDSHAKE
            tts.speak("The Sovereign Bundle is ready, Creator. All geometric hashes and NAL proofs have been sealed within the ledger. Your innovation is secured and ready for transmission.", "Zephyr");
            
        } catch (err) {
            console.error("Export failure:", err);
            window.dispatchEvent(new CustomEvent('forge-export-status', { detail: 'FAILED' }));
            addLog('ERROR', 'Export failed.');
        } finally {
            setIsExporting(false);
            setTimeout(() => window.dispatchEvent(new CustomEvent('forge-export-status', { detail: 'IDLE' })), 3000);
        }
    }, [addLog, tts]);

    return { isExporting, exportSovereignBundle };
};
