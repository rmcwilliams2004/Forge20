import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CadData, CadViewerTool, FoundryState, FoundryCadResult } from '../../types';
import { CadViewerSidebar } from './CadComponentList';
import { CadViewerToolbar } from './CadViewerToolbar';
import { FoundryParamPanel } from '../foundry/FoundryParamPanel';
import { MATERIAL_LIBRARY } from '../../constants/materialLibrary';
import { MonitorOff, Tag, Scissors, Layers, Info } from 'lucide-react';

interface CadViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cadData: CadData;
  isViewer: boolean;
  foundryResult?: FoundryCadResult | null;
  onAddSnapshot?: (dataUrl: string, viewName: string) => void;
  physicsResult?: any | null;
  runPhysicsValidation?: (cadData: CadData, envId: string) => Promise<void>;
  isPhysicsActive?: boolean;
}

// Robust WebGL detection to prevent uncaught context creation errors
const checkWebGLSupport = () => {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
};

export const CadViewerModal: React.FC<CadViewerModalProps> = ({ 
    isOpen, onClose, cadData, isViewer, foundryResult, onAddSnapshot, 
    physicsResult, runPhysicsValidation, isPhysicsActive 
}) => {
    const [webglError, setWebglError] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<CadViewerTool>('select');
    const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set(cadData.components.map(c => c.name)));
    const [selectedComponentName, setSelectedComponentName] = useState<string | null>(null);

    const [isExploded, setIsExploded] = useState(false);
    const [explodeFactor, setExplodeFactor] = useState(0.5);
    const [isSectionEnabled, setIsSectionEnabled] = useState(false);
    const [sectionPlaneConfig, setSectionPlaneConfig] = useState({ axis: 'x', constant: 0, inverted: false });
    const [isAutoRotate, setIsAutoRotate] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    // Fix: Added isMeshMode state to resolve type error when passing props to CadViewerToolbar
    const [isMeshMode, setIsMeshMode] = useState(false);
    const [activeEnv, setActiveEnv] = useState('SAA_LEO_ORBIT');
    const [showSovereignTags, setShowSovereignTags] = useState(true);
    
    const [foundryState, setFoundryState] = useState<FoundryState>({
        selectedMaterial: MATERIAL_LIBRARY.find(m => m.name === foundryResult?.metadata.material) || MATERIAL_LIBRARY[0],
        parameters: foundryResult?.scad_params.parameters || { Length: 100, Width: 50, Thickness: 10 },
        scadString: foundryResult?.scad_params.raw_scad || "// NAL v12.1 SCAD\ncube([100, 50, 10]);",
        safetyFactor: 3.2,
        isLocked: false,
        jurisdiction: 'USPTO'
    });

    const mountRef = useRef<HTMLDivElement>(null);
    const threeRef = useRef<{
        scene?: THREE.Scene,
        camera?: THREE.PerspectiveCamera,
        renderer?: THREE.WebGLRenderer,
        controls?: OrbitControls,
        clippingPlanes: THREE.Plane[],
        animationFrameId?: number,
        group?: THREE.Group
    }>({ clippingPlanes: [] });

    // Handle Sovereign Slicing (Clipping Planes)
    useEffect(() => {
        const t = threeRef.current;
        if (!t.scene || !isSectionEnabled || !t.renderer) {
            if (t.renderer) t.renderer.localClippingEnabled = false;
            return;
        }

        const normal = new THREE.Vector3();
        if (sectionPlaneConfig.axis === 'x') normal.set(sectionPlaneConfig.inverted ? 1 : -1, 0, 0);
        else if (sectionPlaneConfig.axis === 'y') normal.set(0, sectionPlaneConfig.inverted ? 1 : -1, 0);
        else normal.set(0, 0, sectionPlaneConfig.inverted ? 1 : -1);

        const plane = new THREE.Plane(normal, sectionPlaneConfig.constant);
        t.clippingPlanes = [plane];
        t.renderer.localClippingEnabled = true;

        t.scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
                obj.material.clippingPlanes = t.clippingPlanes;
                obj.material.clipShadows = true;
            }
        });
    }, [isSectionEnabled, sectionPlaneConfig]);

    useEffect(() => {
        if (!isOpen || !mountRef.current) return;
        
        // 1. Check for hardware acceleration
        if (!checkWebGLSupport()) {
            setWebglError("Hardware acceleration unavailable: Sovereign Drawing Engine in 2D Fallback Mode.");
            return;
        }

        const currentMount = mountRef.current;
        const t = threeRef.current;

        try {
            t.scene = new THREE.Scene();
            t.scene.background = new THREE.Color(0x020617);
            t.camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 10000);
            
            // 2. Initialize Renderer inside a localized try block to catch context errors
            t.renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true, 
                preserveDrawingBuffer: true,
                failIfMajorPerformanceCaveat: false 
            });
            
            t.renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            t.renderer.setPixelRatio(window.devicePixelRatio);
            currentMount.appendChild(t.renderer.domElement);
            
            t.controls = new OrbitControls(t.camera, t.renderer.domElement);
            t.controls.enableDamping = true;

            const ambient = new THREE.AmbientLight(0xffffff, 0.5);
            t.scene.add(ambient);
            const directional = new THREE.DirectionalLight(0xffffff, 1.2);
            directional.position.set(500, 500, 500);
            t.scene.add(directional);

            const group = new THREE.Group();
            t.group = group;
            
            cadData.components.forEach((comp) => {
                const geo = new THREE.BoxGeometry(comp.dimensions.x, comp.dimensions.y, comp.dimensions.z);
                const mat = new THREE.MeshStandardMaterial({ 
                    color: comp.name.toLowerCase().includes('chamber') ? 0x8b5cf6 : 0x06b6d4, 
                    transparent: true, 
                    opacity: 0.9, 
                    metalness: 0.6, 
                    roughness: 0.2,
                    side: THREE.DoubleSide,
                    // Fix: Applied isMeshMode state to material wireframe property
                    wireframe: isMeshMode
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(comp.position.x, comp.position.y, comp.position.z);
                mesh.name = comp.name;
                group.add(mesh);
            });
            
            const box = new THREE.Box3().setFromObject(group);
            const center = box.getCenter(new THREE.Vector3());
            group.position.sub(center);
            t.camera.position.set(350, 350, 350);
            t.scene.add(group);

            const animate = () => {
                t.animationFrameId = requestAnimationFrame(animate);
                t.controls?.update();
                if (isAutoRotate && t.group) t.group.rotation.y += 0.005;
                t.renderer?.render(t.scene!, t.camera!);
            };
            animate();
        } catch (error) {
            console.warn("WebGL Context Creation Failed:", error);
            setWebglError("Visual handshake failure. Switching to Agnostic 2D Projections.");
        }

        return () => {
            if (t.animationFrameId) cancelAnimationFrame(t.animationFrameId);
            t.renderer?.dispose();
            if (currentMount && t.renderer && t.renderer.domElement) {
                try { currentMount.removeChild(t.renderer.domElement); } catch(e) {}
            }
        };
        // Fix: Added isMeshMode to dependency array to update materials when toggled
    }, [isOpen, cadData, isAutoRotate, isMeshMode]);

    if (!isOpen) return null;

    // USPTO Standards Tagging Data for Nommo Alpha v2
    const usptoTags = [
        { label: "100 Aegis Shielding Unit", pos: "top-1/4 left-1/4", desc: "Radiation dampening lattice." },
        { label: "200 Z-Pinch Ignition Chamber", pos: "bottom-1/3 right-1/3", desc: "Core energy centrifugal centroid." },
        { label: "300 Feedback Induction Coils", pos: "top-1/2 left-1/3", desc: "Magnetic tensor alignment array." }
    ];

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-[98vw] h-[95vh] flex flex-col border border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center px-8 py-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl flex-shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-brand-cyan/20 rounded-2xl flex items-center justify-center text-brand-cyan border border-brand-cyan/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <Scissors className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-brand-light uppercase tracking-tight italic leading-none">Sovereign Drawing Engine: {cadData.assemblyName}</h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    {isSectionEnabled ? 'Cross-Section Protocol Active' : 'Ortho-Projection Standby'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                         <button 
                            onClick={() => setShowSovereignTags(!showSovereignTags)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showSovereignTags ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
                        >
                            <Tag className="w-4 h-4" /> {showSovereignTags ? 'Hide USPTO Tags' : 'Show USPTO Tags'}
                        </button>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-all transform hover:rotate-90 text-4xl font-bold leading-none ml-2">&times;</button>
                    </div>
                </header>
                
                <main className="flex-1 flex overflow-hidden relative">
                    <div className="flex-1 relative bg-slate-950">
                        {webglError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                                <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl relative">
                                    <MonitorOff className="w-16 h-16 text-slate-600" />
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                        <Info className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="max-w-md">
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Agnostic Vector Projection</h3>
                                    <p className="text-slate-500 text-sm mt-2">{webglError}</p>
                                    <div className="mt-8 grid grid-cols-2 gap-3">
                                        {cadData.components.map((c, i) => (
                                            <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-left">
                                                <p className="text-[10px] font-black text-brand-cyan uppercase truncate">{c.name}</p>
                                                <p className="text-[9px] text-slate-500 font-mono mt-1">VOL: {(c.dimensions.x * c.dimensions.y * c.dimensions.z).toFixed(0)}mm³</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Fix: Passed missing isMeshMode and onToggleMeshMode props to CadViewerToolbar */}
                                <CadViewerToolbar 
                                    activeTool={activeTool} 
                                    onToolChange={setActiveTool} 
                                    onResetView={() => threeRef.current.controls?.reset()} 
                                    isExploded={isExploded} 
                                    onToggleExplode={() => setIsExploded(!isExploded)} 
                                    isSectionEnabled={isSectionEnabled} 
                                    onToggleSection={() => setIsSectionEnabled(!isSectionEnabled)} 
                                    isAutoRotate={isAutoRotate} 
                                    onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)} 
                                    showGrid={showGrid} 
                                    onToggleGrid={() => setShowGrid(!showGrid)} 
                                    isMeshMode={isMeshMode}
                                    onToggleMeshMode={() => setIsMeshMode(!isMeshMode)}
                                />
                                <div ref={mountRef} className="w-full h-full cursor-crosshair" />
                                
                                {/* Sovereign USPTO Annotation Layer */}
                                {showSovereignTags && isSectionEnabled && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {usptoTags.map((tag, i) => (
                                            <div key={i} className={`absolute ${tag.pos} animate-fade-in`} style={{ animationDelay: `${i * 200}ms` }}>
                                                <div className="flex flex-col items-center">
                                                    <div className="bg-black/90 border border-brand-cyan px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md">
                                                        <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest leading-none mb-1">{tag.label}</p>
                                                        <p className="text-[8px] text-gray-400 italic leading-none">{tag.desc}</p>
                                                    </div>
                                                    <div className="w-px h-16 bg-brand-cyan/40"></div>
                                                    <div className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_10px_#06b6d4]"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    <div className="flex flex-col border-l border-slate-800 w-[24rem] bg-slate-900/40 backdrop-blur-3xl overflow-y-auto shadow-2xl">
                        <CadViewerSidebar 
                            components={cadData.components} visibleIds={visibleIds} selectedComponentName={selectedComponentName} 
                            onToggleVisibility={(name) => setVisibleIds(p => { const n = new Set(p); n.has(name) ? n.delete(name) : n.add(name); return n; })} 
                            onSelectComponent={setSelectedComponentName} onToggleAll={(v) => setVisibleIds(v ? new Set(cadData.components.map(c => c.name)) : new Set())} 
                            onToggleGroup={(names, v) => setVisibleIds(p => { names.forEach(name => v ? p.add(name) : p.delete(name)); return new Set(p); })} 
                            isExploded={isExploded} onToggleExplode={() => setIsExploded(!isExploded)} explodeFactor={explodeFactor} onExplodeFactorChange={setExplodeFactor} 
                            isSectionEnabled={isSectionEnabled} onToggleSection={() => setIsSectionEnabled(!isSectionEnabled)} sectionPlaneConfig={sectionPlaneConfig} onSectionPlaneConfigChange={setSectionPlaneConfig} 
                            measurements={[]} onClearMeasurements={() => {}} units={cadData.units} activeTool={activeTool} isMeasuring={false} 
                            isPhysicsActive={isPhysicsActive} runPhysicsValidation={() => runPhysicsValidation?.(cadData, activeEnv)} activeEnv={activeEnv} onEnvChange={setActiveEnv}
                        />
                        <FoundryParamPanel state={foundryState} onUpdate={(u) => setFoundryState(s => ({ ...s, ...u }))} isViewer={isViewer} />
                    </div>
                </main>
            </div>
        </div>
    );
};