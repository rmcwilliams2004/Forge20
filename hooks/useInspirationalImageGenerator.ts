import { useState, useCallback } from 'react';
import { generateInspirationalImage, parseApiError } from '../services/geminiService';
import { GeneratedImage, LogEntry } from '../types';

export const useInspirationalImageGenerator = (addLog: (level: LogEntry['level'], message: string) => void) => {
  const [inspirationalImages, setInspirationalImages] = useState<GeneratedImage[]>([]);

  const requestInspirationalImage = useCallback(async (prompt: string, aspectRatio: string = '16:9'): Promise<GeneratedImage | null> => {
    // Pro models (gemini-3-pro-image-preview) REQUIRE user-selected API key
    if (typeof (window as any).aistudio !== 'undefined') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            addLog('INFO', 'High-quality synthesis requires a paid API key. Launching selection dialog...');
            await (window as any).aistudio.openSelectKey();
            // Proceed assuming selection success per guidelines
        }
    }

    const imageId = `insp-img-${Date.now()}`;
    addLog('INFO', `Initializing high-fidelity concept synthesis for: "${prompt.substring(0, 40)}..." [Ratio: ${aspectRatio}]`);

    const newImage: GeneratedImage = {
        id: imageId,
        prompt: prompt,
        url: null,
        isLoading: true,
        error: null,
        aspectRatio: aspectRatio,
        includeInReport: true,
        isCoverImage: false,
    };
    
    setInspirationalImages(prev => [...prev, newImage]);

    try {
      const url = await generateInspirationalImage(prompt, aspectRatio);
      const successfulImage = { ...newImage, url, isLoading: false };
      setInspirationalImages(prev => prev.map(img => img.id === imageId ? successfulImage : img));
      addLog('INFO', `Concept synthesis finalized. Image buffer cached.`);
      return successfulImage;
    } catch (e) {
      const errorMessage = parseApiError(e);
      setInspirationalImages(prev => prev.map(img => img.id === imageId ? { ...img, error: errorMessage, isLoading: false } : img));
      addLog('ERROR', `Concept synthesis failed: ${errorMessage}`);
      
      if (errorMessage.includes("Requested entity was not found.")) {
          addLog('WARN', 'API key validation failed. Please re-select a valid paid API key.');
          if (typeof (window as any).aistudio !== 'undefined') {
             await (window as any).aistudio.openSelectKey();
          }
      }
      return null;
    }
  }, [addLog]);
  
  const removeInspirationalImage = useCallback((id: string) => {
    setInspirationalImages(prev => prev.filter(img => img.id !== id));
  }, []);
  
  const clearAllInspirationalImages = useCallback(() => {
    setInspirationalImages([]);
  }, []);
  
  const toggleImageReportInclusion = useCallback((id: string) => {
    setInspirationalImages(prev => prev.map(img => img.id === id ? { ...img, includeInReport: !img.includeInReport } : img));
  }, []);

  return { inspirationalImages, requestInspirationalImage, removeInspirationalImage, setInspirationalImages, clearAllInspirationalImages, toggleImageReportInclusion };
};
