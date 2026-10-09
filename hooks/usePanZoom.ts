import { useState, useRef, useCallback } from 'react';
// FIX: Import React to provide types for mouse/wheel events.
import React from 'react';

const SENSITIVITY = 0.0008; // Reduced for smoother, more controlled zoom
const MAX_ZOOM_LEVEL = 20;  // Maximum 20x zoom
const MIN_ZOOM_LEVEL = 0.2; // Minimum 0.2x zoom (zoom out)

export const usePanZoom = (initialWidth: number, initialHeight: number) => {
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: initialWidth, h: initialHeight });
    const isPanning = useRef(false);
    const startPoint = useRef({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    const getSVGPoint = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        return pt.matrixTransform(svg.getScreenCTM()?.inverse());
    };

    const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (e.button !== 1 && e.button !== 0) return; // Middle or Left click
        isPanning.current = true;
        startPoint.current = { x: e.clientX, y: e.clientY };
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (!isPanning.current) return;
        const endPoint = { x: e.clientX, y: e.clientY };
        const dx = (startPoint.current.x - endPoint.x) * (viewBox.w / (svgRef.current?.clientWidth || 1));
        const dy = (startPoint.current.y - endPoint.y) * (viewBox.h / (svgRef.current?.clientHeight || 1));
        setViewBox(vb => ({ ...vb, x: vb.x + dx, y: vb.y + dy }));
        startPoint.current = endPoint;
    }, [viewBox.w, viewBox.h]);

    const onMouseUp = useCallback(() => {
        isPanning.current = false;
    }, []);

    const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const { clientX, clientY, deltaY } = e;
        const svgPoint = getSVGPoint(clientX, clientY);

        const zoomFactor = 1 - deltaY * SENSITIVITY;
        
        const newW = viewBox.w * zoomFactor;
        const newH = viewBox.h * zoomFactor;

        // Calculate new zoom level relative to initial size to enforce limits
        const newZoomLevel = initialWidth / newW;

        if (newZoomLevel > MAX_ZOOM_LEVEL || newZoomLevel < MIN_ZOOM_LEVEL) {
            return; // Exit if zoom limits are exceeded
        }

        const newX = viewBox.x - (svgPoint.x - viewBox.x) * (zoomFactor - 1);
        const newY = viewBox.y - (svgPoint.y - viewBox.y) * (zoomFactor - 1);

        setViewBox({ x: newX, y: newY, w: newW, h: newH });
    }, [viewBox, initialWidth]);

    const resetZoom = useCallback(() => {
        setViewBox({ x: 0, y: 0, w: initialWidth, h: initialHeight });
    }, [initialWidth, initialHeight]);
    
    const viewBoxString = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;

    return {
        svgRef,
        viewBoxString,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onWheel,
        resetZoom,
        getSVGPoint,
    };
};