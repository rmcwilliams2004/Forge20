
export type UnitSystem = 'SI' | 'Imperial' | 'Mixed';

export type UnitCategory = 'Length' | 'Mass' | 'Force' | 'Pressure' | 'Area' | 'MomentOfInertia';

export interface UnitDefinition {
    id: string;
    name: string;
    category: UnitCategory;
    toBase: number; // Multiplier to convert to base SI unit
}

// Base Units:
// Length: meter (m)
// Mass: kilogram (kg)
// Force: Newton (N)
// Pressure: Pascal (Pa)
// Area: Square meter (m^2)
// Moment of Inertia: m^4

export const UNITS: Record<string, UnitDefinition> = {
    // Length
    'm': { id: 'm', name: 'Meters', category: 'Length', toBase: 1 },
    'mm': { id: 'mm', name: 'Millimeters', category: 'Length', toBase: 0.001 },
    'cm': { id: 'cm', name: 'Centimeters', category: 'Length', toBase: 0.01 },
    'in': { id: 'in', name: 'Inches', category: 'Length', toBase: 0.0254 },
    'ft': { id: 'ft', name: 'Feet', category: 'Length', toBase: 0.3048 },
    
    // Mass
    'kg': { id: 'kg', name: 'Kilograms', category: 'Mass', toBase: 1 },
    'g': { id: 'g', name: 'Grams', category: 'Mass', toBase: 0.001 },
    'lb': { id: 'lb', name: 'Pounds (Mass)', category: 'Mass', toBase: 0.453592 },
    
    // Force
    'N': { id: 'N', name: 'Newtons', category: 'Force', toBase: 1 },
    'kN': { id: 'kN', name: 'Kilo-Newtons', category: 'Force', toBase: 1000 },
    'lbf': { id: 'lbf', name: 'Pounds (Force)', category: 'Force', toBase: 4.44822 },
    
    // Pressure/Stress
    'Pa': { id: 'Pa', name: 'Pascals', category: 'Pressure', toBase: 1 },
    'kPa': { id: 'kPa', name: 'Kilopascals', category: 'Pressure', toBase: 1000 },
    'MPa': { id: 'MPa', name: 'Megapascals', category: 'Pressure', toBase: 1000000 },
    'GPa': { id: 'GPa', name: 'Gigapascals', category: 'Pressure', toBase: 1000000000 },
    'psi': { id: 'psi', name: 'PSI', category: 'Pressure', toBase: 6894.76 },
    
    // Moment of Inertia (Area)
    'm4': { id: 'm4', name: 'm⁴', category: 'MomentOfInertia', toBase: 1 },
    'mm4': { id: 'mm4', name: 'mm⁴', category: 'MomentOfInertia', toBase: 1e-12 },
    'cm4': { id: 'cm4', name: 'cm⁴', category: 'MomentOfInertia', toBase: 1e-8 },
    'in4': { id: 'in4', name: 'in⁴', category: 'MomentOfInertia', toBase: 4.16231e-7 },
};

export interface TypedValue {
    value: number;
    unitId: string;
}

export const unitService = {
    /**
     * Converts a value from one unit to another within the same category.
     */
    convert: (value: number, fromUnitId: string, toUnitId: string): number => {
        const from = UNITS[fromUnitId];
        const to = UNITS[toUnitId];

        if (!from || !to) {
            throw new Error(`Invalid unit identifiers: ${fromUnitId}, ${toUnitId}`);
        }

        if (from.category !== to.category) {
            throw new Error(`Cannot convert between categories: ${from.category} and ${to.category}`);
        }

        // Convert to base SI, then to target unit
        const baseValue = value * from.toBase;
        return baseValue / to.toBase;
    },

    /**
     * Helper to get all units for a specific category.
     */
    getUnitsByCategory: (category: UnitCategory): UnitDefinition[] => {
        return Object.values(UNITS).filter(u => u.category === category);
    },

    /**
     * Helper to verify if a unit ID exists.
     */
    isValidUnit: (unitId: string): boolean => {
        return !!UNITS[unitId];
    },

    /**
     * Parse a string like "200 GPa" into { value: 200, unitId: 'GPa' }
     */
    parseValueString: (str: string): TypedValue | null => {
        const match = str.match(/^([\d.]+)\s*([a-zA-Z0-9]+)$/);
        if (!match) return null;
        
        const value = parseFloat(match[1]);
        const unitId = match[2];
        
        if (isNaN(value) || !UNITS[unitId]) return null;
        
        return { value, unitId };
    }
};
