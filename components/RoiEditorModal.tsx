
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Modal } from './Modal';

type Box = { id: number; x: number; y: number; w: number; h: number; label?: string };

interface RoiEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    onCropComplete: (croppedFiles: File[]) => void;
}

export const RoiEditorModal: React.FC<RoiEditorModalProps> = ({ isOpen, onClose, file, onCropComplete }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
    const [currentBox, setCurrentBox] = useState<Box | null>(null);
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [selectedBoxIds, setSelectedBoxIds] = useState<Set<number>>(new Set());
    
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        boxes.forEach((box, i) => {
            const isSel = selectedBoxIds.has(box.id);
            ctx.strokeStyle = isSel ? '#06b6d4' : '#64748b';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.w, box.h);
            
            ctx.fillStyle = isSel ? '#06b6d4' : '#475569';
            ctx.fillRect(box.x, box.y - 18, 60, 18);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Inter';
            ctx.fillText(`ROI ${i+1}`, box.x + 5, box.y - 6);
        });
        
        if (currentBox) {
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
            ctx.setLineDash([]);
        }
    }, [boxes, currentBox, selectedBoxIds]);

    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image) return;
    
        const setup = () => {
            const rect = image.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            redrawCanvas();
        };

        if (image.complete) setup();
        else image.onload = setup;
    }, [redrawCanvas]);

    useEffect(() => {
        if (isOpen && file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
            setBoxes([]);
            setCurrentBox(null);
        }
    }, [isOpen, file]);
    
    useEffect(() => {
      if (imagePreview) {
        const timer = setTimeout(initializeCanvas, 100);
        window.addEventListener('resize', initializeCanvas);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('resize', initializeCanvas);
        }
      }
    }, [imagePreview, initializeCanvas]);

    useEffect(() => { redrawCanvas(); }, [boxes, currentBox, redrawCanvas]);
    
    const getRelativeCoords = (e: React.MouseEvent | MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const startDrawing = (e: React.MouseEvent) => {
        const coords = getRelativeCoords(e);
        if (coords) {
            setIsDrawing(true);
            setStartPoint(coords);
        }
    };
    
    const draw = (e: MouseEvent) => {
        if (!isDrawing || !startPoint) return;
        const coords = getRelativeCoords(e);
        if (!coords) return;
        const x = Math.min(startPoint.x, coords.x);
        const y = Math.min(startPoint.y, coords.y);
        const w = Math.abs(startPoint.x - coords.x);
        const h = Math.abs(startPoint.y - coords.y);
        setCurrentBox({ id: 0, x, y, w, h });
    };

    const finishDrawing = () => {
        if (isDrawing && currentBox && currentBox.w > 10 && currentBox.h > 10) {
            const newBox = { ...currentBox, id: Date.now() };
            setBoxes(prev => [...prev, newBox]);
            setSelectedBoxIds(prev => new Set(prev).add(newBox.id));
        }
        setIsDrawing(false);
        setCurrentBox(null);
    };

    useEffect(() => {
        const handleDraw = (e: MouseEvent) => draw(e);
        const handleFinish = () => finishDrawing();
        if (isDrawing) {
            window.addEventListener('mousemove', handleDraw);
            window.addEventListener('mouseup', handleFinish);
        }
        return () => {
            window.removeEventListener('mousemove', handleDraw);
            window.removeEventListener('mouseup', handleFinish);
        };
    }, [isDrawing, startPoint, currentBox]);
    
    const handleCrop = async () => {
        if (selectedBoxIds.size === 0 || !file || !imageRef.current) return;
        const boxesToCrop = boxes.filter(box => selectedBoxIds.has(box.id));
        const img = imageRef.current;
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;

        const cropPromises = boxesToCrop.map((box, index) => {
            return new Promise<File>((resolve, reject) => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = box.w * scaleX;
                tempCanvas.height = box.h * scaleY;
                const ctx = tempCanvas.getContext('2d');
                if (!ctx) return reject(new Error("Canvas fault"));
                ctx.drawImage(img, box.x * scaleX, box.y * scaleY, box.w * scaleX, box.h * scaleY, 0, 0, tempCanvas.width, tempCanvas.height);
                tempCanvas.toBlob((blob) => {
                    if (blob) resolve(new File([blob], `roi_${index + 1}_${file.name}`, { type: file.type }));
                    else reject(new Error("Blob fault"));
                }, file.type);
            });
        });

        const croppedFiles = await Promise.all(cropPromises);
        onCropComplete(croppedFiles);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Interest Regions" confirmText={`Ingest ${selectedBoxIds.size} Regions`} onConfirm={handleCrop}>
            <div className="space-y-4">
                <p className="text-sm text-slate-400">
                    Draw boxes over specific components you want the AI to analyze in isolation.
                </p>

                <div onMouseDown={startDrawing} className="relative w-full cursor-crosshair border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                    {imagePreview && <img ref={imageRef} src={imagePreview} alt="ROI Source" className="w-full h-auto max-h-[50vh] object-contain block" draggable="false" />}
                    <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none" />
                </div>

                {boxes.length > 0 && (
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Regions</h4>
                            <div className="flex gap-4">
                                <button onClick={() => setSelectedBoxIds(new Set(boxes.map(b => b.id)))} className="text-[10px] font-bold text-brand-cyan uppercase hover:underline">Select All</button>
                                <button onClick={() => setBoxes([])} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Clear All</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {boxes.map((box, index) => (
                                <div key={box.id} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${selectedBoxIds.has(box.id) ? 'bg-brand-cyan/10 border-brand-cyan/50' : 'bg-slate-900/40 border-slate-700'}`}>
                                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                                        <input type="checkbox" checked={selectedBoxIds.has(box.id)} onChange={() => setSelectedBoxIds(prev => { const n = new Set(prev); n.has(box.id) ? n.delete(box.id) : n.add(box.id); return n; })} className="w-3 h-3 rounded bg-slate-700 border-slate-600 text-brand-cyan focus:ring-brand-cyan" />
                                        <span className="text-[11px] font-bold text-slate-300">ROI {index + 1}</span>
                                    </label>
                                    <button onClick={() => setBoxes(prev => prev.filter(b => b.id !== box.id))} className="text-slate-500 hover:text-white">&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
