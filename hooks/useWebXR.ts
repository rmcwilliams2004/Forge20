
import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

export const useWebXR = (initialRenderer: THREE.WebGLRenderer | null) => {
    const [isXRSupported, setIsXRSupported] = useState(false);
    const [isXRSessionActive, setIsXRSessionActive] = useState(false);

    useEffect(() => {
        if ('xr' in navigator) {
            (navigator as any).xr.isSessionSupported('immersive-vr').then((supported: boolean) => {
                setIsXRSupported(supported);
            });
        }
    }, []);

    const enterImmersiveFoundry = useCallback(async (activeRenderer: THREE.WebGLRenderer | null) => {
        const renderer = activeRenderer || initialRenderer;
        if (!renderer || !isXRSupported) {
            console.warn("[HOLODECK]: XR session requested but renderer or hardware unavailable.");
            return;
        }

        try {
            const session = await (navigator as any).xr.requestSession('immersive-vr', {
                requiredFeatures: ['local-floor', 'hand-tracking']
            });
            
            renderer.xr.enabled = true;
            await renderer.xr.setSession(session);
            setIsXRSessionActive(true);
            
            console.log("[HOLODECK]: Spatial bridge active. 1:1 scale simulation online.");
            
            session.addEventListener('end', () => {
                setIsXRSessionActive(false);
                renderer.xr.enabled = false;
            });
        } catch (error) {
            console.error("[HOLODECK]: Failed to initialize spatial bridge:", error);
            window.dispatchEvent(new CustomEvent('forge-log', { detail: `[CRITICAL]: WebXR session denied. Check hardware uplink.` }));
        }
    }, [initialRenderer, isXRSupported]);

    return { isXRSupported, isXRSessionActive, enterImmersiveFoundry };
};
