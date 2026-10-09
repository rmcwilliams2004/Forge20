import { useCallback } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { InProgressState } from '../types';

const DB_NAME = 'SynapseForge_SessionDB';
const STORE_NAME = 'analysis_state';
const KEY = 'current_session';

const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const useAnalysisPersistence = () => {
  const saveInProgressAnalysis = useCallback(async (state: InProgressState) => {
    try {
      const db = await initDB();
      // IndexedDB handles large objects (including large base64 visuals) 
      // without the strict size limits of localStorage.
      await db.put(STORE_NAME, state, KEY);
    } catch (error) {
      console.error("Critical Persistence Failure: Could not save session to IndexedDB.", error);
    }
  }, []);

  const loadInProgressAnalysis = useCallback(async (): Promise<InProgressState | null> => {
    try {
      const db = await initDB();
      const savedState = await db.get(STORE_NAME, KEY);
      return (savedState as InProgressState) || null;
    } catch (error) {
      console.error("Critical Persistence Failure: Could not load session from IndexedDB.", error);
      return null;
    }
  }, []);

  const clearInProgressAnalysis = useCallback(async () => {
    try {
      const db = await initDB();
      await db.delete(STORE_NAME, KEY);
    } catch (error) {
      console.error("Critical Persistence Failure: Could not clear session in IndexedDB.", error);
    }
  }, []);

  return {
    saveInProgressAnalysis,
    loadInProgressAnalysis,
    clearInProgressAnalysis,
  };
};