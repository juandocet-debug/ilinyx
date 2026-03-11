import React, { useState } from 'react';
import { Plus, Zap, FileText, Hash, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import EntregableCard from './EntregableCard';

export default function CortePanel({ corte, entorno, onAddEntregable, onToggleEntregable }) {
    const [open, setOpen]   = useState(true);
    const [adding, setAdding] = useState(false);
    const [form, setForm]   = useState({ nombre: '', tipo: 'rubrica', rubrica: '', peso: 100, fecha_entrega: '', descripcion: '' });
    const [saving, setSaving] = useState(false);

    const pct = corte.entries?.length > 0
        ? Math.round((corte.entregables?.filter(e => e.activo).length / corte.entregables.length) * 100) : 0;

    const handleAdd = async () => {
        if (!form.nombre.trim()) return;
        setSaving(true);
        await onAddEntregable(corte.id, { ...form, rubrica: form.rubrica || null });
        setAdding(false);
        setForm({ nombre: '', tipo: 'rubrica', rubrica: '', peso: 100, fecha_entrega: '', descripcion: '' });
        setSaving(false);
    };

    const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all';
    const inputStyle = { '--tw-ring-color': entorno.color };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                {/* Número */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: entorno.color }}>
                    {corte.numero}
                </div>
                <div className="flex-1 text-left">
                    <p className="font-bold text-slate-800 text-sm">{corte.nombre}</p>
                    <p className="text-xs text-slate-400">Peso: <strong>{corte.porcentaje}%</strong> de la nota final</p>
                </div>
                {/* Mini barra */}
                <div className="hidden sm:flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: entorno.color }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: entorno.color }}>{corte.entregables?.length || 0} items</span>
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {open && (
                <div className="px-5 pb-5 space-y-3 border-t border-slate-50">
                    {/* Entregables */}
                    {(corte.entregables || []).length === 0 && !adding && (
                        <p className="text-slate-400 text-sm text-center py-6">Sin entregables aún</p>
                    )}
                    {(corte.entregables || []).map(e => (
                        <EntregableCard key={e.id} entregable={e} color={entorno.color}
                            onToggle={() => onToggleEntregable(e.id, e.activo)} />
                    ))}

                    {/* Formulario inline de nuevo entregable */}
                    {adding && (
                        <div className="rounded-xl border-2 border-dashed p-4 space-y-3 mt-2"
                            style={{ borderColor: `${entorno.color}40`, backgroundColor: `${entorno.color}04` }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="sm:col-span-2">
                                    <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                        placeholder="Nombre del entregable *" className={inputCls} style={inputStyle} autoFocus />
                                </div>
                                {/* Tipo */}
                                <div className="flex gap-2">
                                    {[{ v: 'rubrica', icon: Hash, label: 'Rúbrica' }, { v: 'manual', icon: FileText, label: 'Manual' }].map(t => (
                                        <button key={t.v} onClick={() => setForm(f => ({ ...f, tipo: t.v }))}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all"
                                            style={form.tipo === t.v
                                                ? { backgroundColor: entorno.color, borderColor: entorno.color, color: '#fff' }
                                                : { backgroundColor: 'transparent', borderColor: '#e2e8f0', color: '#64748b' }}>
                                            <t.icon className="h-3.5 w-3.5" /> {t.label}
                                        </button>
                                    ))}
                                </div>
                                <div><input type="number" min="1" max="100" value={form.peso}
                                    onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                                    placeholder="Peso %" className={inputCls} /></div>
                                <div><input type="date" value={form.fecha_entrega}
                                    onChange={e => setForm(f => ({ ...f, fecha_entrega: e.target.value }))} className={inputCls} /></div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleAdd} disabled={saving}
                                    className="flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold py-2 rounded-xl text-sm transition-all disabled:opacity-60"
                                    style={{ backgroundColor: entorno.color }}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                    Agregar
                                </button>
                                <button onClick={() => setAdding(false)}
                                    className="px-4 py-2 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 text-sm">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {!adding && (
                        <button onClick={() => setAdding(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border-2 border-dashed transition-all hover:opacity-80"
                            style={{ borderColor: `${entorno.color}50`, color: entorno.color, backgroundColor: `${entorno.color}06` }}>
                            <Plus className="h-3.5 w-3.5" /> Agregar entregable
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
