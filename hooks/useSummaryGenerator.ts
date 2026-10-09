import { useState, useCallback } from 'react';
import { generateSummary as performSummary, parseApiError } from '../services/geminiService';
import { AnalysisResult, LogEntry } from '../types';

export const useSummaryGenerator = (addLog: (level: LogEntry['level'], message: string) => void) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const generateSummary = useCallback(async (result: AnalysisResult): Promise<string | null> => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    setSummary(null);
    addLog('INFO', 'Generating concise summary...');

    try {
      const summaryText = await performSummary(result);
      setSummary(summaryText);
      addLog('INFO', 'Concise summary generated successfully.');
      return summaryText;
    } catch (e) {
      const errorMessage = parseApiError(e);
      setSummaryError(errorMessage);
      addLog('ERROR', `Summary generation failed: ${errorMessage}`);
      return null;
    } finally {
      setIsSummaryLoading(false);
    }
  }, [addLog]);

  const clearSummary = useCallback(() => {
    setSummary(null);
    setSummaryError(null);
  }, []);

  return { summary, isSummaryLoading, summaryError, generateSummary, clearSummary };
};