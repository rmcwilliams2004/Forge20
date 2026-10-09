
import { unitService, TypedValue } from './unitService';
import { MaterialPreset } from '../types';

// --- Low-Level Library Simulation (MathLab02) ---
const MathLab02 = {
    /**
     * Delta = (F * L^3) / (3 * E * I)
     */
    calculateCantileverDeflection: (force: number, length: number, elasticity: number, inertia: number): number => {
        if (elasticity <= 0 || inertia <= 0) {
            throw new Error("Elasticity and Inertia must be positive non-zero values.");
        }
        return (force * Math.pow(length, 3)) / (3 * elasticity * inertia);
    },

    /**
     * Thermal Strain = alpha * deltaT
     * Thermal Stress = E * alpha * deltaT
     */
    calculateThermalStress: (elasticity: number, alpha: number, deltaT: number): number => {
        return elasticity * (alpha * 1e-6) * deltaT;
    }
};

// --- Tier 2: Numerical Abstraction Layer (NAL) ---
export class SynapseForgeAnalysis {
    
    /**
     * Unit-aware Beam Deflection solver.
     */
    static calculateBeamDeflection(
        load: TypedValue, 
        length: TypedValue, 
        material: MaterialPreset,
        inertia: TypedValue,
        targetUnitId: string = 'mm'
    ) {
        try {
            const forceSI = unitService.convert(load.value, load.unitId, 'N');
            const lengthSI = unitService.convert(length.value, length.unitId, 'm');
            const elasticitySI = material.youngsModulus * 1e9; // GPa to Pa
            const inertiaSI = unitService.convert(inertia.value, inertia.unitId, 'm4');

            const deflectionSI = MathLab02.calculateCantileverDeflection(forceSI, lengthSI, elasticitySI, inertiaSI);
            const resultValue = unitService.convert(deflectionSI, 'm', targetUnitId);

            return {
                value: resultValue,
                unit: targetUnitId,
                metadata: {
                    materialUsed: material.name,
                    source: 'SF-NAL-MathLab02',
                    constantsPull: {
                        E: `${material.youngsModulus} GPa`,
                        sigma_y: `${material.yieldStrength} MPa`
                    },
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error: any) {
            throw new Error(`Analysis Failed: ${error.message}`);
        }
    }

    /**
     * Unit-aware Thermal Stress solver.
     */
    static calculateThermalConstraint(
        material: MaterialPreset,
        tempDelta: number, // Celsius
        targetUnitId: string = 'MPa'
    ) {
        try {
            const elasticitySI = material.youngsModulus * 1e9; // GPa to Pa
            const alpha = material.thermalExpansion; // 10^-6 / K

            const stressSI = MathLab02.calculateThermalStress(elasticitySI, alpha, tempDelta);
            const resultValue = unitService.convert(stressSI, 'Pa', targetUnitId);

            return {
                value: resultValue,
                unit: targetUnitId,
                metadata: {
                    materialUsed: material.name,
                    expansionCoeff: `${alpha} 10^-6/K`,
                    source: 'SF-NAL-ThermoSolver',
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error: any) {
            throw new Error(`Thermal Analysis Failed: ${error.message}`);
        }
    }
}
