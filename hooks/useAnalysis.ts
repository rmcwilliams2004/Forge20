
import { useState, useCallback } from 'react';
import { generateAnalysis as performAnalysis, parseApiError, identifyImageFromWeb, performSystemMapping, generateCadData } from '../services/geminiService';
import { AnalysisResult, Faction, Persona, LogEntry, IngestedDocument, Innovator, SystemMap, CadData } from '../types';

const fileToGenerativePart = async (file: File) => {
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

interface FileSource {
    files: File[];
    persona?: Persona;
    knowledgeBase?: IngestedDocument[];
}

export const useAnalysis = (addLog: (level: LogEntry['level'], message: string) => void) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async (projectName: string, prompt: string, faction: Faction | null, source: FileSource): Promise<AnalysisResult | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const fileParts = [];
      for(const file of source.files) {
          fileParts.push(await fileToGenerativePart(file));
      }

      const analysisResult = await performAnalysis(
          projectName, 
          prompt, 
          faction as any, 
          fileParts.length > 0 ? fileParts : null, 
          source.knowledgeBase || [],
          source.persona
      );
      
      setResult(analysisResult);
      addLog('INFO', `Analysis sequence complete for "${projectName}".`);
      return analysisResult;
    } catch (e) {
      const errorMessage = parseApiError(e);
      setError(errorMessage);
      addLog('ERROR', `Core Analysis Failed: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * REVERSE ENGINEERING PIPELINE: Multi-modal extraction to synthesis.
   */
  const runReverseEngineering = async (files: File[], faction: Faction, council: Innovator[]): Promise<{ identification: any, systemMap: SystemMap, analysis: AnalysisResult } | null> => {
    setIsLoading(true);
    setError(null);
    addLog('INFO', `Initializing end-to-end Reverse Engineering Pipeline for ${files.length} assets.`);

    try {
        const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f)));
        
        // 1. Identification
        const identification = await identifyImageFromWeb(fileParts[0]);
        addLog('INFO', `Object identified: ${identification.summary}. Initiating disciplinary deconstruction.`);

        // 2. System Mapping
        const systemMap = await performSystemMapping(fileParts, identification.summary);
        addLog('INFO', `System deconstructed. ${(systemMap?.hierarchy || []).length} sub-assemblies identified.`);

        // 3. Detailed Analysis (Synthesis)
        const analysis = await performAnalysis(
            systemMap.product_name,
            `Perform a deep reverse-engineering analysis on this ${identification.summary}. Focusing on mechanical deconstruction and material replication.`,
            faction,
            fileParts
        );
        
        const finalResult = { ...analysis, system_map: systemMap };
        setResult(finalResult);
        addLog('INFO', `Reverse Engineering finalized. Technical blueprints and BOM synthesized.`);
        
        return { identification, systemMap, analysis: finalResult };
    } catch (e) {
        const errorMessage = parseApiError(e);
        setError(errorMessage);
        addLog('ERROR', `Reverse Engineering Pipeline Failed: ${errorMessage}`);
        return null;
    } finally {
        setIsLoading(false);
    }
  };
  
  const clearAnalysis = () => {
    setResult(null);
    setError(null);
  }

  return { result, isLoading, error, generateAnalysis, runReverseEngineering, clearAnalysis, setResult };
};
