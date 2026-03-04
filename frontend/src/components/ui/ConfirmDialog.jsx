/* eslint-disable */
// components/ui/ConfirmDialog.jsx
// Reemplazo de confirm() nativo — modal de confirmación con opción destructiva.

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export function useConfirm() {
    const [dlg, setDlg] = React.useState({ open: false });
    const show = (title, message, onConfirm, danger = false) =>
        setDlg({ open: true, title, message, danger, onConfirm });
    const close = () => setDlg(d => ({ ...d, open: false }));
    return { dlg, show, close };
}

export default function ConfirmDialog({
    open, title, message,
    confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
    onConfirm, onCancel, danger = false,
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-6 text-center space-y-3">
                    <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
                        <AlertTriangle className={`h-7 w-7 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{message}</p>
                </div>
                <div className="flex border-t border-slate-100">
                    <button onClick={onCancel} className="flex-1 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm}
                        className={`flex-1 py-3.5 text-sm font-bold border-l border-slate-100 transition-colors ${danger ? 'text-red-600 hover:bg-red-50' : 'text-ilinyx-700 hover:bg-ilinyx-50'}`}>
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
