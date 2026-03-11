/* eslint-disable */
// pages/entornos/EntornoDetalle.jsx — Vista detalle de un Entorno con cortes y entregables.

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Loader2, BookOpen, Users2, Calendar, Pencil } from 'lucide-react';
import { useEntornos } from '../../hooks/useEntornos';
import CortePanel from '../../components/entornos/CortePanel';
import SeguimientoPanel from '../../components/entornos/SeguimientoPanel';

const fmtDate = d => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function EntornoDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { entornos, loading, saveCorte, saveEntregable, toggleEntregable } = useEntornos();

    const entorno = entornos.find(e => String(e.id) === String(id));

    // Tabs
    const [activeTab, setActiveTab] = useState('configuracion');

    // Formulario rápido de nuevo corte
    const [addingCorte, setAddingCorte] = useState(false);
    const [corteForm, setCorteForm] = useState({ nombre: '', numero: '', porcentaje: '', fecha_inicio: '', fecha_fin: '' });
    const [savingCorte, setSavingCorte] = useState(false);

    const handleAddCorte = async () => {
        if (!corteForm.nombre.trim()) return;
        setSavingCorte(true);
        await saveCorte(Number(id), { ...corteForm, numero: corteForm.numero || ((entorno?.cortes?.length || 0) + 1) });
        setAddingCorte(false);
        setCorteForm({ nombre: '', numero: '', porcentaje: '', fecha_inicio: '', fecha_fin: '' });
        setSavingCorte(false);
    };

    const handleAddEntregable = async (corteId, data) => {
        await saveEntregable(corteId, Number(id), data);
    };

    const handleToggle = async (entregableId, activo) => {
        await toggleEntregable(entregableId, activo, Number(id));
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <Loader2 className="h-9 w-9 text-ilinyx-500 animate-spin" />
        </div>
    );

    if (!entorno) return (
        <div className="text-center py-24 text-slate-400">
            <p className="font-semibold text-lg">Entorno no encontrado</p>
            <button onClick={() => navigate('/evaluaciones')} className="mt-4 text-ilinyx-600 hover:underline text-sm">
                ← Volver
            </button>
        </div>
    );

    const grupos   = entorno.grupos_nombres || [];
    const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all';

    return (
        <div className="space-y-6 pb-10">
            {/* ── Encabezado ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/evaluaciones')}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${entorno.color}18`, border: `1.5px solid ${entorno.color}40` }}>
                            <BookOpen className="h-5 w-5" style={{ color: entorno.color }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 leading-tight">{entorno.nombre}</h1>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${entorno.color}15`, color: entorno.color }}>
                                {entorno.semestre}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={() => navigate(`/entornos/${id}/editar`)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                    <Pencil className="h-4 w-4" />
                </button>
            </div>

            {/* ── Info card ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Grupos */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Users2 className="h-3.5 w-3.5" /> Grupos ({grupos.length || entorno.grupos_agon_ids?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {(grupos.length ? grupos : entorno.grupos_agon_ids?.map(id => `Grupo ${id}`) || []).map((g, i) => (
                            <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-lg"
                                style={{ backgroundColor: `${entorno.color}15`, color: entorno.color }}>
                                {g}
                            </span>
                        ))}
                    </div>
                </div>
                {/* Fechas */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Período
                    </p>
                    <p className="text-sm font-semibold text-slate-700">{fmtDate(entorno.fecha_inicio)}</p>
                    <p className="text-xs text-slate-400">hasta {fmtDate(entorno.fecha_fin)}</p>
                </div>
                {/* Objetivos */}
                {entorno.objetivos && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm sm:col-span-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Objetivos</p>
                        <p className="text-sm text-slate-600 line-clamp-3">{entorno.objetivos}</p>
                    </div>
                )}
            </div>

            {/* ── Tabs: Navegación interna ──────────────────────────────── */}
            <div className="flex gap-2 border-b border-slate-200 mt-8 mb-4">
                <button 
                    onClick={() => setActiveTab('configuracion')}
                    className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 ${
                        activeTab === 'configuracion' 
                            ? 'text-slate-800' 
                            : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
                    }`}
                    style={{ borderBottomColor: activeTab === 'configuracion' ? entorno.color : '' }}>
                    Configuración Académica
                </button>
                <button 
                    onClick={() => setActiveTab('seguimiento')}
                    className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 ${
                        activeTab === 'seguimiento' 
                            ? 'text-slate-800' 
                            : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
                    }`}
                    style={{ borderBottomColor: activeTab === 'seguimiento' ? entorno.color : '' }}>
                    Panel de Seguimiento
                </button>
            </div>

            {/* ── Contenido según el tab ─────────────────────────────────── */}
            {activeTab === 'configuracion' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-slate-700 flex items-center gap-2">
                            Cortes de Evaluación
                            <span className="text-xs font-normal text-slate-400">
                                suma de porcentajes: {(entorno.cortes || []).reduce((a, c) => a + Number(c.porcentaje), 0)}%
                            </span>
                        </h2>
                    </div>

                    {(entorno.cortes || []).length === 0 && !addingCorte && (
                        <p className="text-slate-400 text-sm text-center py-8">Sin cortes. Agrega el primero para configurar tu semestre.</p>
                    )}

                    {(entorno.cortes || []).map(corte => (
                        <CortePanel key={corte.id} corte={corte} entorno={entorno}
                            onAddEntregable={handleAddEntregable}
                            onToggleEntregable={handleToggle} />
                    ))}

                    {/* Formulario inline nuevo corte */}
                    {addingCorte && (
                        <div className="rounded-2xl border-2 border-dashed p-5 space-y-3"
                            style={{ borderColor: `${entorno.color}40`, backgroundColor: `${entorno.color}04` }}>
                            <p className="font-semibold text-slate-700 text-sm">Nuevo corte</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input value={corteForm.nombre} onChange={e => setCorteForm(f => ({ ...f, nombre: e.target.value }))}
                                    placeholder="Nombre (ej. Primer Corte) *" className={inputCls} autoFocus />
                                <input type="number" min="1" max="100" value={corteForm.porcentaje}
                                    onChange={e => setCorteForm(f => ({ ...f, porcentaje: e.target.value }))}
                                    placeholder="% nota final" className={inputCls} />
                                <input type="number" min="1" value={corteForm.numero}
                                    onChange={e => setCorteForm(f => ({ ...f, numero: e.target.value }))}
                                    placeholder={`Número (auto: ${(entorno.cortes?.length || 0) + 1})`} className={inputCls} />
                                <input type="date" value={corteForm.fecha_inicio} onChange={e => setCorteForm(f => ({ ...f, fecha_inicio: e.target.value }))} className={inputCls} />
                                <input type="date" value={corteForm.fecha_fin} onChange={e => setCorteForm(f => ({ ...f, fecha_fin: e.target.value }))} className={inputCls} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleAddCorte} disabled={savingCorte}
                                    className="flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
                                    style={{ backgroundColor: entorno.color }}>
                                    {savingCorte ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Guardar Corte
                                </button>
                                <button onClick={() => setAddingCorte(false)}
                                    className="px-5 py-2.5 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 text-sm">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {!addingCorte && (
                        <button onClick={() => setAddingCorte(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border-2 border-dashed transition-all hover:opacity-80 mt-2"
                            style={{ borderColor: `${entorno.color}50`, color: entorno.color, backgroundColor: `${entorno.color}04` }}>
                            <Plus className="h-4 w-4" /> Agregar corte
                        </button>
                    )}
                </div>
            )}

            {activeTab === 'seguimiento' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <SeguimientoPanel entornoId={entorno.id} entornoColor={entorno.color} />
                </div>
            )}
        </div>
    );
}
