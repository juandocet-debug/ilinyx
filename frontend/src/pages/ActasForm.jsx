/* eslint-disable */
// pages/ActasForm.jsx
// Formulario de 4 pasos para crear/editar un acta de reunión FOR023GDC.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Save, Eye, Plus, Trash2,
    UserPlus, Users, Printer, CheckCircle2,
} from 'lucide-react';
import UserAutocomplete from '../components/actas/UserAutocomplete';
import PeopleTable from '../components/actas/PeopleTable';
import CourseImportModal from '../components/actas/CourseImportModal';

const STEPS = ['Info. General', 'Agenda', 'Resultados', 'Firmas'];

// Constantes de estilo reutilizables (igual que antes)
const lbl = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide';
const inp = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500 transition-all';

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

export default function ActasForm({ acta, step, setStep, user, onChange, onSave, onPreview, onBack, saving = false }) {
    const set = (field, val) => onChange(p => ({ ...p, [field]: val }));
    const setRow = (field, idx, key, val) => onChange(p => {
        const arr = [...p[field]]; arr[idx] = { ...arr[idx], [key]: val }; return { ...p, [field]: arr };
    });
    const addRow = (field, empty) => onChange(p => ({ ...p, [field]: [...p[field], { ...empty }] }));
    const delRow = (field, idx) => onChange(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));

    // Auto-sync: al entrar a paso 3 (Firmas), copiar asistentes+invitados como firmas pendientes
    useEffect(() => {
        if (step !== 3) return;
        onChange(p => {
            const people = [...(p.asistentes || []), ...(p.invitados || [])]
                .filter(r => r.nombre && r.nombre !== 'N/A' && r.nombre.trim() !== '');
            const existingIds = new Set((p.firmas || []).map(f => f.user_id || f.nombre).filter(Boolean));
            const toAdd = people.filter(r => {
                const key = r.user_id || r.nombre;
                return key && !existingIds.has(key);
            }).map(r => ({ nombre: r.nombre, firma: '', user_id: r.user_id || null, firmado: false, fecha: '' }));
            if (toAdd.length === 0) return p;
            return { ...p, firmas: [...(p.firmas || []), ...toAdd] };
        });
    }, [step]);

    const [importTarget, setImportTarget] = useState(null);

    const handleCourseImport = (course) => {
        if (!importTarget || !course.students?.length) return;
        const ROLE_ES = { ADMIN: 'Administrador', TEACHER: 'Docente', STUDENT: 'Estudiante' };

        if (importTarget === 'firmas_import') {
            const newFirmas = course.students.map(s => ({
                nombre: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
                firma: '', user_id: s.id, firmado: false, fecha: '',
            }));
            onChange(p => {
                const existingIds = new Set((p.firmas || []).map(f => f.user_id).filter(Boolean));
                return { ...p, firmas: [...(p.firmas || []), ...newFirmas.filter(f => !existingIds.has(f.user_id))] };
            });
        } else {
            const newRows = course.students.map(s => ({
                nombre: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
                cargo: ROLE_ES[s.role] || s.role || '',
                email: s.email || '', user_id: s.id, foto: s.photo || '',
            }));
            onChange(p => {
                const existing = p[importTarget].filter(r => r.nombre && r.nombre !== 'N/A' && r.nombre.trim() !== '');
                const existingIds = new Set(existing.map(r => r.user_id).filter(Boolean));
                return { ...p, [importTarget]: [...existing, ...newRows.filter(r => !existingIds.has(r.user_id))] };
            });
        }
        setImportTarget(null);
    };

    const addMySig = () => {
        const name = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '';
        if (!name) return;
        onChange(p => {
            const already = p.firmas?.some(f => f.user_id === user?.id || f.nombre === name);
            if (already) return p;
            return { ...p, firmas: [...(p.firmas || []), { nombre: name, firma: '', user_id: user?.id, firmado: false, fecha: '' }] };
        });
    };

    const emptyPerson = { nombre: '', cargo: '', email: '', user_id: null, foto: '' };

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Acta — {acta.tipo}</h1>
                    <p className="text-slate-400 text-xs">FOR023GDC · UPN · Los participantes busca desde AGON</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button onClick={onPreview}
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                        <Eye className="h-4 w-4" /> Vista Previa
                    </button>
                    <button onClick={onSave} disabled={saving}
                        className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md disabled:opacity-60">
                        <Save className="h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar'}
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
                <motion.div key={step}
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-7">

                    {/* ── Paso 0: Info General ── */}
                    {step === 0 && <>
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
                                <div><label className={lbl}>No. del Acta</label><input value={acta.numero} onChange={e => set('numero', e.target.value)} className={inp} placeholder="001" /></div>
                                <div><label className={lbl}>Total de actas</label><input value={acta.total} onChange={e => set('total', e.target.value)} className={inp} placeholder="12" /></div>
                            </div>
                        </Sec>
                        <Sec num="1" title="Información General">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div><label className={lbl}>Fecha *</label><input type="date" value={acta.fecha} onChange={e => set('fecha', e.target.value)} className={inp} /></div>
                                <div><label className={lbl}>Hora inicio</label><input type="time" value={acta.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} className={inp} /></div>
                                <div><label className={lbl}>Hora final</label><input type="time" value={acta.hora_final} onChange={e => set('hora_final', e.target.value)} className={inp} /></div>
                            </div>
                            <div><label className={lbl}>Instancias / Dependencias reunidas</label><input value={acta.instancias} onChange={e => set('instancias', e.target.value)} className={inp} /></div>
                            <div><label className={lbl}>Lugar de la reunión</label><input value={acta.lugar} onChange={e => set('lugar', e.target.value)} className={inp} /></div>
                        </Sec>
                        <Sec num="2" title="Asistentes" hint="Busca por nombre o cédula">
                            <PeopleTable rows={acta.asistentes} emptyRow={emptyPerson}
                                onChange={(i, k, v) => setRow('asistentes', i, k, v)}
                                onAdd={r => addRow('asistentes', r)} onDel={i => delRow('asistentes', i)}
                                onImportCourse={() => setImportTarget('asistentes')} />
                        </Sec>
                        <Sec num="3" title="Ausentes" hint="N/A si no aplica">
                            <PeopleTable rows={acta.ausentes} emptyRow={{ nombre: 'N/A', cargo: '', email: '', user_id: null, foto: '' }}
                                onChange={(i, k, v) => setRow('ausentes', i, k, v)}
                                onAdd={r => addRow('ausentes', r)} onDel={i => delRow('ausentes', i)}
                                onImportCourse={() => setImportTarget('ausentes')} />
                        </Sec>
                        <Sec num="4" title="Invitados" hint="N/A si no aplica">
                            <PeopleTable rows={acta.invitados} emptyRow={{ nombre: 'N/A', cargo: '', email: '', user_id: null, foto: '' }}
                                onChange={(i, k, v) => setRow('invitados', i, k, v)}
                                onAdd={r => addRow('invitados', r)} onDel={i => delRow('invitados', i)}
                                onImportCourse={() => setImportTarget('invitados')} />
                        </Sec>
                    </>}

                    {/* ── Paso 1: Agenda ── */}
                    {step === 1 && <>
                        <Sec num="5" title="Orden del Día">
                            <textarea rows={5} value={acta.orden_dia} onChange={e => set('orden_dia', e.target.value)} className={inp} placeholder="Describa los puntos del orden del día..." />
                        </Sec>
                        <Sec num="6" title="Desarrollo del Orden del Día">
                            <textarea rows={10} value={acta.desarrollo} onChange={e => set('desarrollo', e.target.value)} className={inp} placeholder="Describa el desarrollo de cada punto..." />
                        </Sec>
                    </>}

                    {/* ── Paso 2: Resultados ── */}
                    {step === 2 && <>
                        <Sec num="7" title="Compromisos" hint="N/A si no aplica">
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full"><thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Compromiso</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsable</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                        <th className="w-10" />
                                    </tr>
                                </thead><tbody className="divide-y divide-slate-50">
                                        {acta.compromisos.map((c, i) => (
                                            <tr key={i}>
                                                <td className="px-2 py-2"><input value={c.compromiso} onChange={e => setRow('compromisos', i, 'compromiso', e.target.value)} className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500" /></td>
                                                <td className="px-2 py-2"><UserAutocomplete value={c.responsable} onChangeName={v => setRow('compromisos', i, 'responsable', v)} onSelect={(user, name) => { setRow('compromisos', i, 'responsable', name); setRow('compromisos', i, 'responsable_id', user.id); }} /></td>
                                                <td className="px-2 py-2"><input type="date" value={c.fecha} onChange={e => setRow('compromisos', i, 'fecha', e.target.value)} className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500" /></td>
                                                <td className="px-2 py-2 text-center"><button onClick={() => delRow('compromisos', i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody></table>
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

                    {/* ── Paso 3: Firmas ── */}
                    {step === 3 && <>
                        <Sec num="10" title="Firmas" hint="El firmante puede hacerlo desde 'Mis Actas'">
                            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-ilinyx-50 rounded-xl border border-ilinyx-100">
                                <button onClick={addMySig}
                                    className="inline-flex items-center gap-2 bg-ilinyx-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-ilinyx-800 transition-all shadow">
                                    <UserPlus className="h-4 w-4" /> Agregar mi firma
                                </button>
                                <button onClick={() => setImportTarget('firmas_import')}
                                    className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-emerald-700 transition-all shadow">
                                    <Users className="h-4 w-4" /> Importar grupo o clase
                                </button>
                                <div>
                                    <p className="text-sm font-semibold text-ilinyx-800">
                                        Firmando como: {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '—'}
                                    </p>
                                    <p className="text-xs text-ilinyx-600">Los demás participantes pueden firmar desde "Mis Actas"</p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full"><thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Firma</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                        <th className="w-10" />
                                    </tr>
                                </thead><tbody className="divide-y divide-slate-50">
                                        {(acta.firmas || []).length === 0 && (
                                            <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-sm">Sin firmas aún</td></tr>
                                        )}
                                        {(acta.firmas || []).map((f, i) => (
                                            <tr key={i} className={f.firmado ? 'bg-emerald-50/30' : 'bg-amber-50/20'}>
                                                <td className="px-3 py-2.5 font-medium text-slate-700 text-sm">{f.nombre}</td>
                                                <td className="px-3 py-2.5 text-sm">
                                                    {f.firmado && f.firma?.startsWith('data:')
                                                        ? <img src={f.firma} alt="Firma" className="max-h-10 max-w-[140px] object-contain" />
                                                        : f.firmado ? <span className="text-emerald-600 font-semibold">✓ Firmado</span>
                                                            : <span className="text-amber-500 italic">Pendiente</span>
                                                    }
                                                </td>
                                                <td className="px-3 py-2.5 text-slate-400 text-xs">{f.fecha || '—'}</td>
                                                <td className="px-2 py-2 text-center flex items-center gap-1">
                                                    {f.firmado
                                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                                        : <span className="w-4 h-4 rounded-full bg-amber-200 mx-auto block" title="Pendiente" />
                                                    }
                                                    <button onClick={() => delRow('firmas', i)} className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors" title="Quitar">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody></table>
                            </div>
                        </Sec>
                    </>}
                </motion.div>
            </AnimatePresence>

            {/* Nav anterior / siguiente */}
            <div className="flex justify-between">
                <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-40 transition-all">
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                {step < STEPS.length - 1
                    ? <button onClick={() => setStep(s => s + 1)}
                        className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all">
                        Siguiente <ChevronRight className="h-4 w-4" />
                    </button>
                    : <button onClick={onPreview}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all">
                        <Printer className="h-4 w-4" /> Vista Previa / Imprimir
                    </button>
                }
            </div>

            <CourseImportModal open={!!importTarget} onClose={() => setImportTarget(null)} onImport={handleCourseImport} />
        </div>
    );
}
