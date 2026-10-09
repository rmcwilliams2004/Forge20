import { useState } from 'react';
import { generateVideo as performVideoGeneration, parseApiError } from '../services/geminiService';
import { LogEntry } from '../types';

export const useVideoGenerator = (addLog: (level: LogEntry['level'], message: string) => void) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const generateVideo = async (prompt: string, imageFile?: File, aspectRatio?: '16:9' | '9:16') => {
    if (!prompt) {
      setVideoError("Cannot generate video without a prompt.");
      return;
    }

    // Per Veo guidelines, check for API key selection
    if (typeof (window as any).aistudio !== 'undefined' && !(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
    }

    setIsVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);
    addLog('INFO', `Starting video generation for "${prompt}".`);

    try {
      const url = await performVideoGeneration(prompt, imageFile, aspectRatio);
      setVideoUrl(url);
      addLog('INFO', `Video generation for "${prompt}" succeeded.`);
    } catch (e) {
      const errorMessage = parseApiError(e);
      setVideoError(errorMessage);
      addLog('ERROR', `Video generation for "${prompt}" failed: ${errorMessage}`);
      // Per guidelines, if the error indicates a missing entity, re-prompt for API key.
      if (errorMessage.includes('Requested entity was not found.')) {
           if (typeof (window as any).aistudio !== 'undefined') {
               await (window as any).aistudio.openSelectKey();
           }
       }
    } finally {
      setIsVideoLoading(false);
    }
  };
  
  const clearVideo = () => {
    if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setVideoError(null);
  }

  return { videoUrl, isVideoLoading, videoError, generateVideo, clearVideo };
};