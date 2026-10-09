
import { useState, useCallback } from 'react';
import { generateCadData, generateFoundryCad, parseApiError } from '../services/geminiService';
import { AnalysisResult, CadData, LogEntry, GeneratedDrawing, FoundryCadResult, ReinforcementProfile } from '../types';

export const useCadGenerator = (addLog: (level: LogEntry['level'], message: string) => void) => {
  const [cadData, setCadData] = useState<CadData | null>(null);
  const [foundryResult, setFoundryResult] = useState<FoundryCadResult | null>(null);
  const [isCadLoading, setIsCadLoading] = useState<boolean>(false);
  const [cadError, setCadError] = useState<string | null>(null);

  const generateCad = useCallback(async (drawings: GeneratedDrawing[], result: AnalysisResult): Promise<CadData | null> => {
    setIsCadLoading(true);
    setCadError(null);
    setCadData(null);
    setFoundryResult(null);
    addLog('INFO', `Initializing CADAM Plugin for "${result.product_name}"...`);

    try {
      // Step 1: High-fidelity reasoning for parametric geometry & SCAD
      const material = result.material_suggestions[0]?.name || 'Aluminum 6061-T6';
      const prompt = `Synthesize parametric CAD and optimizations for: ${result.executive_summary}`;
      
      addLog('INFO', `Orchestrating Sovereign Foundry Architect for ${material} lattice based on BOM and component designs...`);
      const foundryRes = await generateFoundryCad(result.product_name, prompt, material, 'SF-CURRENT', result);
      
      // Inject Special Reinforcement Profiles if relevant
      if (result.product_name.toLowerCase().includes('nommo') || result.product_name.toLowerCase().includes('thruster')) {
          const triAxialProfile: ReinforcementProfile = {
              id: 'tri_axial_lattice_v1',
              name: 'Tri-Axial Lattice',
              description: 'Multi-directional structural lattice for high-thermal propulsion environments. Increases stiffness-to-weight by 40%.',
              parameterOverrides: {
                  'wall_thickness': 15.0,
                  'lattice_density': 85.0,
                  'thermal_buffer': 25.0
              }
          };
          foundryRes.availableReinforcements = [triAxialProfile];
      }

      setFoundryResult(foundryRes);

      // Step 2: Convert parametric JSON to viewing structure
      addLog('INFO', `Structuring 3D primitive mesh hierarchy...`);
      const data = await generateCadData(drawings, result);
      setCadData(data);
      
      addLog('INFO', `3D Asset synthesis complete. ${data.components.length} components mapped to physical space.`);
      return data;
    } catch (e) {
      const errorMessage = parseApiError(e);
      setCadError(errorMessage);
      addLog('ERROR', `CAD synthesis failed: ${errorMessage}`);
      return null;
    } finally {
      setIsCadLoading(false);
    }
  }, [addLog]);

  const clearCad = useCallback(() => {
    setCadData(null);
    setFoundryResult(null);
    setCadError(null);
  }, []);

  return { cadData, foundryResult, isCadLoading, cadError, generateCad, clearCad };
};
