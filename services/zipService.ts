import { GeneratedDrawing, GeneratedImage } from '../types';

declare const JSZip: any;

const dataURLToBlob = (dataURL: string): Blob => {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
};

const sanitizeFilename = (prompt: string): string => {
    return prompt.replace(/[^a-z0-9_ -]/gi, '_').replace(/ /g, '_').substring(0, 50);
};

export const createDrawingsZip = async (images: (GeneratedDrawing | GeneratedImage)[], projectName: string): Promise<void> => {
    if (typeof JSZip === 'undefined') {
        alert('ZIP library is not available. Please check your connection.');
        return;
    }

    const zip = new JSZip();
    const imagesToZip = images.filter(d => d.url && !d.isLoading);

    if (imagesToZip.length === 0) {
        alert('No completed drawings or images available to download.');
        return;
    }

    imagesToZip.forEach((image, index) => {
        const blob = dataURLToBlob(image.url!);
        // Determine file extension based on what we generate
        const extension = 'aspectRatio' in image ? 'jpeg' : 'png';
        const filename = `${sanitizeFilename(image.prompt)}_${index}.${extension}`;
        zip.file(filename, blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_visuals.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};