import { useState, useCallback } from 'react';
import { generatePatentDraft, parseApiError } from '../services/geminiService';
import { PatentApplication, AnalysisResult, LogEntry, IngestedDocument, User, ProtectionTypePref, LegalJurisdiction } from '../types';

export const usePatentGenerator = (addLog: (level: LogEntry['level'], message: string) => void) => {
    const [patent, setPatent] = useState<PatentApplication | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const draftPatent = useCallback(async (
        result: AnalysisResult, 
        user: User, 
        protectionType: ProtectionTypePref, 
        jurisdiction: LegalJurisdiction, 
        designHash: string, 
        knowledgeBase: IngestedDocument[] = []
    ) => {
        setIsGenerating(true);
        addLog('INFO', `Commencing Intellectual Property analysis for "${result.product_name}"... (Strategy: ${protectionType}, Jurisdiction: ${jurisdiction})`);
        
        try {
            const data = await generatePatentDraft(result, user, protectionType, jurisdiction, designHash, knowledgeBase);
            setPatent(data);
            addLog('INFO', `IP Analysis successfully generated. Design Hash ${designHash.slice(0,8)} committed to draft.`);
        } catch (e) {
            const error = parseApiError(e);
            addLog('ERROR', `IP Analysis Failed: ${error}`);
        } finally {
            setIsGenerating(false);
        }
    }, [addLog]);

    const clearPatent = useCallback(() => setPatent(null), []);

    return { patent, isGenerating, draftPatent, clearPatent };
};
