
import React, { useState, useMemo } from 'react';
import { unitService, UnitCategory } from '../../../services/unitService';

export const UnitConverter: React.FC = () => {
    const [category, setCategory] = useState<UnitCategory>('Length');
    const [fromUnit, setFromUnit] = useState('m');
    const [toUnit, setToUnit] = useState('ft');
    const [fromValue, setFromValue] = useState('1');

    const categories: UnitCategory[] = ['Length', 'Mass', 'Force', 'Pressure', 'Area', 'MomentOfInertia'];

    const units = useMemo(() => {
        return unitService.getUnitsByCategory(category);
    }, [category]);

    const result = useMemo(() => {
        const fromVal = parseFloat(fromValue);
        if (isNaN(fromVal)) return '...';
        try {
            // Check if current units are valid for the category before converting
            if (!units.find(u => u.id === fromUnit) || !units.find(u => u.id === toUnit)) {
                return '...';
            }
            const val = unitService.convert(fromVal, fromUnit, toUnit);
            return val.toPrecision(6);
        } catch (e) {
            return 'Error';
        }
    }, [fromValue, fromUnit, toUnit, units]);

    const handleCategoryChange = (newCategory: UnitCategory) => {
        setCategory(newCategory);
        const newUnits = unitService.getUnitsByCategory(newCategory);
        setFromUnit(newUnits[0].id);
        setToUnit(newUnits[1]?.id || newUnits[0].id);
    };

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold text-brand-light mb-4">Unit Converter & Calculator (Powered by SF-CM 1)</h1>
            <div className="max-w-xl mx-auto bg-gray-800/50 border border-gray-700 rounded-lg p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                        value={category}
                        onChange={e => handleCategoryChange(e.target.value as UnitCategory)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
                        <input
                            type="number"
                            value={fromValue}
                            onChange={e => setFromValue(e.target.value)}
                            className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-gray-200 text-lg focus:ring-2 focus:ring-brand-cyan"
                        />
                         <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full mt-2 p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 text-sm">
                            {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                        </select>
                    </div>

                    <div className="text-2xl text-gray-400 pb-10">=</div>
                    
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
                        <div className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-brand-cyan text-lg h-[54px] flex items-center">{result}</div>
                         <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full mt-2 p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 text-sm">
                            {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
