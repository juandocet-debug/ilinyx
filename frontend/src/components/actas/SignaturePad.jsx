/* eslint-disable */
// components/actas/SignaturePad.jsx
// Modal para dibujar o subir firma — usado al firmar un acta desde "Mis Actas".

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, PenLine } from 'lucide-react';

export default function SignaturePad({ open, onClose, onConfirm, userName }) {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [signatureUrl, setSignatureUrl] = useState(null);

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches?.[0];
        return { x: (touch?.clientX || e.clientX) - rect.left, y: (touch?.clientY || e.clientY) - rect.top };
    };
    const startDraw = (e) => { e.preventDefault(); setDrawing(true); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const draw = (e) => { if (!drawing) return; e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke(); setHasDrawn(true); };
    const stopDraw = () => setDrawing(false);
    const clearCanvas = () => { canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); setHasDrawn(false); setSignatureUrl(null); };

    const handleFile = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { setSignatureUrl(ev.target.result); setHasDrawn(false); };
        reader.readAsDataURL(file);
    };

    const handleConfirm = () => {
        onConfirm(signatureUrl || (hasDrawn && canvasRef.current ? canvasRef.current.toDataURL('image/png') : userName));
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Firmar Acta</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-500">Dibuja tu firma o sube una imagen</p>
                    {!signatureUrl ? (
                        <div className="relative">
                            <canvas ref={canvasRef} width={360} height={150}
                                className="w-full border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-crosshair touch-none"
                                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                            {!hasDrawn && <p className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm pointer-events-none">Dibuja aquí con el dedo o mouse</p>}
                        </div>
                    ) : (
                        <div className="border-2 border-slate-200 rounded-xl p-3 bg-slate-50 text-center">
                            <img src={signatureUrl} alt="Firma" className="max-h-[150px] mx-auto" />
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <button onClick={clearCanvas} className="text-xs text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100">Limpiar</button>
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-ilinyx-600 hover:text-ilinyx-800 px-3 py-1.5 rounded-lg hover:bg-ilinyx-50 cursor-pointer">
                            <Upload className="h-3.5 w-3.5" /> Subir imagen
                            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                    <button onClick={handleConfirm} disabled={!hasDrawn && !signatureUrl}
                        className="px-5 py-2 text-sm font-bold bg-ilinyx-700 text-white rounded-xl hover:bg-ilinyx-800 shadow disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                        <PenLine className="h-4 w-4 inline mr-1.5" /> Confirmar firma
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
