
import { useState, useCallback } from 'react';
import { generateTechnicalDrawingImage, parseApiError, generateDrawingFromImage } from '../services/geminiService';
import { AnalysisResult, GeneratedDrawing, LogEntry } from '../types';
import { Part } from '@google/genai';

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
  return {
    inlineData: {
      data: base64,
      mimeType: file.type,
    },
  };
};

export const useDrawingGenerator = (addLog: (level: LogEntry['level'], message: string) => void) => {
  const [drawings, setDrawings] = useState<GeneratedDrawing[]>([]);

  const requestDrawing = useCallback(async (specificPrompt: string, analysisResult: AnalysisResult, fileUrls?: string[]) => {
    const drawingId = crypto.randomUUID();
    addLog('INFO', `Starting 2D drawing generation for "${specificPrompt}".`);

    setDrawings(prev => {
        const newDrawing: GeneratedDrawing = {
            id: drawingId,
            prompt: specificPrompt,
            url: null,
            isLoading: true,
            error: null,
            includeInReport: true,
            isCoverImage: prev.length === 0, 
        };
        return [...prev, newDrawing];
    });

    try {
      const url = await generateTechnicalDrawingImage(analysisResult, specificPrompt, fileUrls);
      setDrawings(prev => prev.map(d => d.id === drawingId ? { ...d, url, isLoading: false } : d));
      addLog('INFO', `2D drawing generation for "${specificPrompt}" succeeded.`);
    } catch (e) {
      const errorMessage = parseApiError(e);
      setDrawings(prev => prev.map(d => d.id === drawingId ? { ...d, error: errorMessage, isLoading: false } : d));
      addLog('ERROR', `2D drawing generation for "${specificPrompt}" failed: ${errorMessage}`);
    }
  }, [addLog]);

  /**
   * Adds a locally generated snapshot (from WebGL buffer) to the drawings collection.
   * This bypasses the API for orthographic and isometric captures.
   */
  const addLocalSnapshot = useCallback((dataUrl: string, prompt: string) => {
      const drawingId = `snap-${Date.now()}`;
      const newDrawing: GeneratedDrawing = {
          id: drawingId,
          prompt: `Snapshot: ${prompt}`,
          url: dataUrl,
          isLoading: false,
          error: null,
          includeInReport: true,
          isCoverImage: drawings.length === 0,
      };
      setDrawings(prev => [...prev, newDrawing]);
      addLog('INFO', `[VIS_DOC]: Local ${prompt} view captured and added to technical folder.`);
  }, [drawings.length, addLog]);

  const requestDrawingFromImage = useCallback(async (imageFile: File, specificPrompt: string) => {
    const drawingId = crypto.randomUUID();
    const promptText = `Drawing from image: ${specificPrompt || imageFile.name}`;
    addLog('INFO', `Starting image-to-drawing generation for "${promptText}".`);

    setDrawings(prev => {
        const newDrawing: GeneratedDrawing = {
            id: drawingId,
            prompt: promptText,
            url: null,
            isLoading: true,
            error: null,
            includeInReport: true,
            isCoverImage: false,
        };
        return [...prev, newDrawing];
    });

    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const url = await generateDrawingFromImage(imagePart, specificPrompt);
        setDrawings(prev => prev.map(d => d.id === drawingId ? { ...d, url, isLoading: false } : d));
        addLog('INFO', `Image-to-drawing generation for "${promptText}" succeeded.`);
    } catch (e) {
        const errorMessage = parseApiError(e);
        setDrawings(prev => prev.map(d => d.id === drawingId ? { ...d, error: errorMessage, isLoading: false } : d));
        addLog('ERROR', `Image-to-drawing generation for "${promptText}" failed: ${errorMessage}`);
    }
  }, [addLog]);
  
  const removeDrawing = useCallback((id: string) => {
    setDrawings(prev => prev.filter(d => d.id !== id));
  }, []);
  
  const clearAllDrawings = useCallback(() => {
    setDrawings([]);
  }, []);

  const toggleDrawingReportInclusion = useCallback((id: string) => {
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, includeInReport: !d.includeInReport } : d));
  }, []);

  return { drawings, requestDrawing, addLocalSnapshot, requestDrawingFromImage, removeDrawing, setDrawings, clearAllDrawings, toggleDrawingReportInclusion };
};
