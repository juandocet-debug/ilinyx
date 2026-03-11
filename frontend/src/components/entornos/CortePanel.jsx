/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Zap, FileText, Hash, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';
import EntregableCard from './EntregableCard';
import api from '../../services/api';

const CORTE_NAMES = ['Primer Corte', 'Segundo Corte', 'Tercer Corte', 'Cuarto Corte', 'Quinto Corte'];

export default function CortePanel({ corte, entorno, onAddEntregable, onToggleEntregable, onDeleteCorte, onDeleteEntregable, onEditCorte }) {
    const [open, setOpen] = useState(true);
    const [adding, setAdding] = useState(false);
    const [rubricas, setRubricas] = useState([]);
    const [form, setForm] = useState({ nombre: '', tipo: 'rubrica', rubrica: '', peso: 100, fecha_entrega: '' });
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ nombre: corte.nombre, porcentaje: corte.porcentaje });

    // Cargar rúbricas existentes cuando se abre el formulario
    useEffect(() => {
        if (adding) {
            api.get('/evaluaciones/rubricas/')
                .then(r => setRubricas(Array.isArray(r.data) ? r.data : (r.data?.results || [])))
                .catch(() => setRubricas([]));
        }
    }, [adding]);

    const handleAdd = async () => {
        if (!form.nombre.trim()) return;
        setSaving(true);
        await onAddEntregable(corte.id, { ...form, rubrica: form.rubrica || null });
        setAdding(false);
        setForm({ nombre: '', tipo: 'rubrica', rubrica: '', peso: 100, fecha_entrega: '' });
        setSaving(false);
    };

    const handleEditSave = async () => {
        if (!editForm.nombre.trim()) return;
        await onEditCorte(corte.id, editForm);
        setEditing(false);
    };

    const activeCount = (corte.entregables || []).filter(e => e.activo).length;
    const totalCount = (corte.entregables || []).length;

    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                <button onClick={() => setOpen(o => !o)} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: entorno.color }}>
                        {corte.numero}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        {editing ? (
                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <input value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                                    className="text-sm font-bold border-b border-slate-300 focus:border-ilinyx-500 outline-none bg-transparent px-1 py-0.5 w-36" autoFocus />
                                <input type="number" min="1" max="100" value={editForm.porcentaje}
                                    onChange={e => setEditForm(f => ({ ...f, porcentaje: e.target.value }))}
                                    className="w-16 text-xs border-b border-slate-300 focus:border-ilinyx-500 outline-none bg-transparent px-1 py-0.5" />
                                <span className="text-xs text-slate-400">%</span>
                                <button onClick={handleEditSave} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">✓</button>
                                <button onClick={() => setEditing(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded"><X className="h-3 w-3" /></button>
                            </div>
                        ) : (
                            <>
                                <p className="font-bold text-slate-800 text-sm truncate">{corte.nombre}</p>
                                <p className="text-[11px] text-slate-400">{corte.porcentaje}% · {activeCount}/{totalCount} activos</p>
                            </>
                        )}
                    </div>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setEditing(true); setEditForm({ nombre: corte.nombre, porcentaje: corte.porcentaje }); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-ilinyx-600 hover:bg-ilinyx-50 transition-colors" title="Editar corte">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (window.confirm(`¿Eliminar "${corte.nombre}" y todos sus entregables?`)) onDeleteCorte(corte.id); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Eliminar corte">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {open ? <ChevronUp className="h-4 w-4 text-slate-300" /> : <ChevronDown className="h-4 w-4 text-slate-300" />}
                </div>
            </div>

            {open && (
                <div className="px-4 pb-4 space-y-2 border-t border-slate-50 pt-3">
                    {totalCount === 0 && !adding && (
                        <p className="text-slate-400 text-xs text-center py-4">Sin entregables. Agrega el primero.</p>
                    )}
                    {(corte.entregables || []).map(e => (
                        <EntregableCard key={e.id} entregable={e} color={entorno.color}
                            onToggle={() => onToggleEntregable(e.id, e.activo)}
                            onDelete={() => onDeleteEntregable(e.id)} />
                    ))}

                    {/* Formulario compacto nuevo entregable */}
                    {adding && (
                        <div className="rounded-xl border p-3 space-y-3 mt-1 bg-slate-50/50" style={{ borderColor: `${entorno.color}30` }}>
                            <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                placeholder="Nombre del entregable *"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
                                style={{ '--tw-ring-color': `${entorno.color}40` }} autoFocus />
                            
                            <div className="flex gap-2 items-center">
                                {/* Tipo toggle */}
                                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                                    {[{ v: 'rubrica', icon: Hash, l: 'Rúbrica' }, { v: 'manual', icon: FileText, l: 'Manual' }].map(t => (
                                        <button key={t.v} onClick={() => setForm(f => ({ ...f, tipo: t.v, rubrica: '' }))}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                                                form.tipo === t.v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                                            <t.icon className="h-3 w-3" /> {t.l}
                                        </button>
                                    ))}
                                </div>
                                <input type="number" min="1" max="100" value={form.peso}
                                    onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                                    className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                                    placeholder="Peso %" />
                                <input type="date" value={form.fecha_entrega}
                                    onChange={e => setForm(f => ({ ...f, fecha_entrega: e.target.value }))}
                                    className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white" />
                            </div>

                            {/* Selector de rúbrica existente */}
                            {form.tipo === 'rubrica' && (
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Vincular rúbrica existente</label>
                                    {rubricas.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">No hay rúbricas creadas aún</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                            {rubricas.map(r => (
                                                <button key={r.id} onClick={() => setForm(f => ({ ...f, rubrica: f.rubrica === r.id ? '' : r.id }))}
                                                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                                                        form.rubrica === r.id 
                                                            ? 'text-white shadow-sm' 
                                                            : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'}`}
                                                    style={form.rubrica === r.id ? { backgroundColor: entorno.color, borderColor: entorno.color } : {}}>
                                                    {r.titulo}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button onClick={handleAdd} disabled={saving}
                                    className="flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold py-2 rounded-lg text-xs transition-all disabled:opacity-60"
                                    style={{ backgroundColor: entorno.color }}>
                                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                                    Agregar
                                </button>
                                <button onClick={() => setAdding(false)}
                                    className="px-4 py-2 rounded-lg text-slate-500 bg-slate-100 hover:bg-slate-200 text-xs font-medium">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {!adding && (
                        <button onClick={() => setAdding(true)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold border border-dashed transition-all hover:opacity-80"
                            style={{ borderColor: `${entorno.color}40`, color: entorno.color }}>
                            <Plus className="h-3 w-3" /> Agregar entregable
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
