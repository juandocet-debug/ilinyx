/* eslint-disable */
// pages/entornos/EntornoForm.jsx — Wizard de 3 pasos para crear/editar entornos.

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useEntornos } from '../../hooks/useEntornos';
import api from '../../services/api';

const COLORES = [
    { v: '#6366f1', l: 'Índigo' }, { v: '#8b5cf6', l: 'Violeta' },
    { v: '#ec4899', l: 'Rosa' },   { v: '#f59e0b', l: 'Ámbar' },
    { v: '#10b981', l: 'Esmeralda' }, { v: '#3b82f6', l: 'Azul' },
    { v: '#ef4444', l: 'Rojo' },   { v: '#14b8a6', l: 'Teal' },
    { v: '#f97316', l: 'Naranja' },{ v: '#84cc16', l: 'Lima' },
];

const STEPS = ['Información', 'Grupos', 'Revisar'];

const inp = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500 transition-all';
const lbl = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide';

export default function EntornoForm() {
    const navigate    = useNavigate();
    const { id }      = useParams();
    const isEdit      = !!id;
    const { entornos, saveEntorno } = useEntornos();

    const [step, setStep]   = useState(0);
    const [saving, setSaving] = useState(false);
    const [grupos, setGrupos] = useState([]);         // grupos AGON disponibles
    const [loadingGrupos, setLoadingGrupos] = useState(true);
    const [searchGrupo, setSearchGrupo] = useState(''); // Filtro de búsqueda

    const [form, setForm] = useState({
        nombre: '', semestre: '', descripcion: '', objetivos: '',
        fecha_inicio: '', fecha_fin: '', color: '#6366f1',
        grupos_agon_ids: [], grupos_nombres: [],
    });

    // Si es edición, cargar datos existentes
    useEffect(() => {
        if (isEdit) {
            const e = entornos.find(e => String(e.id) === String(id));
            if (e) setForm({
                nombre: e.nombre, semestre: e.semestre, descripcion: e.descripcion,
                objetivos: e.objetivos, fecha_inicio: e.fecha_inicio || '', fecha_fin: e.fecha_fin || '',
                color: e.color, grupos_agon_ids: e.grupos_agon_ids || [], grupos_nombres: e.grupos_nombres || [],
            });
        }
    }, [id, entornos, isEdit]);

    // Cargar grupos de AGON
    useEffect(() => {
        api.get('/actas/clases-agon/')
            .then(r => setGrupos(Array.isArray(r.data) ? r.data : []))
            .catch(() => setGrupos([]))
            .finally(() => setLoadingGrupos(false));
    }, []);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const toggleGrupo = (grupo) => {
        const alreadyIn = form.grupos_agon_ids.includes(grupo.id);
        if (alreadyIn) {
            set('grupos_agon_ids', form.grupos_agon_ids.filter(id => id !== grupo.id));
            set('grupos_nombres', form.grupos_nombres.filter(n => n !== grupo.name));
        } else {
            set('grupos_agon_ids', [...form.grupos_agon_ids, grupo.id]);
            set('grupos_nombres', [...form.grupos_nombres, grupo.name]);
        }
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) { setStep(0); return; }
        setSaving(true);
        try {
            await saveEntorno(form, isEdit ? Number(id) : null);
            navigate('/entornos');
        } catch { setSaving(false); }
    };

    const color = form.color;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/entornos')}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        {isEdit ? 'Editar Entorno' : 'Nuevo Entorno Académico'}
                    </h1>
                    <p className="text-slate-400 text-xs">Agrupa grupos de una materia para organizar evaluaciones</p>
                </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                        <button onClick={() => i < step && setStep(i)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all
                                ${step === i ? 'text-white shadow-md' : i < step ? 'text-white opacity-80' : 'bg-slate-100 text-slate-400'}`}
                            style={step >= i ? { backgroundColor: color } : {}}>
                            <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center bg-white/20 font-bold">
                                {i < step ? <Check className="h-3 w-3" /> : i + 1}
                            </span>
                            <span className="hidden sm:inline">{s}</span>
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 transition-all ${i < step ? 'opacity-60' : 'bg-slate-200'}`}
                                style={i < step ? { backgroundColor: color } : {}} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step 0 — Información */}
            {step === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className={lbl}>Nombre del espacio *</label>
                            <input value={form.nombre} onChange={e => set('nombre', e.target.value)}
                                placeholder="Ej: Didáctica I — 2025-II" className={inp} autoFocus />
                        </div>
                        <div>
                            <label className={lbl}>Semestre</label>
                            <input value={form.semestre} onChange={e => set('semestre', e.target.value)}
                                placeholder="2025-2" className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>Color identificador</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {COLORES.map(c => (
                                    <button key={c.v} onClick={() => set('color', c.v)} title={c.l}
                                        className="w-8 h-8 rounded-full border-4 transition-all shadow-sm hover:scale-110"
                                        style={{
                                            backgroundColor: c.v,
                                            borderColor: form.color === c.v ? '#1e293b' : 'transparent',
                                            transform: form.color === c.v ? 'scale(1.2)' : 'scale(1)',
                                        }} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={lbl}>Fecha inicio</label>
                            <input type="date" value={form.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)} className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>Fecha fin</label>
                            <input type="date" value={form.fecha_fin} onChange={e => set('fecha_fin', e.target.value)} className={inp} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={lbl}>Descripción</label>
                            <textarea rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} className={inp} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={lbl}>Objetivos de aprendizaje</label>
                            <textarea rows={3} value={form.objetivos} onChange={e => set('objetivos', e.target.value)}
                                placeholder="Al finalizar el semestre, el estudiante será capaz de..." className={inp} />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 1 — Grupos */}
            {step === 1 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">
                            Filtra y selecciona los grupos de AGON ({form.grupos_agon_ids.length} seleccionados)
                        </p>
                        <input 
                            type="text"
                            placeholder="Buscar grupo, profesor..."
                            value={searchGrupo}
                            onChange={(e) => setSearchGrupo(e.target.value)}
                            className="w-full sm:w-64 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 bg-slate-50 transition-all font-medium"
                            style={{ '--tw-ring-color': `${color}40`, borderColor: searchGrupo ? color : '#e2e8f0' }}
                        />
                    </div>
                    {loadingGrupos ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-7 w-7 text-ilinyx-500 animate-spin" />
                        </div>
                    ) : grupos.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-10">No se encontraron grupos en AGON</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                            {grupos
                                .filter(g => {
                                    if (!searchGrupo) return true;
                                    const q = searchGrupo.toLowerCase();
                                    return g.name.toLowerCase().includes(q) || 
                                           (g.teacher_name && g.teacher_name.toLowerCase().includes(q));
                                })
                                .map(g => {
                                const selected = form.grupos_agon_ids.includes(g.id);
                                return (
                                    <button key={g.id} onClick={() => toggleGrupo(g)}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99]
                                            ${selected ? 'shadow-md' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                                        style={selected ? { borderColor: color, backgroundColor: `${color}0d` } : {}}>
                                        {selected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: color }}>
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                        <p className="font-semibold text-slate-800 text-sm pr-6">{g.name}</p>
                                        {g.teacher_name && <p className="text-xs text-slate-400 mt-0.5">{g.teacher_name}</p>}
                                        {g.students?.length > 0 && (
                                            <p className="text-xs mt-1 font-medium" style={{ color: selected ? color : '#94a3b8' }}>
                                                {g.students.length} estudiantes
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Step 2 — Revisar */}
            {step === 2 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                    {/* Preview card */}
                    <div className="rounded-xl overflow-hidden border border-slate-100">
                        <div className="h-2" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
                        <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-lg">{form.nombre || '(sin nombre)'}</h3>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: `${color}15`, color }}>
                                    {form.semestre || 'Sin semestre'}
                                </span>
                            </div>
                            {form.descripcion && <p className="text-slate-500 text-sm">{form.descripcion}</p>}
                            <p className="text-xs text-slate-400">
                                {form.grupos_agon_ids.length} grupos · {form.fecha_inicio || '—'} → {form.fecha_fin || '—'}
                            </p>
                        </div>
                    </div>
                    {form.objetivos && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Objetivos</p>
                            <p className="text-sm text-slate-600">{form.objetivos}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Grupos seleccionados</p>
                        <div className="flex flex-wrap gap-2">
                            {form.grupos_nombres.length === 0 && <p className="text-slate-400 text-sm">Ninguno</p>}
                            {form.grupos_nombres.map((n, i) => (
                                <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-lg"
                                    style={{ backgroundColor: `${color}15`, color }}>
                                    {n}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Nav */}
            <div className="flex justify-between">
                <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-40 transition-all">
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                {step < STEPS.length - 1 ? (
                    <button onClick={() => setStep(s => s + 1)}
                        className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all"
                        style={{ backgroundColor: color }}>
                        Siguiente <ChevronRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button onClick={handleSave} disabled={saving}
                        className="inline-flex items-center gap-2 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all disabled:opacity-60"
                        style={{ backgroundColor: color }}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {isEdit ? 'Guardar cambios' : 'Crear Entorno'}
                    </button>
                )}
            </div>
        </div>
    );
}
