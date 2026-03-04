/* eslint-disable */
// components/ui/Toast.jsx
// Hook + contenedor de notificaciones toast reutilizable en toda la app.

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: '✓', iconBg: 'bg-emerald-500' },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '✕', iconBg: 'bg-red-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: '!', iconBg: 'bg-amber-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'i', iconBg: 'bg-blue-500' },
};

export function useToast() {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);
    return { toasts, addToast };
}

export default function ToastContainer({ toasts }) {
    if (!toasts.length) return null;
    return (
        <div className="fixed top-5 right-5 z-[100] space-y-2 max-w-sm">
            <AnimatePresence>
                {toasts.map(t => {
                    const c = COLORS[t.type] || COLORS.info;
                    return (
                        <motion.div key={t.id}
                            initial={{ opacity: 0, x: 60, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.95 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${c.bg} ${c.border}`}>
                            <span className={`w-6 h-6 rounded-full ${c.iconBg} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                                {c.icon}
                            </span>
                            <p className={`text-sm font-semibold ${c.text}`}>{t.message}</p>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
