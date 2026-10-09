import { useState, useCallback } from 'react';
import { identifyImageFromWeb, parseApiError } from '../services/geminiService';
import { ImageIdentificationResult, LogEntry } from '../types';

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
};
  
const fileToGenerativePart = (file: File) => {
    return new Promise<{inlineData: {data: string, mimeType: string}}>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const data = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data,
                    mimeType: file.type,
                }
            });
        };
        reader.onerror = (error) => reject(error);
    });
};

export const useImageIdentifier = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [result, setResult] = useState<ImageIdentificationResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const identifyImage = useCallback(async (file: File): Promise<void> => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        addLog('INFO', `Starting image identification for "${file.name}".`);

        try {
            const [imagePart, imageUrl] = await Promise.all([
                fileToGenerativePart(file),
                fileToDataUrl(file),
            ]);
            
            const { summary, sources } = await identifyImageFromWeb(imagePart);
            
            setResult({ summary, sources, imageUrl });
            addLog('INFO', `Image identification for "${file.name}" completed successfully.`);

        } catch (e) {
            const errorMessage = parseApiError(e);
            setError(errorMessage);
            addLog('ERROR', `Image identification failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [addLog]);

    const clearIdentification = useCallback(() => {
        setResult(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return { result, isLoading, error, identifyImage, clearIdentification };
};