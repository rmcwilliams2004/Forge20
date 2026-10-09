import React from 'react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// FIX: Made children optional to resolve TypeScript error.
const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-xl font-bold text-brand-cyan mb-3 pb-2 border-b-2 border-cyan-800/50">{title}</h3>
        <div className="space-y-3 text-gray-300 leading-relaxed">{children}</div>
    </div>
);

const SubSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div>
        <h4 className="font-semibold text-brand-light mb-1">{title}</h4>
        <div className="space-y-2 text-sm">{children}</div>
    </div>
);

export const UserManualModal = ({ isOpen, onClose }: ManualModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in" style={{ animationDuration: '0.3s' }} onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col border-2 border-gray-600" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-brand-light">User Manual (v2.0)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl font-bold">&times;</button>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    <Section title="1. Introduction">
                        <p>Welcome to SynapseForge AI, a full-stack platform for modern product development. It leverages Google's advanced AI to take you from initial concept to a fabrication-ready design, integrating reverse engineering, collaborative review, and automated manufacturing planning into a single, seamless workflow.</p>
                    </Section>

                    <Section title="2. The Core Workflow">
                        <SubSection title="Step 1: Select an Analytical Lens">
                            <p>Your choice of "Engineering Philosophy" is the most crucial first step. It attunes the AI to a specific mindset, fundamentally altering its analysis and suggestions.</p>
                        </SubSection>
                         <SubSection title="Step 2: Define Your Project & Concept">
                            <p>Provide a clear <strong>Project Name</strong> and a detailed <strong>Concept</strong>. The more specific you are, the better the result. For an even better start, try one of the "Alternative Workflows" in the Project Manager to create a project by analyzing an image or a PDF document.</p>
                        </SubSection>
                        <SubSection title="Step 3: Proactive Prompt Validation">
                             <p>As you type your concept, a "Pre-flight Check" AI analyzes your prompt for clarity. If it's ambiguous, it will offer a specific suggestion for improvement to help you get the best possible analysis result.</p>
                        </SubSection>
                         <SubSection title="Step 4: Engage the AI">
                            <p>Click the <strong>"Engage SynapseForge AI"</strong> button to begin the full analysis. This may take a moment as the AI generates a comprehensive, multi-section report.</p>
                        </SubSection>
                    </Section>

                    <Section title="3. The Interactive Analysis Report">
                      <p>The report is more than a static document; it's an interactive workspace.</p>
                      <SubSection title="AI Suggestions & Interactive Exploration">
                        <p>The AI provides material and system suggestions. Instead of re-running a full analysis, you can now click the <strong>"Explore"</strong> button next to any suggestion. This triggers a fast, low-cost AI call to generate a detailed explanation and a new visual concept, allowing for rapid brainstorming.</p>
                      </SubSection>
                      <SubSection title="Live Costing Dashboard">
                        <p>This interactive module allows you to change quantities and materials from the Bill of Materials and instantly recalculate the estimated product cost, providing immediate feedback on design trade-offs.</p>
                      </SubSection>
                      <SubSection title="Real-time Collaboration">
                         <p>Click the comment icon on any section header to open a discussion thread. The system simulates a live environment where you can leave comments and receive replies from team members, with comment counts visible on each section.</p>
                      </SubSection>
                    </Section>

                    <Section title="4. 3D CAD Viewer & Advanced Tools">
                      <SubSection title="Interactive 3D CAD Viewer">
                        <p>Generate and open a high-performance, WebGL-based 3D viewer (powered by Three.js) for your model. You can rotate, pan, and zoom the assembly. Selecting a component from the list highlights it in the 3D view, and vice-versa.</p>
                      </SubSection>
                      <SubSection title="Version Comparison">
                        <p>In the "Version History" panel, you can now click "Compare" on a version to launch the Drawing Comparison tool. The AI visually highlights geometric changes (additions, deletions, modifications) between two versions, providing an intuitive "diff" for your designs.</p>
                      </SubSection>
                       <SubSection title="BOM to Procurement">
                         <p>In the Bill of Materials table, click the "Source" button on any item. The AI will use Google Search to find real-world suppliers, estimated costs, and lead times, turning your BOM into an actionable procurement dashboard.</p>
                      </SubSection>
                    </Section>
                    
                    <Section title="5. From Design to Fabrication">
                        <p>The **Forge Fabrication Planner** bridges the gap between your virtual prototype and the factory floor.</p>
                        <SubSection title="Generate a Fabrication Plan">
                          <p>At the bottom of the report, select a manufacturing process (e.g., CNC Machining) and material. The AI will perform a Design for Manufacturability (DFM) check and generate process-specific data, such as G-Code for CNC.</p>
                        </SubSection>
                        <SubSection title="Toolpath Visualization">
                          <p>After generating a CNC plan, you can click "Visualize Toolpath & Summary." This opens a modal that displays a 2D rendering of the tool's path and an AI-powered, natural language summary of the G-Code operations.</p>
                        </SubSection>
                    </Section>
                    
                    <Section title="6. Visual Documentation">
                        <SubSection title="Technical Drawings">
                            <p>You can request new engineering drawings based on a text prompt or, new in V2.0, by uploading a reference image and providing instructions. The AI will convert your photo or sketch into a professional, standardized engineering document.</p>
                        </SubSection>
                        <SubSection title="Photorealistic Concepts & Video">
                             <p>Generate high-quality concept images or short video animations to visualize your product in different scenarios.</p>
                        </SubSection>
                    </Section>

                    <Section title="7. DeVinci: Your AI Engineering Partner">
                        <p>Launch the "DeVinci" conversational AI to have a real-time, voice-based discussion about your project. DeVinci is primed with the full context of your current analysis and can be used to brainstorm ideas, generate drawings, or perform web research on your behalf.</p>
                    </Section>
                </main>
            </div>
        </div>
    );
};