import React, { useState } from 'react';
import { SuiteSidebar } from './SuiteSidebar';
import { MaterialSelector } from './cm1/MaterialSelector';
import { StandardsLibrary } from './cm1/StandardsLibrary';
import { DocumentRevisionControl } from './cm1/DocumentRevisionControl';
import { UnitConverter } from './cm1/UnitConverter';
import { FmeaAnalyzer } from './cm2/FmeaAnalyzer';
import { SpcTool } from './cm2/SpcTool';
import { RequirementsManager } from './cm2/RequirementsManager';
import { RcaTool } from './cm2/RcaTool';
import { UniversalPrePostProcessor } from './cm3/UniversalPrePostProcessor';
import { ScriptingEngine } from './cm3/ScriptingEngine';
import { DataVisualizationConsole } from './cm3/DataVisualizationConsole';
import { StructuralAnalysis } from './cm3/StructuralAnalysis';
import { PyTorchStudio } from '../ml/PyTorchStudio';
import { TensorFlowStudio } from '../ml/TensorFlowStudio';
import { TensorBoardDashboard } from '../ml/TensorBoardDashboard';
import { PinnsSurrogateLab } from '../ml/PinnsSurrogateLab';
import { Material, FmeaItem, User } from '../../types';
import { MOCK_FMEA_ITEMS } from '../../constants';

interface ToolSuiteProps {
    user?: User;
    onUpdateUser?: (user: User) => void;
}

export const ToolSuite: React.FC<ToolSuiteProps> = ({ user, onUpdateUser }) => {
    const [activeTool, setActiveTool] = useState('cm1/material-selector');
    
    // --- MASTER DATA MODEL STATE ---
    // CM-1: Active Material Context (shared with CM-3)
    const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
    
    // CM-2: Quality Data (shared between SPC and FMEA)
    const [fmeaItems, setFmeaItems] = useState<FmeaItem[]>(MOCK_FMEA_ITEMS);

    // --- INTEGRATION HANDLERS ---
    const handleSelectMaterialForAnalysis = (material: Material) => {
        setActiveMaterial(material);
        // Automatically switch to the analysis tool to demonstrate the workflow
        setActiveTool('cm3/analysis');
    };

    const handleSpcOutlier = () => {
        // Trigger a closed-loop update: If SPC detects an outlier, 
        // increase the 'Occurrence' score of a relevant failure mode.
        const targetId = 1; // Example: "Insufficient Torque"
        setFmeaItems(prev => prev.map(item => {
            if (item.id === targetId) {
                const newOcc = Math.min(10, item.occurrence + 2); // Increase occurrence
                return {
                    ...item,
                    occurrence: newOcc,
                    rpn: item.severity * newOcc * item.detection, // Recalculate RPN
                    actionStatus: 'Pending' // Re-open action
                };
            }
            return item;
        }));
        // Switch to FMEA tool to show the update
        setActiveTool('cm2/fmea');
        alert("ALERT: SPC Out-of-Control event detected! Linked FMEA Item #1 updated automatically.");
    };

    const renderActiveTool = () => {
        switch (activeTool) {
            // CM-1
            case 'cm1/material-selector':
                return <MaterialSelector user={user} onUpdateUser={onUpdateUser} onSelectForAnalysis={handleSelectMaterialForAnalysis} />;
            case 'cm1/standards-library':
                return <StandardsLibrary />;
            case 'cm1/drc':
                return <DocumentRevisionControl />;
            case 'cm1/unit-converter':
                return <UnitConverter />;
            // CM-2
            case 'cm2/fmea':
                return <FmeaAnalyzer items={fmeaItems} />;
            case 'cm2/spc':
                return <SpcTool onOutlierDetected={handleSpcOutlier} />;
            case 'cm2/req-mgmt':
                 return <RequirementsManager />;
            case 'cm2/rca':
                return <RcaTool />;
            // CM-3
            case 'cm3/pre-post':
                return <UniversalPrePostProcessor />;
            case 'cm3/scripting':
                return <ScriptingEngine />;
            case 'cm3/viz':
                return <DataVisualizationConsole />;
            case 'cm3/analysis':
                return <StructuralAnalysis activeMaterial={activeMaterial} />;
            // CM-4: Neural Forge (PyTorch & TensorFlow)
            case 'cm4/pytorch':
                return <PyTorchStudio />;
            case 'cm4/tensorflow':
                return <TensorFlowStudio />;
            case 'cm4/tensorboard':
                return <TensorBoardDashboard />;
            case 'cm4/pinns':
                return <PinnsSurrogateLab />;
            default:
                return <MaterialSelector user={user} onUpdateUser={onUpdateUser} onSelectForAnalysis={handleSelectMaterialForAnalysis} />;
        }
    };

    return (
        <div className="flex h-[calc(100vh-81px)]">
            <SuiteSidebar activeTool={activeTool} onSelectTool={setActiveTool} />
            <main className="flex-1 p-6 overflow-y-auto">
                {renderActiveTool()}
            </main>
        </div>
    );
};
