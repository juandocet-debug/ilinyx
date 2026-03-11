/* eslint-disable */
// pages/entornos/EntornoDetalle.jsx — Vista detalle de un Entorno: Config + Seguimiento.

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Loader2, BookOpen, Users2, Calendar, Pencil, Trash2, Settings, BarChart3 } from 'lucide-react';
import { useEntornos } from '../../hooks/useEntornos';
import CortePanel from '../../components/entornos/CortePanel';
import SeguimientoPanel from '../../components/entornos/SeguimientoPanel';

const CORTE_NAMES = ['Primer Corte', 'Segundo Corte', 'Tercer Corte', 'Cuarto Corte', 'Quinto Corte'];
const fmtDate = d => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function EntornoDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { entornos, loading, saveCorte, saveEntregable, toggleEntregable, removeCorte, removeEntregable, removeEntorno } = useEntornos();

    const entorno = entornos.find(e => String(e.id) === String(id));

    const [activeTab, setActiveTab] = useState('configuracion');
    const [addingCorte, setAddingCorte] = useState(false);
    const [corteForm, setCorteForm] = useState({ nombre: '', porcentaje: '' });
    const [savingCorte, setSavingCorte] = useState(false);

    const handleAddCorte = async () => {
        if (!corteForm.nombre.trim()) return;
        setSavingCorte(true);
        const numero = (entorno?.cortes?.length || 0) + 1;
        await saveCorte(Number(id), { ...corteForm, numero, porcentaje: corteForm.porcentaje || 33.33 });
        setAddingCorte(false);
        setCorteForm({ nombre: '', porcentaje: '' });
        setSavingCorte(false);
    };

    const handleEditCorte = async (corteId, data) => {
        await saveCorte(Number(id), data, corteId);
    };

    const handleDeleteCorte = async (corteId) => {
        await removeCorte(corteId, Number(id));
    };

    const handleAddEntregable = async (corteId, data) => {
        await saveEntregable(corteId, Number(id), data);
    };

    const handleToggle = async (entregableId, activo) => {
        await toggleEntregable(entregableId, activo, Number(id));
    };

    const handleDeleteEntregable = async (entregableId) => {
        await removeEntregable(entregableId, Number(id));
    };

    const handleDeleteEntorno = async () => {
        if (window.confirm(`¿Eliminar "${entorno?.nombre}" y todo su contenido? Esta acción no se puede deshacer.`)) {
            await removeEntorno(Number(id));
            navigate('/entornos');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <Loader2 className="h-9 w-9 text-ilinyx-500 animate-spin" />
        </div>
    );

    if (!entorno) return (
        <div className="text-center py-24 text-slate-400">
            <p className="font-semibold text-lg">Entorno no encontrado</p>
            <button onClick={() => navigate('/entornos')} className="mt-4 text-ilinyx-600 hover:underline text-sm">
                ← Volver
            </button>
        </div>
    );

    const grupos = entorno.grupos_nombres || [];
    const nextCorteNum = (entorno.cortes?.length || 0) + 1;
    const suggestedName = CORTE_NAMES[nextCorteNum - 1] || `Corte ${nextCorteNum}`;
    const totalPct = (entorno.cortes || []).reduce((a, c) => a + Number(c.porcentaje), 0);
    const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all';

    return (
        <div className="space-y-5 pb-10 max-w-5xl mx-auto">
            {/* ── Encabezado compacto ─────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/entornos')}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${entorno.color}18`, border: `1.5px solid ${entorno.color}40` }}>
                    <BookOpen className="h-5 w-5" style={{ color: entorno.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-slate-800 leading-tight truncate">{entorno.nombre}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${entorno.color}15`, color: entorno.color }}>
                            {entorno.semestre}
                        </span>
                        <span className="text-[11px] text-slate-400">
                            {grupos.length} grupo{grupos.length !== 1 ? 's' : ''} · {fmtDate(entorno.fecha_inicio)} → {fmtDate(entorno.fecha_fin)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => navigate(`/entornos/${id}/editar`)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors" title="Editar entorno">
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={handleDeleteEntorno}
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar entorno">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ── Info compacta en una fila ─────────────────────────── */}
            {(entorno.descripcion || entorno.objetivos) && (
                <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {entorno.descripcion && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Descripción</p>
                                <p className="text-sm text-slate-600 line-clamp-2">{entorno.descripcion}</p>
                            </div>
                        )}
                        {entorno.objetivos && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Objetivos</p>
                                <p className="text-sm text-slate-600 line-clamp-2">{entorno.objetivos}</p>
                            </div>
                        )}
                    </div>
                    {/* Grupos como pills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {(grupos.length ? grupos : (entorno.grupos_agon_ids || []).map(i => `Grupo ${i}`)).map((g, i) => (
                            <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: `${entorno.color}10`, color: entorno.color }}>
                                {g}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Tabs ───────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button onClick={() => setActiveTab('configuracion')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'configuracion' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Settings className="h-4 w-4" /> Configuración
                </button>
                <button onClick={() => setActiveTab('seguimiento')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'seguimiento' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <BarChart3 className="h-4 w-4" /> Seguimiento
                </button>
            </div>

            {/* ── Tab: Configuración ────────────────────────────────── */}
            {activeTab === 'configuracion' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-700 text-sm">Cortes de Evaluación</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {(entorno.cortes || []).length} corte{(entorno.cortes || []).length !== 1 ? 's' : ''} · suma: <strong className={totalPct === 100 ? 'text-emerald-600' : 'text-amber-600'}>{totalPct}%</strong>
                            </p>
                        </div>
                    </div>

                    {(entorno.cortes || []).length === 0 && !addingCorte && (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-500 text-sm font-medium">Sin cortes configurados</p>
                            <p className="text-xs text-slate-400 mt-1 mb-3">Agrega "{suggestedName}" para empezar a organizar tu semestre</p>
                            <button onClick={() => { setCorteForm({ nombre: suggestedName, porcentaje: '33' }); setAddingCorte(true); }}
                                className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow-sm"
                                style={{ backgroundColor: entorno.color }}>
                                <Plus className="h-4 w-4" /> Crear {suggestedName}
                            </button>
                        </div>
                    )}

                    {(entorno.cortes || []).map(corte => (
                        <CortePanel key={corte.id} corte={corte} entorno={entorno}
                            onAddEntregable={handleAddEntregable}
                            onToggleEntregable={handleToggle}
                            onDeleteCorte={handleDeleteCorte}
                            onDeleteEntregable={handleDeleteEntregable}
                            onEditCorte={handleEditCorte} />
                    ))}

                    {/* Formulario compacto nuevo corte */}
                    {addingCorte && (
                        <div className="rounded-xl border p-4 space-y-3 bg-slate-50/50" style={{ borderColor: `${entorno.color}30` }}>
                            <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Nuevo corte</p>
                            <div className="flex gap-3 items-end">
                                <div className="flex-1">
                                    <input value={corteForm.nombre} onChange={e => setCorteForm(f => ({ ...f, nombre: e.target.value }))}
                                        placeholder={suggestedName} className={inputCls}
                                        style={{ '--tw-ring-color': `${entorno.color}40` }} autoFocus />
                                </div>
                                <div className="w-24">
                                    <input type="number" min="1" max="100" value={corteForm.porcentaje}
                                        onChange={e => setCorteForm(f => ({ ...f, porcentaje: e.target.value }))}
                                        placeholder="%" className={inputCls} />
                                </div>
                                <button onClick={handleAddCorte} disabled={savingCorte}
                                    className="inline-flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60 flex-shrink-0"
                                    style={{ backgroundColor: entorno.color }}>
                                    {savingCorte ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Crear
                                </button>
                                <button onClick={() => setAddingCorte(false)}
                                    className="px-3 py-2 rounded-lg text-slate-500 bg-slate-100 hover:bg-slate-200 text-sm">
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {!addingCorte && (entorno.cortes || []).length > 0 && (
                        <button onClick={() => { setCorteForm({ nombre: suggestedName, porcentaje: '' }); setAddingCorte(true); }}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-dashed transition-all hover:opacity-80"
                            style={{ borderColor: `${entorno.color}40`, color: entorno.color }}>
                            <Plus className="h-3.5 w-3.5" /> Agregar {suggestedName}
                        </button>
                    )}
                </div>
            )}

            {/* ── Tab: Seguimiento ──────────────────────────────────── */}
            {activeTab === 'seguimiento' && (
                <SeguimientoPanel entornoId={entorno.id} entornoColor={entorno.color} />
            )}
        </div>
    );
}
