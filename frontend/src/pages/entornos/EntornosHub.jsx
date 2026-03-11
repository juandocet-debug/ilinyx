/* eslint-disable */
// pages/entornos/EntornosHub.jsx
// Hub principal de evaluaciones: pestaña Entornos (nuevo) + pestaña Evaluaciones legacy.

import React, { useState } from 'react';
import { Plus, LayoutGrid, ClipboardList, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEntornos } from '../../hooks/useEntornos';
import EntornoCard from '../../components/entornos/EntornoCard';

// ── Legacy tab lazy import ────────────────────────────────────────────────────
const EvaluacionesLegacy = React.lazy(() => import('../evaluaciones/Evaluaciones'));

export default function EntornosHub() {
    const navigate = useNavigate();
    const { entornos, loading, error } = useEntornos();
    const [tab, setTab] = useState('entornos');

    const TABS = [
        { key: 'entornos',   icon: LayoutGrid,    label: 'Entornos' },
        { key: 'evaluaciones', icon: ClipboardList, label: 'Evaluaciones' },
    ];

    return (
        <div className="space-y-6">
            {/* ── Cabecera ──────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-slate-800">Evaluaciones</h1>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                            <Sparkles className="h-3 w-3" /> BETA
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm">Gestiona rúbricas, entornos de evaluación y calificaciones</p>
                </div>
                {tab === 'entornos' && (
                    <button onClick={() => navigate('/entornos/nuevo')}
                        className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95">
                        <Plus className="h-4 w-4" /> Nuevo Entorno
                    </button>
                )}
            </div>

            {/* ── Tabs ──────────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {TABS.map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all
                            ${tab === key ? 'bg-white text-ilinyx-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Icon className="h-4 w-4" /> {label}
                        {key === 'entornos' && entornos.length > 0 && (
                            <span className="ml-1 bg-ilinyx-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {entornos.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab: Entornos ─────────────────────────────────────────── */}
            {tab === 'entornos' && (
                <>
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 text-ilinyx-500 animate-spin" />
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-16 text-red-400">
                            <p>{error}</p>
                        </div>
                    )}
                    {!loading && !error && entornos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shadow-inner">
                                <LayoutGrid className="h-9 w-9 text-indigo-400" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-600 text-lg">Sin entornos todavía</p>
                                <p className="text-sm mt-1 max-w-xs">
                                    Crea un entorno para agrupar los grupos de una materia y organizar cortes y entregables
                                </p>
                            </div>
                            <button onClick={() => navigate('/entornos/nuevo')}
                                className="inline-flex items-center gap-2 bg-ilinyx-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md text-sm hover:bg-ilinyx-800 transition-all">
                                <Plus className="h-4 w-4" /> Crear primer Entorno
                            </button>
                        </div>
                    )}
                    {!loading && entornos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {entornos.map(e => (
                                <EntornoCard key={e.id} entorno={e}
                                    onClick={() => navigate(`/entornos/${e.id}`)} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── Tab: Evaluaciones Legacy ──────────────────────────────── */}
            {tab === 'evaluaciones' && (
                <React.Suspense fallback={
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-7 w-7 text-ilinyx-500 animate-spin" />
                    </div>
                }>
                    <EvaluacionesLegacy />
                </React.Suspense>
            )}
        </div>
    );
}
