/* eslint-disable */
// pages/Actas.jsx
// Orquestador principal de la sección de Actas de Reunión.
// Toda la lógica de datos está en hooks/useActas.js.
// Los componentes visuales están en components/actas/ y pages/Actas*.jsx.

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, PenLine, Calendar, Filter } from 'lucide-react';

import { useUser } from '../context/UserContext';
import { useActas } from '../hooks/useActas';
import ToastContainer, { useToast } from '../components/ui/Toast';
import ConfirmDialog, { useConfirm } from '../components/ui/ConfirmDialog';
import SignaturePad from '../components/actas/SignaturePad';
import GestionFirmaModal from '../components/actas/GestionFirmaModal';
import ActasForm from './ActasForm';
import ActasPrintView from './ActasPrintView';

// ── Factory de acta vacía ────────────────────────────────────────────
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
    firmas: [], comentarios: [],
});

// ── Tarjeta de acta en el listado ────────────────────────────────────
function ActaCard({ acta, userId, onEdit, onDelete, onView, onSign, onComment }) {
    const totalFirmas = (acta.firmas || []).length;
    const firmasHechas = (acta.firmas || []).filter(f => f.firmado).length;
    const miEntry = (acta.firmas || []).find(f => f.user_id && (f.user_id === userId || String(f.user_id) === String(userId)));
    const yoFirme = miEntry?.firmado;

    const [commentText, setCommentText] = useState('');

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                        {acta.numero ? `Acta ${acta.numero}` : 'Sin número'} · {acta.tipo}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {acta.fecha || 'Sin fecha'} · {acta.lugar || 'Sin lugar'}
                    </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onView(acta)} className="p-1.5 rounded-lg hover:bg-ilinyx-50 text-ilinyx-600 transition-colors text-xs font-semibold">Ver</button>
                    {onEdit && <button onClick={() => onEdit(acta)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors text-xs">Editar</button>}
                    {onDelete && <button onClick={() => onDelete(acta.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors text-xs">Eliminar</button>}
                </div>
            </div>

            {/* Progreso de firmas */}
            {totalFirmas > 0 && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Firmas</span>
                        <span className="font-semibold">{firmasHechas}/{totalFirmas}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(firmasHechas / totalFirmas) * 100}%` }} />
                    </div>
                </div>
            )}

            {/* Botón firma propia */}
            {miEntry && !yoFirme && (
                <button onClick={() => onSign(acta.id)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow">
                    ✍️ Firmar ahora
                </button>
            )}
            {yoFirme && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    ✓ Firmaste este acta
                </span>
            )}

            {/* Comentarios */}
            {onComment && (
                <div className="flex gap-2 pt-1 border-t border-slate-50">
                    <input value={commentText} onChange={e => setCommentText(e.target.value)}
                        placeholder="Comentar..." onKeyDown={e => { if (e.key === 'Enter' && commentText.trim()) { onComment(acta.id, commentText); setCommentText(''); } }}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-300/30 focus:border-ilinyx-400" />
                    <button onClick={() => { if (commentText.trim()) { onComment(acta.id, commentText); setCommentText(''); } }}
                        className="px-3 py-1.5 text-xs font-semibold bg-ilinyx-600 text-white rounded-lg hover:bg-ilinyx-700">
                        Enviar
                    </button>
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ════════════════════════════════════════════════════════════════════
export default function ActasPage() {
    const { user } = useUser();
    const { toasts, addToast } = useToast();
    const { dlg: confirmDlg, show: showConfirm, close: closeConfirm } = useConfirm();

    const {
        actas, misActas, loading,
        firmaPersonal, setFirmaPersonal,
        loadActas, saveActa, deleteActa,
        firmarActa, guardarFirmaPersonal, comentar,
        pendingCount, availableYears,
    } = useActas(user, addToast);

    // ── Navegación ──────────────────────────────────────────────────
    const [view, setView] = useState('list');  // 'list' | 'form' | 'preview' | 'mis'
    const [prevView, setPrevView] = useState('list');
    const [current, setCurrent] = useState(null);
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);

    // ── Firma ───────────────────────────────────────────────────────
    const [signingActaId, setSigningActaId] = useState(null);
    const [showGestionFirma, setShowGestionFirma] = useState(false);

    // ── Filtros Mis Actas ──────────────────────────────────────────
    const [misFilter, setMisFilter] = useState('todas');
    const [misYear, setMisYear] = useState('');
    const [misSearch, setMisSearch] = useState('');

    const isStudent = user?.role === 'STUDENT';

    // Los estudiantes solo ven "Mis Actas"
    useEffect(() => { if (isStudent && view === 'list') setView('mis'); }, [isStudent]);

    // ── Acciones CRUD ───────────────────────────────────────────────
    const handleNew = () => { if (isStudent) return; setCurrent(mkActa()); setStep(0); setView('form'); };
    const handleEdit = (a) => {
        if (isStudent) return;
        const isCreator = a.creador_id && String(a.creador_id) === String(user?.id);
        if (!isCreator) { addToast('Solo el creador puede editar este acta', 'warning'); return; }
        setCurrent({ ...a }); setStep(0); setView('form');
    };
    const handleView = (a) => { setCurrent({ ...a }); setPrevView(view); setView('preview'); };
    const handleDelete = (id) => {
        if (isStudent) return;
        showConfirm(
            'Eliminar Acta',
            '¿Estás seguro? Esta acción no se puede deshacer.',
            async () => { closeConfirm(); await deleteActa(id); },
            true,
        );
    };
    const handleSave = async () => {
        setSaving(true);
        const ok = await saveActa(current);
        setSaving(false);
        if (ok) setView('list');
        // Si falla, el usuario se queda en el formulario — no pierde su trabajo
    };

    // ── Firma ───────────────────────────────────────────────────────
    const handleSign = (actaId) => {
        if (firmaPersonal) {
            firmarActa(actaId, firmaPersonal);
        } else {
            setSigningActaId(actaId);
        }
    };
    const confirmSign = async (firmaData) => {
        await firmarActa(signingActaId, firmaData);
        setSigningActaId(null);
    };

    // ── Mis Actas filtradas ─────────────────────────────────────────
    const myActas = useMemo(() => {
        let list = misActas;
        const uid = user?.id;
        if (misFilter === 'pendientes') {
            list = list.filter(a => {
                const e = a.firmas?.find(f => f.user_id && (f.user_id === uid || String(f.user_id) === String(uid)));
                return !e?.firmado;
            });
        } else if (misFilter === 'firmadas') {
            list = list.filter(a => {
                const e = a.firmas?.find(f => f.user_id && (f.user_id === uid || String(f.user_id) === String(uid)));
                return e?.firmado === true;
            });
        }
        if (misYear) list = list.filter(a => (a.fecha || '').includes(misYear));
        if (misSearch.trim()) {
            const q = misSearch.toLowerCase();
            list = list.filter(a =>
                (a.numero || '').toLowerCase().includes(q) ||
                (a.lugar || '').toLowerCase().includes(q) ||
                (a.instancias || '').toLowerCase().includes(q) ||
                (a.orden_dia || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [misActas, misFilter, misYear, misSearch, user]);

    // ── Renders condicionales ───────────────────────────────────────
    if (view === 'preview' && current) {
        return <ActasPrintView acta={current} onBack={() => setView(prevView)} />;
    }
    if (view === 'form' && current && !isStudent) {
        return (
            <ActasForm
                acta={current} step={step} setStep={setStep} user={user}
                onChange={setCurrent} onSave={handleSave} saving={saving}
                onPreview={() => { setPrevView('form'); setView('preview'); }}
                onBack={() => setView('list')}
            />
        );
    }

    // ── Lista / Mis Actas ───────────────────────────────────────────
    return (<>
        <ToastContainer toasts={toasts} />
        <ConfirmDialog {...confirmDlg} onCancel={closeConfirm} />
        <SignaturePad open={!!signingActaId} onClose={() => setSigningActaId(null)} onConfirm={confirmSign} userName={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()} />
        {showGestionFirma && (
            <GestionFirmaModal
                firmaActual={firmaPersonal}
                onSave={async (data) => { await guardarFirmaPersonal(data); setShowGestionFirma(false); }}
                onDelete={() => setFirmaPersonal(null)}
                onClose={() => setShowGestionFirma(false)}
            />
        )}

        <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Actas de Reunión</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Formato FOR023GDC · Universidad Pedagógica Nacional</p>
                </div>
                {!isStudent && (
                    <button onClick={handleNew}
                        className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95">
                        <Plus className="h-4 w-4" /> Nueva Acta
                    </button>
                )}
            </div>

            {/* Tabs + firma */}
            <div className="flex items-center gap-3">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                    {(isStudent ? ['Mis Actas'] : ['Todas las Actas', 'Mis Actas']).map((t, i) => {
                        const tabView = isStudent ? 'mis' : (i === 0 ? 'list' : 'mis');
                        return (
                            <button key={t} onClick={() => setView(tabView)}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === tabView ? 'bg-white text-ilinyx-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {t} {t === 'Mis Actas' && myActas.length > 0 && (
                                    <span className="ml-1 bg-ilinyx-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{myActas.length}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <button onClick={() => setShowGestionFirma(true)}
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${firmaPersonal ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}>
                    <PenLine className="h-3.5 w-3.5" />
                    {firmaPersonal ? 'Mi firma ✓' : 'Configurar firma'}
                </button>
            </div>

            {/* Filtros Mis Actas */}
            {view === 'mis' && (
                <div className="flex flex-wrap items-center gap-2">
                    {[{ key: 'todas', label: 'Todas' }, { key: 'pendientes', label: 'Por firmar', badge: pendingCount }, { key: 'firmadas', label: 'Firmadas' }].map(f => (
                        <button key={f.key} onClick={() => setMisFilter(f.key)}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${misFilter === f.key ? 'bg-ilinyx-700 text-white border-ilinyx-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-ilinyx-300 hover:text-ilinyx-700'}`}>
                            {f.label}
                            {(f.badge > 0) && <span className={`ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${misFilter === f.key ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>{f.badge}</span>}
                        </button>
                    ))}
                    {availableYears.length > 0 && (
                        <select value={misYear} onChange={e => setMisYear(e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-ilinyx-300/30">
                            <option value="">Todos los años</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    )}
                    <input value={misSearch} onChange={e => setMisSearch(e.target.value)}
                        placeholder="Buscar…"
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-ilinyx-300/30 w-36" />
                </div>
            )}

            {/* Grilla de actas */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : (view === 'list' ? actas : myActas).length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <p className="text-4xl mb-3">📄</p>
                    <p className="font-semibold">{view === 'list' ? 'No hay actas creadas' : 'No tienes actas asignadas'}</p>
                    {!isStudent && view === 'list' && (
                        <button onClick={handleNew} className="mt-4 inline-flex items-center gap-2 bg-ilinyx-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow text-sm hover:bg-ilinyx-800 transition-all">
                            <Plus className="h-4 w-4" /> Crear primera acta
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(view === 'list' ? actas : myActas).map(a => (
                        <ActaCard key={a.id} acta={a} userId={user?.id}
                            onView={handleView}
                            onEdit={view === 'list' ? handleEdit : null}
                            onDelete={view === 'list' ? handleDelete : null}
                            onSign={handleSign}
                            onComment={comentar}
                        />
                    ))}
                </div>
            )}
        </div>
    </>);
}
