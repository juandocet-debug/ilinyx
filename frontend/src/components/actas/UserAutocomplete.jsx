/* eslint-disable */
// components/actas/UserAutocomplete.jsx
// Input con búsqueda debounced de usuarios de AGON vía proxy ILINYX.

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { searchUsers } from '../../services/api';

const ROLE_ES = {
    ADMIN: 'Administrador', TEACHER: 'Docente',
    STUDENT: 'Estudiante', COORDINATOR: 'Coordinador',
};

export default function UserAutocomplete({ value, onSelect, onChangeName, placeholder = 'Buscar nombre o cédula...' }) {
    const [q, setQ] = useState(value || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Búsqueda debounced
    useEffect(() => {
        if (q.length < 2 || q === 'N/A') { setResults([]); setOpen(false); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const { data } = await searchUsers(q);
                const list = Array.isArray(data) ? data : (data.results || []);
                setResults(list);
                setOpen(list.length > 0);
            } catch {
                setResults([]); setOpen(false);
            } finally {
                setLoading(false);
            }
        }, 350);
        return () => clearTimeout(t);
    }, [q]);

    const handleSelect = (user) => {
        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
        setQ(name); setOpen(false);
        onSelect(user, name);
    };

    return (
        <div className="relative" ref={wrapRef}>
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                    value={q}
                    onChange={e => { setQ(e.target.value); onChangeName?.(e.target.value); }}
                    placeholder={placeholder}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500 transition-all"
                />
                {loading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ilinyx-400 animate-spin" />}
            </div>
            <AnimatePresence>
                {open && results.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute z-50 mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                        {results.slice(0, 6).map(user => {
                            const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                            const rolEs = ROLE_ES[user.role] || user.role || '';
                            return (
                                <button key={user.id} onClick={() => handleSelect(user)}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-ilinyx-50 transition-colors text-left border-b border-slate-50 last:border-0">
                                    {user.photo
                                        ? <img src={user.photo} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-white shadow" />
                                        : <div className="w-9 h-9 rounded-full bg-ilinyx-100 flex items-center justify-center text-ilinyx-600 font-bold text-xs flex-shrink-0">
                                            {(user.first_name?.[0] || '?')}{(user.last_name?.[0] || '')}
                                        </div>
                                    }
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{name || user.username}</p>
                                        {rolEs && <p className="text-xs text-ilinyx-500 font-medium">{rolEs}</p>}
                                    </div>
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
