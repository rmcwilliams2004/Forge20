
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CadData, PhysicsValidationResult, PeakStressNode, SystemMap } from '../../types';
import { MonitorOff, Activity, Shield, Info, AlertCircle, Maximize2, Move, Search } from 'lucide-react';

interface PhysicsViewportProps {
    cadData: CadData;
    physicsResult?: PhysicsValidationResult | null;
    isPhysicsActive?: boolean;
    onAddSnapshot?: (dataUrl: string, name: string) => void;
    systemMap?: SystemMap | null;
}

const checkWebGLSupport = () => {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
};

/**
 * Creates a sprite with a text label for a hotspot.
 */
const createTextLabel = (text: string, color: string = '#ffffff', scale: number = 60) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Sprite();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.roundRect(0, 0, 512, 128, 20);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scale, scale / 4, 1);
    return sprite;
};

export const PhysicsViewport: React.FC<PhysicsViewportProps> = ({ 
    cadData, physicsResult, isPhysicsActive, onAddSnapshot, systemMap 
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [webglError, setWebglError] = useState<string | null>(null);
    const [isAutoRotate, setIsAutoRotate] = useState(false);
    const [showNodalGrid, setShowNodalGrid] = useState(true);
    const [showXRay, setShowXRay] = useState(!!systemMap);
    
    const threeRef = useRef<{
        scene?: THREE.Scene,
        camera?: THREE.PerspectiveCamera,
        renderer?: THREE.WebGLRenderer,
        controls?: OrbitControls,
        meshMap: Map<string, THREE.Mesh>,
        markerGroup?: THREE.Group,
        xrayGroup?: THREE.Group,
        scanLine?: THREE.Mesh,
        animationFrameId?: number
    }>({ meshMap: new Map() });

    // Handle X-Ray Labels for Reverse Engineering
    useEffect(() => {
        const t = threeRef.current;
        if (!t.scene || !systemMap || !showXRay) {
            if (t.xrayGroup) t.scene?.remove(t.xrayGroup);
            return;
        }

        if (t.xrayGroup) {
            t.scene.remove(t.xrayGroup);
        }
        t.xrayGroup = new THREE.Group();
        t.scene.add(t.xrayGroup);

        (systemMap.hierarchy || []).forEach((comp, i) => {
            const mesh = Array.from(t.meshMap.values())[i]; // Heuristic matching for demo
            if (mesh) {
                const labelText = `${comp.name}\n${comp.material_inference} (${(comp.confidence * 100).toFixed(0)}%)`;
                const label = createTextLabel(labelText, '#06b6d4', 80);
                label.position.copy(mesh.position);
                label.position.y += 40;
                t.xrayGroup?.add(label);

                // Add a small pointer line
                const points = [mesh.position, label.position];
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                const lineMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.3 });
                const line = new THREE.Line(lineGeo, lineMat);
                t.xrayGroup?.add(line);
            }
        });
    }, [systemMap, showXRay]);

    // Handle Heatmap and Hotspot Overlays
    useEffect(() => {
        const t = threeRef.current;
        if (!t.scene || !physicsResult) return;

        t.meshMap.forEach((mesh) => {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.color.set(mesh.name.toLowerCase().includes('chamber') ? 0x8b5cf6 : 0x06b6d4);
            mat.emissive.set(0x000000);
            mat.opacity = 0.85;
            mat.wireframe = !showNodalGrid;
        });

        if (t.markerGroup) {
            t.scene.remove(t.markerGroup);
        }
        t.markerGroup = new THREE.Group();
        t.scene.add(t.markerGroup);

        const globalStress = physicsResult.telemetry?.max_stress || 0;
        const stability = physicsResult.telemetry?.stability_index || 1;
        const maxStressGPa = physicsResult.telemetry?.max_stress_gpa || 0;
        
        t.meshMap.forEach((mesh) => {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            const stressColor = new THREE.Color();
            if (globalStress < 0.3) {
                stressColor.set(0x06b6d4).lerp(new THREE.Color(0xeab308), globalStress / 0.3);
            } else {
                stressColor.set(0xeab308).lerp(new THREE.Color(0xef4444), (globalStress - 0.3) / 0.7);
            }
            mat.color.copy(stressColor);
            
            if (stability < 0.7 || globalStress > 0.8) {
                mat.emissive.set(0xef4444);
                mat.emissiveIntensity = (1 - stability) * 0.8;
                mat.transparent = true;
                mat.opacity = 0.7;
            }
        });

        const hotspots = physicsResult.visual_layers?.peak_stress_nodes || [];
        hotspots.forEach((node: PeakStressNode) => {
            const nodeGroup = new THREE.Group();
            nodeGroup.position.set(node.x, node.y, node.z);

            const marker = new THREE.Mesh(new THREE.SphereGeometry(6), new THREE.MeshBasicMaterial({ color: 0xff3300 }));
            nodeGroup.add(marker);
            
            const label = createTextLabel(`${(node.magnitude * maxStressGPa).toFixed(2)} GPa`, '#ff3300');
            label.position.y = 20;
            nodeGroup.add(label);

            t.markerGroup?.add(nodeGroup);
        });

    }, [physicsResult, showNodalGrid]);

    useEffect(() => {
        if (!mountRef.current) return;
        if (!checkWebGLSupport()) {
            setWebglError("Physics visualization restricted: Context creation failed.");
            return;
        }

        const currentMount = mountRef.current;
        const t = threeRef.current;

        try {
            t.scene = new THREE.Scene();
            t.scene.background = new THREE.Color(0x020617);
            t.camera = new THREE.PerspectiveCamera(65, currentMount.clientWidth / currentMount.clientHeight, 0.1, 10000);
            
            t.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
            t.renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            t.renderer.setPixelRatio(window.devicePixelRatio);
            currentMount.appendChild(t.renderer.domElement);
            
            t.controls = new OrbitControls(t.camera, t.renderer.domElement);
            t.controls.enableDamping = true;

            t.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
            const dl = new THREE.DirectionalLight(0xffffff, 1.2);
            dl.position.set(200, 500, 300);
            t.scene.add(dl);

            const group = new THREE.Group();
            cadData.components.forEach((comp) => {
                const geo = new THREE.BoxGeometry(comp.dimensions.x, comp.dimensions.y, comp.dimensions.z);
                const mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(comp.position.x, comp.position.y, comp.position.z);
                mesh.name = comp.name;
                group.add(mesh);
                t.meshMap.set(comp.name, mesh);
            });
            
            const box = new THREE.Box3().setFromObject(group);
            const center = box.getCenter(new THREE.Vector3());
            group.position.sub(center);
            t.camera.position.set(400, 300, 400);
            t.scene.add(group);

            const animate = () => {
                t.animationFrameId = requestAnimationFrame(animate);
                t.controls?.update();
                if (isAutoRotate) group.rotation.y += 0.003;
                t.renderer?.render(t.scene!, t.camera!);
            };
            animate();
        } catch (e) {
            setWebglError("Context Fault: Switched to Agnostic Metadata Layer.");
        }

        return () => {
            if (t.animationFrameId) cancelAnimationFrame(t.animationFrameId);
            t.renderer?.dispose();
        };
    }, [cadData, isAutoRotate]);

    return (
        <div className="relative w-full h-[600px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
            <div ref={mountRef} className="w-full h-full cursor-move" />
            
            <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-5 rounded-2xl flex items-center gap-5">
                    <div className={`w-3.5 h-3.5 rounded-full ${physicsResult ? 'bg-green-500 animate-pulse' : 'bg-brand-cyan'} `}></div>
                    <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Telemetry HUD</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase mt-1.5">
                            {systemMap ? `System: ${systemMap.product_name}` : 'Awaiting 4D Stream...'}
                        </p>
                    </div>
                </div>

                {systemMap && (
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl animate-fade-in pointer-events-auto">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={showXRay} onChange={e => setShowXRay(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-brand-cyan" />
                            <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">X-Ray Deconstruction View</span>
                        </label>
                    </div>
                )}
            </div>

            <div className="absolute top-6 right-6 flex flex-col gap-2">
                <button onClick={() => setIsAutoRotate(!isAutoRotate)} className={`p-3.5 rounded-2xl border transition-all ${isAutoRotate ? 'bg-brand-cyan text-gray-900' : 'bg-slate-900/60 text-white border-slate-700'}`}>
                    <Activity className="w-5 h-5" />
                </button>
                <button onClick={() => setShowNodalGrid(!showNodalGrid)} className={`p-3.5 rounded-2xl border transition-all ${!showNodalGrid ? 'bg-purple-600 text-white' : 'bg-slate-900/60 text-white border-slate-700'}`}>
                    <Maximize2 className="w-5 h-5" />
                </button>
            </div>

            {isPhysicsActive && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-fade-in">
                    <Activity className="w-20 h-20 text-brand-cyan animate-pulse" />
                    <p className="mt-6 text-white font-black uppercase tracking-[0.4em] animate-pulse">Genesis Solver Active</p>
                </div>
            )}
            
            {systemMap && !physicsResult && (
                <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-md border border-brand-cyan/20 p-6 rounded-3xl animate-slide-in-up">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-cyan/20 rounded-xl">
                            <Search className="w-6 h-6 text-brand-cyan" />
                        </div>
                        <div>
                            <h5 className="text-sm font-black text-white uppercase italic tracking-tighter">Recursive Deconstruction: {systemMap.product_name}</h5>
                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                                The Council has deconstructed the object into <span className="text-brand-cyan font-bold">{(systemMap?.hierarchy || []).length} major assemblies</span>. 
                                Material inference has identified likely alloys based on disciplinary norms.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
