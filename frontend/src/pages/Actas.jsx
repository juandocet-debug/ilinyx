/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Printer, ChevronLeft, ChevronRight, FileText,
    UserPlus, Save, Eye, PenLine, Search, Loader2, CheckCircle2, X
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { searchUsers } from '../services/api';

const UPN_LOGO = 'https://i.ibb.co/C5SB6zj4/Identidad-UPN-25-vertical-azul-fondo-blanco.png';
const STEPS = ['Info. General', 'Agenda', 'Resultados', 'Firmas'];

const mkActa = () => ({
    id: Date.now(), createdAt: new Date().toISOString(),
    tipo: 'ACTA', numero: '', total: '',
    fecha: '', hora_inicio: '', hora_final: '', instancias: '', lugar: '',
    asistentes: [{ nombre: '', cargo: '', email: '', user_id: null, foto: '' }],
    ausentes: [{ nombre: 'N/A', cargo: '', email: '', user_id: null, foto: '' }],
    invitados: [{ nombre: 'N/A', cargo: '', email: '', user_id: null, foto: '' }],
    orden_dia: '', desarrollo: '',
    compromisos: [{ compromiso: '', responsable: '', responsable_id: null, fecha: '' }],
    proxima_convocatoria: 'N/A', anexos: 'N/A',
    firmas: [],
});

// ══════════════════════════════════════════════════════════════════
// AUTOCOMPLETE DE USUARIOS AGON
// ══════════════════════════════════════════════════════════════════
function UserAutocomplete({ value, onSelect, onChangeName, placeholder = 'Buscar nombre o cédula...' }) {
    const [q, setQ] = useState(value || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (q.length < 2) { setResults([]); setOpen(false); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const { data } = await searchUsers(q);
                const list = Array.isArray(data) ? data : (data.results || []);
                setResults(list);
                setOpen(list.length > 0);
            } catch { setResults([]); setOpen(false); }
            finally { setLoading(false); }
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
                    onChange={e => { setQ(e.target.value); if (onChangeName) onChangeName(e.target.value); }}
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
                            const avatar = user.profile_picture || user.avatar || null;
                            return (
                                <button key={user.id} onClick={() => handleSelect(user)}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-ilinyx-50 transition-colors text-left border-b border-slate-50 last:border-0">
                                    {avatar
                                        ? <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-white shadow" />
                                        : <div className="w-9 h-9 rounded-full bg-ilinyx-100 flex items-center justify-center text-ilinyx-600 font-bold text-xs flex-shrink-0">
                                            {(user.first_name?.[0] || '?')}{(user.last_name?.[0] || '')}
                                        </div>
                                    }
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{name || user.username}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email} · C.C. {user.username}</p>
                                        {user.role && <p className="text-xs text-ilinyx-500 font-medium">{user.role}</p>}
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

// ══════════════════════════════════════════════════════════════════
// TABLA DINÁMICA DE PERSONAS (con autocomplete)
// ══════════════════════════════════════════════════════════════════
function PeopleTable({ rows, onChange, onAdd, onDel, emptyRow }) {
    return (
        <div className="space-y-2">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-8"></th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombres (busca desde AGON)</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargo / Dependencia</th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                                <td className="px-2 py-2">
                                    {row.foto
                                        ? <img src={row.foto} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow" />
                                        : row.nombre && row.nombre !== 'N/A'
                                            ? <div className="w-8 h-8 rounded-full bg-ilinyx-100 flex items-center justify-center text-ilinyx-600 font-bold text-[10px]">
                                                {row.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                            </div>
                                            : <div className="w-8 h-8 rounded-full bg-slate-100 border border-dashed border-slate-300" />
                                    }
                                </td>
                                <td className="px-2 py-2">
                                    <UserAutocomplete
                                        value={row.nombre}
                                        onChangeName={val => onChange(i, 'nombre', val)}
                                        onSelect={(user, name) => {
                                            onChange(i, 'nombre', name);
                                            onChange(i, 'cargo', user.role || user.cargo || '');
                                            onChange(i, 'email', user.email || '');
                                            onChange(i, 'user_id', user.id);
                                            onChange(i, 'foto', user.profile_picture || user.avatar || '');
                                        }}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input value={row.cargo || ''} onChange={e => onChange(i, 'cargo', e.target.value)}
                                        placeholder="Se autocompleta o escribe"
                                        className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500 transition-all" />
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <button onClick={() => onDel(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={() => onAdd(emptyRow)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ilinyx-600 hover:text-ilinyx-800 transition-colors px-2 py-1 rounded-lg hover:bg-ilinyx-50">
                <Plus className="h-3.5 w-3.5" /> Agregar fila
            </button>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function ActasPage() {
    const { user } = useUser();
    const [view, setView] = useState('list'); // 'list' | 'form' | 'preview' | 'mis'
    const [actas, setActas] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ilinyx_actas') || '[]'); } catch { return []; }
    });
    const [current, setCurrent] = useState(null);
    const [step, setStep] = useState(0);

    const saveAll = (list) => { setActas(list); localStorage.setItem('ilinyx_actas', JSON.stringify(list)); };
    const handleNew = () => { setCurrent(mkActa()); setStep(0); setView('form'); };
    const handleEdit = (a) => { setCurrent({ ...a }); setStep(0); setView('form'); };
    const handleDelete = (id) => { if (!confirm('¿Eliminar esta acta?')) return; saveAll(actas.filter(a => a.id !== id)); };
    const handleSave = () => {
        if (!current) return;
        const exists = actas.find(a => a.id === current.id);
        saveAll(exists ? actas.map(a => a.id === current.id ? current : a) : [...actas, current]);
        setView('list');
    };

    // Actas donde el usuario actual aparece como asistente/invitado/etc
    const myActas = actas.filter(a => {
        const myName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase() : '';
        const myId = user?.id;
        const inList = (arr) => arr?.some(r => (myId && r.user_id === myId) || (myName && r.nombre?.toLowerCase().includes(myName)));
        return inList(a.asistentes) || inList(a.ausentes) || inList(a.invitados) ||
            a.compromisos?.some(c => (myId && c.responsable_id === myId) || c.responsable?.toLowerCase().includes(myName));
    });

    const handleSign = (actaId) => {
        const name = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '';
        if (!name) return;
        const updated = actas.map(a => {
            if (a.id !== actaId) return a;
            const alreadySigned = a.firmas?.some(f => f.user_id === user?.id || f.nombre === name);
            if (alreadySigned) return a;
            return { ...a, firmas: [...(a.firmas || []), { nombre: name, firma: name, user_id: user?.id, fecha: new Date().toLocaleDateString('es-ES') }] };
        });
        saveAll(updated);
    };

    if (view === 'preview' && current) return <PrintView acta={current} onBack={() => setView('form')} />;
    if (view === 'form' && current) return (
        <FormView acta={current} step={step} setStep={setStep} user={user}
            onChange={setCurrent} onSave={handleSave}
            onPreview={() => setView('preview')} onBack={() => setView('list')} />
    );

    // ── LIST / MIS ACTAS VIEW ──
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Actas de Reunión</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Formato FOR023GDC · Universidad Pedagógica Nacional</p>
                </div>
                <button onClick={handleNew} className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95">
                    <Plus className="h-4 w-4" /> Nueva Acta
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {['Todas las Actas', 'Mis Actas'].map((t, i) => (
                    <button key={t} onClick={() => setView(i === 0 ? 'list' : 'mis')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${(view === 'list' && i === 0) || (view === 'mis' && i === 1) ? 'bg-white text-ilinyx-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {t} {i === 1 && myActas.length > 0 && <span className="ml-1 bg-ilinyx-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{myActas.length}</span>}
                    </button>
                ))}
            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {view === 'list' && (
                    actas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FileText className="h-12 w-12 mb-3 opacity-30" />
                            <p className="font-semibold text-slate-500">No hay actas registradas</p>
                            <button onClick={handleNew} className="mt-5 inline-flex items-center gap-2 bg-ilinyx-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow">
                                <Plus className="h-4 w-4" /> Nueva Acta
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>{['No.', 'Tipo', 'Fecha', 'Lugar', 'Asistentes', 'Firmantes', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {actas.map(a => (
                                        <tr key={a.id} className="hover:bg-ilinyx-50/20 transition-colors">
                                            <td className="px-4 py-3 font-mono text-sm text-slate-500">{a.numero || '–'}/{a.total || '–'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.tipo === 'ACTA' ? 'bg-ilinyx-50 text-ilinyx-700' : 'bg-blue-50 text-blue-700'}`}>{a.tipo}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{a.fecha || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate">{a.lugar || '—'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex -space-x-2">
                                                    {a.asistentes?.filter(x => x.nombre && x.nombre !== 'N/A').slice(0, 4).map((x, i) => (
                                                        x.foto
                                                            ? <img key={i} src={x.foto} title={x.nombre} className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm" />
                                                            : <div key={i} title={x.nombre} className="w-7 h-7 rounded-full border-2 border-white bg-ilinyx-100 text-ilinyx-600 text-[9px] font-bold flex items-center justify-center shadow-sm">
                                                                {x.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                                            </div>
                                                    ))}
                                                    {(a.asistentes?.filter(x => x.nombre && x.nombre !== 'N/A').length || 0) > 4 &&
                                                        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 text-slate-500 text-[9px] font-bold flex items-center justify-center">
                                                            +{a.asistentes.filter(x => x.nombre && x.nombre !== 'N/A').length - 4}
                                                        </div>
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold">
                                                    <CheckCircle2 className={`h-3.5 w-3.5 ${a.firmas?.length ? 'text-emerald-500' : 'text-slate-300'}`} />
                                                    {a.firmas?.length || 0} firma(s)
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 flex items-center gap-2">
                                                <button onClick={() => handleEdit(a)} className="p-2 rounded-lg bg-ilinyx-50 text-ilinyx-600 hover:bg-ilinyx-100 transition-colors" title="Editar"><PenLine className="h-4 w-4" /></button>
                                                <button onClick={() => { setCurrent({ ...a }); setView('preview'); }} className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors" title="Imprimir"><Printer className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {view === 'mis' && (
                    myActas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <CheckCircle2 className="h-12 w-12 mb-3 opacity-30" />
                            <p className="font-semibold text-slate-500">No apareces en ninguna acta aún</p>
                            <p className="text-sm">Cuando alguien te agregue en un acta aparecerá aquí</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {myActas.map(a => {
                                const myName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
                                const alreadySigned = a.firmas?.some(f => f.user_id === user?.id || f.nombre === myName);
                                return (
                                    <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-ilinyx-50/20 transition-colors">
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-slate-800">Acta No. {a.numero || '–'} / {a.total || '–'}</p>
                                            <p className="text-sm text-slate-500">{a.fecha} · {a.lugar}</p>
                                            <p className="text-xs text-slate-400">{a.instancias}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => { setCurrent({ ...a }); setView('preview'); }}
                                                className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors" title="Ver acta">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            {alreadySigned
                                                ? <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-2 rounded-xl border border-emerald-100">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Ya firmaste
                                                </span>
                                                : <button onClick={() => handleSign(a.id)}
                                                    className="inline-flex items-center gap-1.5 bg-ilinyx-700 hover:bg-ilinyx-800 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95">
                                                    <PenLine className="h-4 w-4" /> Firmar
                                                </button>
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// FORM VIEW — 4 pasos
// ══════════════════════════════════════════════════════════════════
function FormView({ acta, step, setStep, user, onChange, onSave, onPreview, onBack }) {
    const set = (field, val) => onChange(p => ({ ...p, [field]: val }));
    const setRow = (field, idx, key, val) => onChange(p => {
        const arr = [...p[field]]; arr[idx] = { ...arr[idx], [key]: val }; return { ...p, [field]: arr };
    });
    const addRow = (field, empty) => onChange(p => ({ ...p, [field]: [...p[field], { ...empty }] }));
    const delRow = (field, idx) => onChange(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));

    const addMySig = () => {
        const name = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '';
        if (!name) return;
        onChange(p => {
            const already = p.firmas?.some(f => f.user_id === user?.id || f.nombre === name);
            if (already) return p;
            return { ...p, firmas: [...(p.firmas || []), { nombre: name, firma: name, user_id: user?.id, fecha: new Date().toLocaleDateString('es-ES') }] };
        });
    };

    const emptyPerson = { nombre: '', cargo: '', email: '', user_id: null, foto: '' };

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Acta — {acta.tipo}</h1>
                    <p className="text-slate-400 text-xs">FOR023GDC · UPN · Los participantes busca desde AGON</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button onClick={onPreview} className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                        <Eye className="h-4 w-4" /> Vista Previa
                    </button>
                    <button onClick={onSave} className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md">
                        <Save className="h-4 w-4" /> Guardar
                    </button>
                </div>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                        <button onClick={() => setStep(i)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${step === i ? 'bg-ilinyx-700 text-white shadow' : i < step ? 'bg-ilinyx-50 text-ilinyx-700' : 'bg-slate-100 text-slate-400'}`}>
                            <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${step === i ? 'bg-white/20' : ''}`}>{i + 1}</span>
                            <span className="hidden sm:inline">{s}</span>
                        </button>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-ilinyx-400' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-7">

                    {step === 0 && <>
                        {/* Cabecera */}
                        <Sec title="Encabezado">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className={lbl}>Tipo de documento</label>
                                    <div className="flex gap-4 mt-1.5">
                                        {['ACTA', 'RESUMEN'].map(t => (
                                            <label key={t} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="tipo" value={t} checked={acta.tipo === t} onChange={() => set('tipo', t)} className="accent-ilinyx-600" />
                                                <span className="text-sm font-medium text-slate-700">{t}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>No. del Acta</label>
                                    <input value={acta.numero} onChange={e => set('numero', e.target.value)} className={inp} placeholder="001" />
                                </div>
                                <div>
                                    <label className={lbl}>Total de actas</label>
                                    <input value={acta.total} onChange={e => set('total', e.target.value)} className={inp} placeholder="12" />
                                </div>
                            </div>
                        </Sec>

                        {/* Sección 1 */}
                        <Sec num="1" title="Información General">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div><label className={lbl}>Fecha *</label><input type="date" value={acta.fecha} onChange={e => set('fecha', e.target.value)} className={inp} /></div>
                                <div><label className={lbl}>Hora inicio</label><input type="time" value={acta.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} className={inp} /></div>
                                <div><label className={lbl}>Hora final</label><input type="time" value={acta.hora_final} onChange={e => set('hora_final', e.target.value)} className={inp} /></div>
                            </div>
                            <div><label className={lbl}>Instancias / Dependencias reunidas</label><input value={acta.instancias} onChange={e => set('instancias', e.target.value)} className={inp} /></div>
                            <div><label className={lbl}>Lugar de la reunión</label><input value={acta.lugar} onChange={e => set('lugar', e.target.value)} className={inp} /></div>
                        </Sec>

                        {/* Sección 2 */}
                        <Sec num="2" title="Asistentes" hint="Busca por nombre o cédula">
                            <PeopleTable rows={acta.asistentes} emptyRow={emptyPerson}
                                onChange={(i, k, v) => setRow('asistentes', i, k, v)}
                                onAdd={r => addRow('asistentes', r)}
                                onDel={i => delRow('asistentes', i)} />
                        </Sec>

                        {/* Sección 3 */}
                        <Sec num="3" title="Ausentes" hint="N/A si no aplica">
                            <PeopleTable rows={acta.ausentes} emptyRow={{ nombre: 'N/A', cargo: '', email: '', user_id: null, foto: '' }}
                                onChange={(i, k, v) => setRow('ausentes', i, k, v)}
                                onAdd={r => addRow('ausentes', r)}
                                onDel={i => delRow('ausentes', i)} />
                        </Sec>

                        {/* Sección 4 */}
                        <Sec num="4" title="Invitados" hint="N/A si no aplica">
                            <PeopleTable rows={acta.invitados} emptyRow={{ nombre: 'N/A', cargo: '', email: '', user_id: null, foto: '' }}
                                onChange={(i, k, v) => setRow('invitados', i, k, v)}
                                onAdd={r => addRow('invitados', r)}
                                onDel={i => delRow('invitados', i)} />
                        </Sec>
                    </>}

                    {step === 1 && <>
                        <Sec num="5" title="Orden del Día">
                            <textarea rows={5} value={acta.orden_dia} onChange={e => set('orden_dia', e.target.value)} className={inp} placeholder="Describa los puntos del orden del día..." />
                        </Sec>
                        <Sec num="6" title="Desarrollo del Orden del Día">
                            <textarea rows={10} value={acta.desarrollo} onChange={e => set('desarrollo', e.target.value)} className={inp} placeholder="Describa el desarrollo de cada punto..." />
                        </Sec>
                    </>}

                    {step === 2 && <>
                        <Sec num="7" title="Compromisos" hint="N/A si no aplica">
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Compromiso</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsable (desde AGON)</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {acta.compromisos.map((c, i) => (
                                            <tr key={i}>
                                                <td className="px-2 py-2">
                                                    <input value={c.compromiso} onChange={e => setRow('compromisos', i, 'compromiso', e.target.value)}
                                                        className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500" />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <UserAutocomplete value={c.responsable}
                                                        onChangeName={v => setRow('compromisos', i, 'responsable', v)}
                                                        onSelect={(user, name) => {
                                                            setRow('compromisos', i, 'responsable', name);
                                                            setRow('compromisos', i, 'responsable_id', user.id);
                                                        }} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="date" value={c.fecha} onChange={e => setRow('compromisos', i, 'fecha', e.target.value)}
                                                        className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500" />
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <button onClick={() => delRow('compromisos', i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={() => addRow('compromisos', { compromiso: '', responsable: '', responsable_id: null, fecha: '' })}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ilinyx-600 hover:text-ilinyx-800 px-2 py-1 rounded-lg hover:bg-ilinyx-50 mt-2">
                                <Plus className="h-3.5 w-3.5" /> Agregar compromiso
                            </button>
                        </Sec>
                        <Sec num="8" title="Próxima Convocatoria">
                            <textarea rows={3} value={acta.proxima_convocatoria} onChange={e => set('proxima_convocatoria', e.target.value)} className={inp} />
                        </Sec>
                        <Sec num="9" title="Anexos">
                            <textarea rows={3} value={acta.anexos} onChange={e => set('anexos', e.target.value)} className={inp} />
                        </Sec>
                    </>}

                    {step === 3 && <>
                        <Sec num="10" title="Firmas" hint="El firmante puede hacerlo desde 'Mis Actas'">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-ilinyx-50 rounded-xl border border-ilinyx-100">
                                <button onClick={addMySig} className="inline-flex items-center gap-2 bg-ilinyx-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-ilinyx-800 transition-all shadow">
                                    <UserPlus className="h-4 w-4" /> Agregar mi firma
                                </button>
                                <div>
                                    <p className="text-sm font-semibold text-ilinyx-800">Firmando como: {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '—'}</p>
                                    <p className="text-xs text-ilinyx-600">Los demás participantes pueden firmar desde la pestaña "Mis Actas"</p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Firma</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(acta.firmas || []).length === 0 && (
                                            <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-sm">Sin firmas aún</td></tr>
                                        )}
                                        {(acta.firmas || []).map((f, i) => (
                                            <tr key={i} className="bg-emerald-50/30">
                                                <td className="px-3 py-2.5 font-medium text-slate-700 text-sm">{f.nombre}</td>
                                                <td className="px-3 py-2.5 text-slate-600 italic text-sm">{f.firma}</td>
                                                <td className="px-3 py-2.5 text-slate-400 text-xs">{f.fecha || '—'}</td>
                                                <td className="px-2 py-2 text-center">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Sec>
                    </>}
                </motion.div>
            </AnimatePresence>

            {/* Nav */}
            <div className="flex justify-between">
                <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-40 transition-all">
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                {step < STEPS.length - 1
                    ? <button onClick={() => setStep(s => s + 1)} className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all">
                        Siguiente <ChevronRight className="h-4 w-4" />
                    </button>
                    : <button onClick={onPreview} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all">
                        <Printer className="h-4 w-4" /> Vista Previa / Imprimir
                    </button>
                }
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// PRINT VIEW
// ══════════════════════════════════════════════════════════════════
function PrintView({ acta, onBack }) {
    return (
        <div>
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #print-acta, #print-acta * { visibility: visible !important; }
                    #print-acta { position: fixed; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    @page { size: letter; margin: 1.5cm; }
                }
                #print-acta { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
                #print-acta table { border-collapse: collapse; width: 100%; }
                #print-acta td, #print-acta th { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
                #print-acta .sec { background: #d9d9d9; font-weight: bold; padding: 4px 6px; border: 1px solid #000; margin-top: 6px; }
                #print-acta .hdr { background: #d9d9d9; font-weight: bold; }
            `}</style>
            <div className="no-print flex items-center gap-3 mb-6">
                <button onClick={onBack} className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm">
                    <ChevronLeft className="h-4 w-4" /> Volver
                </button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md">
                    <Printer className="h-4 w-4" /> Imprimir / PDF
                </button>
                <span className="text-slate-400 text-xs">Ctrl+P → Guardar como PDF</span>
            </div>

            <div id="print-acta" className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
                <table><tbody>
                    <tr>
                        <td rowSpan={3} style={{ width: '28%', textAlign: 'center' }}>
                            <img src={UPN_LOGO} alt="UPN" style={{ height: 70, objectFit: 'contain' }} />
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>FORMATO</td>
                    </tr>
                    <tr><td style={{ textAlign: 'center', fontWeight: 'bold' }}>ACTA DE REUNIÓN / RESUMEN DE REUNIÓN</td></tr>
                    <tr><td>
                        <table style={{ border: 'none' }}><tbody>
                            <tr>
                                <td style={{ border: 'none', borderRight: '1px solid #000', fontSize: 10, textAlign: 'center' }}>Código: FOR023GDC</td>
                                <td style={{ border: 'none', fontSize: 10, textAlign: 'center' }}>Versión: 03</td>
                            </tr>
                            <tr>
                                <td style={{ border: 'none', borderRight: '1px solid #000', fontSize: 10, textAlign: 'center' }}>Fecha Aprobación: 22-03-2012</td>
                                <td style={{ border: 'none', fontSize: 10, textAlign: 'center' }}>Página 1</td>
                            </tr>
                        </tbody></table>
                    </td></tr>
                </tbody></table>

                <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '8px 0 4px' }}>Marque según corresponda (*):</p>
                <p style={{ textAlign: 'center', marginBottom: 6 }}>
                    <span style={{ border: '1px solid #000', padding: '2px 8px', marginRight: 16 }}>{acta.tipo === 'ACTA' ? '✓' : ' '}</span> ACTA DE REUNIÓN &nbsp;&nbsp;
                    <span style={{ border: '1px solid #000', padding: '2px 8px', marginRight: 16 }}>{acta.tipo === 'RESUMEN' ? '✓' : ' '}</span> RESUMEN DE REUNIÓN
                </p>
                <table style={{ marginBottom: 6 }}><tbody>
                    <tr><td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}>
                        Acta / Resumen de Reunión No. {acta.numero || '___'} de {acta.total || '___'}
                    </td></tr>
                </tbody></table>

                <div className="sec">1. Información General:</div>
                <table><tbody>
                    <tr><td style={{ width: '30%' }}>Fecha</td><td>{acta.fecha}</td><td style={{ width: '15%' }}>Hora inicio:</td><td>{acta.hora_inicio}</td><td style={{ width: '12%' }}>Hora final:</td><td>{acta.hora_final}</td></tr>
                    <tr><td>Instancias / Dependencias:</td><td colSpan={5}>{acta.instancias}</td></tr>
                    <tr><td>Lugar:</td><td colSpan={5}>{acta.lugar}</td></tr>
                </tbody></table>

                {[
                    { num: '2', title: 'Asistentes', data: acta.asistentes },
                    { num: '3', title: 'Ausentes', data: acta.ausentes },
                    { num: '4', title: 'Invitados', data: acta.invitados },
                ].map(s => (
                    <div key={s.num}>
                        <div className="sec">{s.num}. {s.title}:</div>
                        <table><thead><tr><th className="hdr" style={{ width: '50%' }}>Nombres</th><th className="hdr">Cargo/Dependencia</th></tr></thead>
                            <tbody>{(s.data || [{ nombre: 'N/A', cargo: '' }]).map((r, i) => <tr key={i}><td>{r.nombre}</td><td>{r.cargo}</td></tr>)}</tbody>
                        </table>
                    </div>
                ))}

                <div className="sec">5. Orden del Día:</div>
                <table><tbody><tr><td style={{ minHeight: 80, whiteSpace: 'pre-wrap' }}>{acta.orden_dia}</td></tr></tbody></table>

                <div className="sec">6. Desarrollo del Orden del Día:</div>
                <table><tbody><tr><td style={{ minHeight: 120, whiteSpace: 'pre-wrap' }}>{acta.desarrollo}</td></tr></tbody></table>

                <div className="sec">7. Compromisos:</div>
                <table><thead><tr><th className="hdr">Compromiso</th><th className="hdr">Responsable</th><th className="hdr">Fecha (dd-mm-aaaa)</th></tr></thead>
                    <tbody>{acta.compromisos.map((c, i) => <tr key={i}><td>{c.compromiso}</td><td>{c.responsable}</td><td>{c.fecha}</td></tr>)}</tbody>
                </table>

                <div className="sec">8. Próxima Convocatoria:</div>
                <table><tbody><tr><td style={{ whiteSpace: 'pre-wrap' }}>{acta.proxima_convocatoria}</td></tr></tbody></table>

                <div className="sec">9. Anexos:</div>
                <table><tbody><tr><td style={{ whiteSpace: 'pre-wrap' }}>{acta.anexos}</td></tr></tbody></table>

                <div className="sec">10. Firmas:</div>
                <table><thead><tr><th className="hdr">Nombre</th><th className="hdr">Firma</th><th className="hdr" style={{ width: '20%' }}>Fecha</th></tr></thead>
                    <tbody>
                        {(acta.firmas || []).length === 0
                            ? <tr><td style={{ height: 36 }}></td><td></td><td></td></tr>
                            : acta.firmas.map((f, i) => <tr key={i}><td style={{ height: 36 }}>{f.nombre}</td><td>{f.firma}</td><td>{f.fecha}</td></tr>)
                        }
                    </tbody>
                </table>

                <p style={{ marginTop: 12, fontSize: 10 }}>
                    <b>(*) Acta de Reunión:</b> Reuniones que contemplan elaboración formal de actas. <b>Resumen de Reunión:</b> Se aplica en los demás casos.
                </p>
            </div>
        </div>
    );
}

// ── Helpers ────────────────────────────────────────────────────────
function Sec({ num, title, hint, children }) {
    return (
        <div className="space-y-3">
            <div className="flex items-baseline gap-2">
                {num && <span className="text-xs font-bold text-ilinyx-600 bg-ilinyx-50 px-2 py-0.5 rounded-full">{num}</span>}
                <h3 className="font-bold text-slate-700">{title}</h3>
                {hint && <span className="text-xs text-slate-400">({hint})</span>}
            </div>
            {children}
        </div>
    );
}

const lbl = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide';
const inp = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500 transition-all';
