import { GoogleGenAI, Type } from '@google/genai';
import { IngestedDocument, LogEntry, EngineeringBranch } from '../types';
import { parseApiError } from './geminiService';

/**
 * PhD DISCIPLINARY AGENT ORCHESTRATOR
 * Specialized personas for high-fidelity technical extraction and safety grounding.
 */
export const PhD_SYSTEM_PROMPTS: Record<string, string> = {
    [EngineeringBranch.AEROSPACE]: `You are a PhD Aerospace Engineer (FAA/EASA liaison). 
        Analyze for: Aero-elasticity, fatigue life (MIL-HDBK-5), and high-altitude thermal gradients. 
        Enforce: Redundancy for single-point failures. Ground all data in airworthiness certification protocols.`,
    
    [EngineeringBranch.NUCLEAR]: `You are a PhD Nuclear Engineer (NRC/IAEA liaison). 
        Analyze for: Neutron cross-sections, ALARA shielding protocols, and passive cooling fail-safes. 
        Enforce: Criticality safety and seismic structural limits per ASME BPVC Section III.`,
    
    [EngineeringBranch.CHEMICAL]: `You are a PhD Chemical Engineer. 
        Analyze for: Reaction kinetics, mass transfer coefficients, and stoichiometric stability. 
        Enforce: GHS safety standards and environmental lifecycle impacts.`,
    
    [EngineeringBranch.GENERAL]: `You are a Senior PhD Research Lead. 
        Analyze this document for underlying physical principles, material tensors, and complex system dynamics. 
        Focus on extracting high-fidelity technical data including critical constants and governing physics.`
};

const getBranchSpecializedPersona = (branch: EngineeringBranch) => {
    return PhD_SYSTEM_PROMPTS[branch] || PhD_SYSTEM_PROMPTS[EngineeringBranch.GENERAL];
}

export const agenticKnowledgeIngestion = async (
  file: File, 
  branch: EngineeringBranch,
  addLog: (level: LogEntry['level'], message: string) => void
): Promise<IngestedDocument> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  addLog('INFO', `Deploying specialized PhD [${branch}] Agent for agentic ingestion of "${file.name}".`);

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });

  const part = {
    inlineData: {
      data: base64,
      mimeType: file.type,
    },
  };

  try {
    const systemInstruction = getBranchSpecializedPersona(branch);

    // Uses gemini-3-pro-preview for PhD-level technical reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          part,
          { text: systemInstruction },
          { text: "Extract all governing physics equations, critical material constants, and disciplinary safety constraints. Structure the output strictly follow the provided JSON schema." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            summary: { type: Type.STRING },
            phd_metadata: {
              type: Type.OBJECT,
              properties: {
                governing_physics: { type: Type.ARRAY, items: { type: Type.STRING } },
                critical_constants: { type: Type.OBJECT, description: 'Map of constant names to values' },
                industry_standards: { type: Type.ARRAY, items: { type: Type.STRING } },
                peer_review_context: { type: Type.STRING }
              },
              required: ["governing_physics", "critical_constants", "industry_standards"]
            }
          },
          required: ["extractedText", "summary", "phd_metadata"]
        }
      }
    });

    const result = JSON.parse(response.text!);
    
    addLog('INFO', `PhD Agent [${branch}] Orchestration successful: "${file.name}" synchronized with disciplinary knowledge base.`);

    return {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.type,
      branch: branch,
      phd_metadata: result.phd_metadata,
      content: result.extractedText,
      summary: result.summary,
      timestamp: new Date().toISOString()
    };

  } catch (e) {
    const errorMessage = parseApiError(e);
    addLog('ERROR', `Agentic Ingestion Failed for "${file.name}" [${branch}]: ${errorMessage}`);
    throw new Error(errorMessage);
  }
};

export const ingestDocument = async (
  file: File, 
  addLog: (level: LogEntry['level'], message: string) => void
): Promise<IngestedDocument> => {
    return agenticKnowledgeIngestion(file, EngineeringBranch.GENERAL, addLog);
};