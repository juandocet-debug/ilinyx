/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Printer, ChevronLeft, ChevronRight, FileText, UserPlus, Save, Eye, X, PenLine } from 'lucide-react';
import { useUser } from '../context/UserContext';

const UPN_LOGO = 'https://i.ibb.co/C5SB6zj4/Identidad-UPN-25-vertical-azul-fondo-blanco.png';

const mkActa = () => ({
    id: Date.now(),
    createdAt: new Date().toISOString(),
    tipo: 'ACTA',
    numero: '', total: '',
    fecha: '', hora_inicio: '', hora_final: '',
    instancias: '', lugar: '',
    asistentes: [{ nombre: '', cargo: '' }],
    ausentes: [{ nombre: 'N/A', cargo: '' }],
    invitados: [{ nombre: 'N/A', cargo: '' }],
    orden_dia: '', desarrollo: '',
    compromisos: [{ compromiso: '', responsable: '', fecha: '' }],
    proxima_convocatoria: 'N/A', anexos: 'N/A',
    firmas: [{ nombre: '', firma: '' }],
});

const STEPS = ['Información General', 'Agenda', 'Resultados', 'Firmas'];

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function ActasPage() {
    const { user } = useUser();
    const [view, setView] = useState('list');
    const [actas, setActas] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ilinyx_actas') || '[]'); } catch { return []; }
    });
    const [current, setCurrent] = useState(null);
    const [step, setStep] = useState(0);

    const save = (list) => { setActas(list); localStorage.setItem('ilinyx_actas', JSON.stringify(list)); };
    const handleNew = () => { setCurrent(mkActa()); setStep(0); setView('form'); };
    const handleEdit = (a) => { setCurrent({ ...a }); setStep(0); setView('form'); };
    const handleDelete = (id) => { if (!confirm('¿Eliminar esta acta?')) return; save(actas.filter(a => a.id !== id)); };
    const handleSaveActa = (acta) => {
        const exists = actas.find(a => a.id === acta.id);
        save(exists ? actas.map(a => a.id === acta.id ? acta : a) : [...actas, acta]);
        setView('list');
    };

    if (view === 'preview' && current) return <PrintView acta={current} onBack={() => setView('form')} />;
    if (view === 'form' && current) return (
        <FormView acta={current} step={step} setStep={setStep} user={user}
            onChange={setCurrent}
            onSave={() => handleSaveActa(current)}
            onPreview={() => setView('preview')}
            onBack={() => setView('list')} />
    );

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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {actas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <FileText className="h-12 w-12 mb-3 opacity-30" />
                        <p className="font-semibold text-slate-500">No hay actas registradas</p>
                        <p className="text-sm mt-1">Crea tu primera acta de reunión UPN</p>
                        <button onClick={handleNew} className="mt-5 inline-flex items-center gap-2 bg-ilinyx-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow transition-all hover:bg-ilinyx-800">
                            <Plus className="h-4 w-4" /> Nueva Acta
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>{['No.', 'Tipo', 'Fecha', 'Lugar', 'Asistentes', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {actas.map(a => (
                                    <tr key={a.id} className="hover:bg-ilinyx-50/20 transition-colors">
                                        <td className="px-4 py-3 font-mono text-sm text-slate-500">{a.numero || '–'} / {a.total || '–'}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.tipo === 'ACTA' ? 'bg-ilinyx-50 text-ilinyx-700' : 'bg-blue-50 text-blue-700'}`}>{a.tipo}</span></td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{a.fecha || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate">{a.lugar || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{a.asistentes?.filter(x => x.nombre).length || 0}</td>
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
    const addRow = (field, empty) => onChange(p => ({ ...p, [field]: [...p[field], empty] }));
    const delRow = (field, idx) => onChange(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));
    const addMySig = () => {
        const name = user ? (`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username) : '';
        if (!name) return;
        onChange(p => ({ ...p, firmas: [...p.firmas, { nombre: name, firma: name }] }));
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Acta de Reunión — {acta.tipo}</h1>
                    <p className="text-slate-400 text-xs">Formato FOR023GDC · UPN</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button onClick={onPreview} className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                        <Eye className="h-4 w-4" /> Vista Previa
                    </button>
                    <button onClick={onSave} className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                        <Save className="h-4 w-4" /> Guardar
                    </button>
                </div>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                        <button onClick={() => setStep(i)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${step === i ? 'bg-ilinyx-700 text-white shadow-md shadow-ilinyx-700/20' : i < step ? 'bg-ilinyx-50 text-ilinyx-700' : 'bg-slate-100 text-slate-400'}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === i ? 'bg-white/20' : ''}`}>{i + 1}</span>
                            <span className="hidden sm:inline">{s}</span>
                        </button>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-ilinyx-400' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">

                    {step === 0 && <>
                        {/* Cabecera del acta */}
                        <Section title="Encabezado del Acta">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={lbl}>Tipo de documento</label>
                                    <div className="flex gap-3 mt-1">
                                        {['ACTA', 'RESUMEN'].map(t => (
                                            <label key={t} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="tipo" value={t} checked={acta.tipo === t} onChange={() => set('tipo', t)} className="accent-ilinyx-600" />
                                                <span className="text-sm font-medium text-slate-700">{t === 'ACTA' ? 'Acta de Reunión' : 'Resumen de Reunión'}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>No. del Acta</label>
                                    <input value={acta.numero} onChange={e => set('numero', e.target.value)} className={inp} placeholder="ej: 001" />
                                </div>
                                <div>
                                    <label className={lbl}>Total de actas</label>
                                    <input value={acta.total} onChange={e => set('total', e.target.value)} className={inp} placeholder="ej: 12" />
                                </div>
                            </div>
                        </Section>

                        {/* Sección 1 */}
                        <Section num="1" title="Información General">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={lbl}>Fecha <span className="text-red-400">*</span></label>
                                    <input type="date" value={acta.fecha} onChange={e => set('fecha', e.target.value)} className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Hora de inicio</label>
                                    <input type="time" value={acta.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Hora final</label>
                                    <input type="time" value={acta.hora_final} onChange={e => set('hora_final', e.target.value)} className={inp} />
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>Instancias o Dependencias reunidas</label>
                                <input value={acta.instancias} onChange={e => set('instancias', e.target.value)} className={inp} placeholder="ej: Departamento de Recreación" />
                            </div>
                            <div>
                                <label className={lbl}>Lugar de la reunión</label>
                                <input value={acta.lugar} onChange={e => set('lugar', e.target.value)} className={inp} placeholder="ej: Sala de Reuniones, Edificio A" />
                            </div>
                        </Section>

                        {/* Sección 2 */}
                        <Section num="2" title="Asistentes" hint="Adicione o elimine filas">
                            <DynTable rows={acta.asistentes} cols={['nombre', 'cargo']} headers={['Nombres', 'Cargo / Dependencia']}
                                onChange={(i, k, v) => setRow('asistentes', i, k, v)}
                                onAdd={() => addRow('asistentes', { nombre: '', cargo: '' })}
                                onDel={i => delRow('asistentes', i)} />
                        </Section>

                        {/* Sección 3 */}
                        <Section num="3" title="Ausentes" hint="Si No Aplica registre N/A">
                            <DynTable rows={acta.ausentes} cols={['nombre', 'cargo']} headers={['Nombres', 'Cargo / Dependencia']}
                                onChange={(i, k, v) => setRow('ausentes', i, k, v)}
                                onAdd={() => addRow('ausentes', { nombre: 'N/A', cargo: '' })}
                                onDel={i => delRow('ausentes', i)} />
                        </Section>

                        {/* Sección 4 */}
                        <Section num="4" title="Invitados" hint="Si No Aplica registre N/A">
                            <DynTable rows={acta.invitados} cols={['nombre', 'cargo']} headers={['Nombres', 'Cargo / Dependencia']}
                                onChange={(i, k, v) => setRow('invitados', i, k, v)}
                                onAdd={() => addRow('invitados', { nombre: 'N/A', cargo: '' })}
                                onDel={i => delRow('invitados', i)} />
                        </Section>
                    </>}

                    {step === 1 && <>
                        <Section num="5" title="Orden del Día">
                            <textarea rows={5} value={acta.orden_dia} onChange={e => set('orden_dia', e.target.value)}
                                className={inp} placeholder="Describa los puntos del orden del día..." />
                        </Section>
                        <Section num="6" title="Desarrollo del Orden del Día">
                            <textarea rows={10} value={acta.desarrollo} onChange={e => set('desarrollo', e.target.value)}
                                className={inp} placeholder="Describa el desarrollo de cada punto..." />
                        </Section>
                    </>}

                    {step === 2 && <>
                        <Section num="7" title="Compromisos" hint="Si No Aplica registre N/A">
                            <DynTable rows={acta.compromisos}
                                cols={['compromiso', 'responsable', 'fecha']}
                                headers={['Compromiso', 'Responsable', 'Fecha (dd-mm-aaaa)']}
                                onChange={(i, k, v) => setRow('compromisos', i, k, v)}
                                onAdd={() => addRow('compromisos', { compromiso: '', responsable: '', fecha: '' })}
                                onDel={i => delRow('compromisos', i)} />
                        </Section>
                        <Section num="8" title="Próxima Convocatoria" hint="Si No Aplica registre N/A">
                            <textarea rows={3} value={acta.proxima_convocatoria} onChange={e => set('proxima_convocatoria', e.target.value)} className={inp} />
                        </Section>
                        <Section num="9" title="Anexos" hint="Si No Aplica coloque N/A">
                            <textarea rows={3} value={acta.anexos} onChange={e => set('anexos', e.target.value)} className={inp} />
                        </Section>
                    </>}

                    {step === 3 && <>
                        <Section num="10" title="Firmas" hint="Adicione o elimine filas">
                            <div className="flex items-center gap-3 mb-4">
                                <button onClick={addMySig} className="inline-flex items-center gap-2 bg-ilinyx-50 text-ilinyx-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-ilinyx-100 transition-all border border-ilinyx-200">
                                    <UserPlus className="h-4 w-4" /> Agregar mi firma
                                </button>
                                <span className="text-slate-400 text-xs">Agrega tu nombre como firmante del acta</span>
                            </div>
                            <DynTable rows={acta.firmas} cols={['nombre', 'firma']} headers={['Nombre', 'Firma (escriba su nombre)']}
                                onChange={(i, k, v) => setRow('firmas', i, k, v)}
                                onAdd={() => addRow('firmas', { nombre: '', firma: '' })}
                                onDel={i => delRow('firmas', i)} />
                        </Section>
                    </>}
                </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex justify-between">
                <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                {step < STEPS.length - 1 ? (
                    <button onClick={() => setStep(s => s + 1)}
                        className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-ilinyx-700/20">
                        Siguiente <ChevronRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button onClick={onPreview}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20">
                        <Printer className="h-4 w-4" /> Vista Previa / Imprimir
                    </button>
                )}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// PRINT VIEW — replica el formato UPN
// ══════════════════════════════════════════════════════════════════
function PrintView({ acta, onBack }) {
    return (
        <div>
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #print-acta, #print-acta * { visibility: visible !important; }
                    #print-acta { position: fixed; left: 0; top: 0; width: 100%; font-size: 11pt; }
                    .no-print { display: none !important; }
                    @page { size: letter; margin: 1.5cm; }
                }
                #print-acta { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
                #print-acta table { border-collapse: collapse; width: 100%; }
                #print-acta td, #print-acta th { border: 1px solid #000; padding: 4px 6px; }
                #print-acta .header-gray { background: #d9d9d9; font-weight: bold; }
                #print-acta .section-title { background: #d9d9d9; font-weight: bold; padding: 4px 6px; border: 1px solid #000; }
            `}</style>

            {/* Botones de control */}
            <div className="no-print flex items-center gap-3 mb-6">
                <button onClick={onBack} className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                    <ChevronLeft className="h-4 w-4" /> Volver al formulario
                </button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all">
                    <Printer className="h-4 w-4" /> Imprimir / Descargar PDF
                </button>
                <span className="text-slate-400 text-xs">Usa Ctrl+P → "Guardar como PDF" para descargar</span>
            </div>

            {/* Acta imprimible */}
            <div id="print-acta" className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto">

                {/* Encabezado formato UPN */}
                <table style={{ marginBottom: 8 }}>
                    <tbody>
                        <tr>
                            <td rowSpan={3} style={{ width: '25%', textAlign: 'center', padding: 8 }}>
                                <img src={UPN_LOGO} alt="UPN" style={{ height: 70, objectFit: 'contain' }} />
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>FORMATO</td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}>ACTA DE REUNIÓN / RESUMEN DE REUNIÓN</td>
                        </tr>
                        <tr>
                            <td>
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ border: 'none', borderRight: '1px solid #000', fontSize: 10, textAlign: 'center' }}>Código: FOR023GDC</td>
                                            <td style={{ border: 'none', fontSize: 10, textAlign: 'center' }}>Versión: 03</td>
                                        </tr>
                                        <tr>
                                            <td style={{ border: 'none', borderRight: '1px solid #000', fontSize: 10, textAlign: 'center' }}>Fecha de Aprobación: 22-03-2012</td>
                                            <td style={{ border: 'none', fontSize: 10, textAlign: 'center' }}>Página 1</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Tipo */}
                <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '8px 0 4px' }}>Marque según corresponda (*):</p>
                <p style={{ textAlign: 'center', marginBottom: 6 }}>
                    <span style={{ border: '1px solid #000', padding: '2px 8px', marginRight: 16 }}>{acta.tipo === 'ACTA' ? '✓' : ' '}</span>
                    ACTA DE REUNIÓN &nbsp;&nbsp;&nbsp;&nbsp;
                    <span style={{ border: '1px solid #000', padding: '2px 8px', marginRight: 16 }}>{acta.tipo === 'RESUMEN' ? '✓' : ' '}</span>
                    RESUMEN DE REUNIÓN
                </p>

                <table style={{ marginBottom: 6 }}>
                    <tbody>
                        <tr>
                            <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}>
                                Acta / Resumen de Reunión No. {acta.numero || '___'} de {acta.total || '___'}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Sección 1 */}
                <div className="section-title">1. Información General:</div>
                <table style={{ marginBottom: 6 }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '30%' }}>Fecha</td>
                            <td style={{ width: '35%' }}>{acta.fecha}</td>
                            <td style={{ width: '15%' }}>Hora de inicio:</td>
                            <td style={{ width: '10%' }}>{acta.hora_inicio}</td>
                            <td style={{ width: '5%' }}>Hora final:</td>
                            <td>{acta.hora_final}</td>
                        </tr>
                        <tr>
                            <td>Instancias o Dependencias reunidas:</td>
                            <td colSpan={5}>{acta.instancias}</td>
                        </tr>
                        <tr>
                            <td>Lugar de la reunión:</td>
                            <td colSpan={5}>{acta.lugar}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Sección 2 */}
                <div className="section-title">2. Asistentes: <small style={{ fontWeight: 'normal' }}>(Adicione o elimine tantas filas como necesite)</small></div>
                <PeopleTable rows={acta.asistentes} />

                {/* Sección 3 */}
                <div className="section-title" style={{ marginTop: 6 }}>3. Ausentes: <small style={{ fontWeight: 'normal' }}>(Adicione o elimine tantas filas como necesite)</small></div>
                <PeopleTable rows={acta.ausentes} />

                {/* Sección 4 */}
                <div className="section-title" style={{ marginTop: 6 }}>4. Invitados: <small style={{ fontWeight: 'normal' }}>(Adicione o elimine tantas filas como necesite)</small></div>
                <PeopleTable rows={acta.invitados} />

                {/* Sección 5 */}
                <div className="section-title" style={{ marginTop: 6 }}>5. Orden del Día:</div>
                <table><tbody><tr><td style={{ minHeight: 80, whiteSpace: 'pre-wrap' }}>{acta.orden_dia}</td></tr></tbody></table>

                {/* Sección 6 */}
                <div className="section-title" style={{ marginTop: 6 }}>6. Desarrollo del Orden del Día:</div>
                <table><tbody><tr><td style={{ minHeight: 120, whiteSpace: 'pre-wrap' }}>{acta.desarrollo}</td></tr></tbody></table>

                {/* Sección 7 */}
                <div className="section-title" style={{ marginTop: 6 }}>7. Compromisos: <small style={{ fontWeight: 'normal' }}>(Si No Aplica registre N/A)</small></div>
                <table>
                    <thead><tr>
                        <th className="header-gray">Compromiso</th>
                        <th className="header-gray">Responsable</th>
                        <th className="header-gray">Fecha de Realización (dd-mm-aaaa)</th>
                    </tr></thead>
                    <tbody>{acta.compromisos.map((c, i) => (
                        <tr key={i}><td>{c.compromiso}</td><td>{c.responsable}</td><td>{c.fecha}</td></tr>
                    ))}</tbody>
                </table>

                {/* Sección 8 */}
                <div className="section-title" style={{ marginTop: 6 }}>8. Próxima Convocatoria: <small style={{ fontWeight: 'normal' }}>(Si No Aplica registre N/A)</small></div>
                <table><tbody><tr><td style={{ whiteSpace: 'pre-wrap' }}>{acta.proxima_convocatoria}</td></tr></tbody></table>

                {/* Sección 9 */}
                <div className="section-title" style={{ marginTop: 6 }}>9. Anexos: <small style={{ fontWeight: 'normal' }}>(Si No Aplica coloque N/A)</small></div>
                <table><tbody><tr><td style={{ whiteSpace: 'pre-wrap' }}>{acta.anexos}</td></tr></tbody></table>

                {/* Sección 10 */}
                <div className="section-title" style={{ marginTop: 6 }}>10. Firmas: <small style={{ fontWeight: 'normal' }}>(Adicione o elimine tantas filas como requiera)</small></div>
                <table>
                    <thead><tr><th className="header-gray">Nombre</th><th className="header-gray">Firma</th></tr></thead>
                    <tbody>{acta.firmas.map((f, i) => (
                        <tr key={i}><td style={{ minHeight: 36, height: 36 }}>{f.nombre}</td><td style={{ minHeight: 36, height: 36 }}>{f.firma}</td></tr>
                    ))}</tbody>
                </table>

                {/* Nota al pie */}
                <p style={{ marginTop: 12, fontSize: 10 }}>
                    <b>(*) Acta de Reunión:</b> Corresponde a aquellas reuniones que de conformidad con las disposiciones vigentes en la Universidad contemplan la elaboración de actas.{' '}
                    <b>Resumen de Reunión:</b> Se aplica en los demás casos.
                </p>
            </div>
        </div>
    );
}

// ── Tabla de personas (asistentes, ausentes, invitados) ──────────
function PeopleTable({ rows }) {
    return (
        <table>
            <thead><tr><th className="header-gray" style={{ width: '50%' }}>Nombres</th><th className="header-gray">Cargo/Dependencia</th></tr></thead>
            <tbody>{(rows?.length ? rows : [{ nombre: 'N/A', cargo: '' }]).map((r, i) => (
                <tr key={i}><td>{r.nombre}</td><td>{r.cargo}</td></tr>
            ))}</tbody>
        </table>
    );
}

// ── Tabla dinámica editable ───────────────────────────────────────
function DynTable({ rows, cols, headers, onChange, onAdd, onDel }) {
    return (
        <div className="space-y-2">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>{headers.map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}
                            <th className="w-10" /></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, i) => (
                            <tr key={i}>
                                {cols.map(col => (
                                    <td key={col} className="px-2 py-1.5">
                                        <input value={row[col] || ''} onChange={e => onChange(i, col, e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-400 transition-all" />
                                    </td>
                                ))}
                                <td className="px-2 py-1.5">
                                    <button onClick={() => onDel(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={onAdd} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ilinyx-600 hover:text-ilinyx-800 transition-colors px-2 py-1 rounded-lg hover:bg-ilinyx-50">
                <Plus className="h-3.5 w-3.5" /> Agregar fila
            </button>
        </div>
    );
}

// ── Wrapper de sección ─────────────────────────────────────────────
function Section({ num, title, hint, children }) {
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
