import { useCallback } from 'react';
import { InProgressState } from '../types';
import { backendApiService } from '../services/backendApiService';

/**
 * Persistence hook routing analysis session state through
 * the unified FastAPI backend (/api/v1/state/in-progress)
 * rather than client-side IndexedDB.
 */
export const useAnalysisPersistence = () => {
  const saveInProgressAnalysis = useCallback(async (state: InProgressState) => {
    try {
      await backendApiService.saveInProgressState(state);
    } catch (error) {
      console.error("Critical Persistence Failure: Could not save session to backend.", error);
    }
  }, []);

  const loadInProgressAnalysis = useCallback(async (): Promise<InProgressState | null> => {
    try {
      return await backendApiService.loadInProgressState();
    } catch (error) {
      console.error("Critical Persistence Failure: Could not load session from backend.", error);
      return null;
    }
  }, []);

  const clearInProgressAnalysis = useCallback(async () => {
    try {
      await backendApiService.clearInProgressState();
    } catch (error) {
      console.error("Critical Persistence Failure: Could not clear session on backend.", error);
    }
  }, []);

  return {
    saveInProgressAnalysis,
    loadInProgressAnalysis,
    clearInProgressAnalysis,
  };
};
