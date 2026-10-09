
import * as THREE from 'three';
import { CadComponent, CadData } from '../types';

export interface MeshBuffer {
    vertices: number[];
    indices: number[];
    normals: number[];
    triangleCount: number;
}

/**
 * CADAM Mesh Generation Module
 * Generates explicit triangular facet data based on NAL geometric primitives.
 */
export const generateSimulationMesh = (cadData: CadData): Record<string, MeshBuffer> => {
    const meshMap: Record<string, MeshBuffer> = {};

    cadData.components.forEach(comp => {
        let geometry: THREE.BufferGeometry;
        
        // Match standard segments used in the viewer for consistency
        switch (comp.shape) {
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(comp.dimensions.x / 2, comp.dimensions.x / 2, comp.dimensions.y, 16);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(comp.dimensions.x / 2, 12, 12);
                break;
            case 'cube':
            default:
                geometry = new THREE.BoxGeometry(comp.dimensions.x, comp.dimensions.y, comp.dimensions.z);
        }

        const positionAttr = geometry.getAttribute('position');
        const normalAttr = geometry.getAttribute('normal');
        const indexAttr = geometry.getIndex();

        if (positionAttr && indexAttr) {
            meshMap[comp.name] = {
                vertices: Array.from(positionAttr.array),
                indices: Array.from(indexAttr.array),
                normals: normalAttr ? Array.from(normalAttr.array) : [],
                triangleCount: indexAttr.count / 3
            };
        }
        
        geometry.dispose();
    });

    return meshMap;
};
