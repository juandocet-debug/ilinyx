/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Printer, ChevronLeft, ChevronRight, FileText,
    UserPlus, Save, Eye, PenLine, Search, Loader2, CheckCircle2, X,
    BookOpen, MessageCircle, Send, Users, Upload
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import {
    searchUsers, getAgonCourses,
    getActasReunion, createActaReunion, updateActaReunion, deleteActaReunion,
    getMisActasReunion, firmarActaReunion, comentarActaReunion,
} from '../services/api';

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
    comentarios: [],
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

    const ROLE_ES = { ADMIN: 'Administrador', TEACHER: 'Docente', STUDENT: 'Estudiante', COORDINATOR: 'Coordinador' };

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (q.length < 2 || q === 'N/A') { setResults([]); setOpen(false); return; }
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
                            const avatar = user.photo || null;
                            const rolEs = ROLE_ES[user.role] || user.role || '';
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
                                        {rolEs && <p className="text-xs text-ilinyx-500 font-medium">{rolEs}</p>}
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
// MODAL PARA IMPORTAR CLASE DESDE AGON
// ══════════════════════════════════════════════════════════════════
function CourseImportModal({ open, onClose, onImport }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        getAgonCourses()
            .then(({ data }) => setCourses(Array.isArray(data) ? data : []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, [open]);

    const filtered = courses.filter(c =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.code.toLowerCase().includes(filter.toLowerCase()) ||
        c.teacher_name.toLowerCase().includes(filter.toLowerCase())
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-ilinyx-600" /> Importar clase desde AGON
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Selecciona una clase para agregar todos sus estudiantes</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
                </div>

                <div className="px-5 py-3 border-b border-slate-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input value={filter} onChange={e => setFilter(e.target.value)}
                            placeholder="Buscar clase por nombre, código o docente..."
                            className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 text-ilinyx-500 animate-spin" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            {courses.length === 0 ? 'No se pudieron cargar las clases' : 'No hay clases que coincidan'}
                        </div>
                    ) : (
                        filtered.map(course => (
                            <button key={course.id} onClick={() => { onImport(course); onClose(); }}
                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-ilinyx-50 transition-colors mb-1 border border-transparent hover:border-ilinyx-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{course.name}</p>
                                        <p className="text-xs text-slate-500">{course.code} · {course.teacher_name} · {course.year}-{course.period}</p>
                                    </div>
                                    <span className="flex items-center gap-1 bg-ilinyx-50 text-ilinyx-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                        <Users className="h-3 w-3" /> {course.student_count}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}


// ══════════════════════════════════════════════════════════════════
// TABLA DINÁMICA DE PERSONAS (con autocomplete + importar clase)
// ══════════════════════════════════════════════════════════════════
function PeopleTable({ rows, onChange, onAdd, onDel, emptyRow, onImportCourse }) {
    return (
        <div className="space-y-2">
            <div className="rounded-xl border border-slate-200 overflow-visible">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12"></th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre completo</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargo / Dependencia</th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                                <td className="px-2 py-2">
                                    {row.foto
                                        ? <img src={row.foto} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow" />
                                        : row.nombre && row.nombre !== 'N/A'
                                            ? <div className="w-9 h-9 rounded-full bg-ilinyx-100 flex items-center justify-center text-ilinyx-600 font-bold text-[10px]">
                                                {row.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                            </div>
                                            : <div className="w-9 h-9 rounded-full bg-slate-100 border border-dashed border-slate-300" />
                                    }
                                </td>
                                <td className="px-2 py-2">
                                    <UserAutocomplete
                                        value={row.nombre}
                                        onChangeName={val => onChange(i, 'nombre', val)}
                                        onSelect={(user, name) => {
                                            const ROLE_ES = { ADMIN: 'Administrador', TEACHER: 'Docente', STUDENT: 'Estudiante', COORDINATOR: 'Coordinador' };
                                            onChange(i, 'nombre', name);
                                            onChange(i, 'cargo', ROLE_ES[user.role] || user.role || user.cargo || '');
                                            onChange(i, 'email', user.email || '');
                                            onChange(i, 'user_id', user.id);
                                            onChange(i, 'foto', user.photo || '');
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
            <div className="flex items-center gap-2">
                <button onClick={() => onAdd(emptyRow)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ilinyx-600 hover:text-ilinyx-800 transition-colors px-2 py-1 rounded-lg hover:bg-ilinyx-50">
                    <Plus className="h-3.5 w-3.5" /> Agregar fila
                </button>
                {onImportCourse && (
                    <button onClick={onImportCourse} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50">
                        <Users className="h-3.5 w-3.5" /> Importar grupo o clase
                    </button>
                )}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// FIRMA PAD — dibujar con dedo/mouse o subir imagen
// ══════════════════════════════════════════════════════════════════
function SignaturePad({ open, onClose, onConfirm, userName }) {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [signatureUrl, setSignatureUrl] = useState(null);

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches?.[0];
        return { x: (touch?.clientX || e.clientX) - rect.left, y: (touch?.clientY || e.clientY) - rect.top };
    };

    const startDraw = (e) => { e.preventDefault(); setDrawing(true); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const draw = (e) => { if (!drawing) return; e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke(); setHasDrawn(true); };
    const stopDraw = () => setDrawing(false);

    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHasDrawn(false); setSignatureUrl(null);
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { setSignatureUrl(ev.target.result); setHasDrawn(false); };
        reader.readAsDataURL(file);
    };

    const handleConfirm = () => {
        let firmaData;
        if (signatureUrl) {
            firmaData = signatureUrl;
        } else if (hasDrawn && canvasRef.current) {
            firmaData = canvasRef.current.toDataURL('image/png');
        } else {
            firmaData = userName; // Texto como fallback
        }
        onConfirm(firmaData);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Firmar Acta</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-500">Dibuja tu firma o sube una imagen</p>

                    {!signatureUrl ? (
                        <div className="relative">
                            <canvas ref={canvasRef} width={360} height={150}
                                className="w-full border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-crosshair touch-none"
                                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                            {!hasDrawn && <p className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm pointer-events-none">Dibuja aquí con el dedo o mouse</p>}
                        </div>
                    ) : (
                        <div className="border-2 border-slate-200 rounded-xl p-3 bg-slate-50 text-center">
                            <img src={signatureUrl} alt="Firma" className="max-h-[150px] mx-auto" />
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button onClick={clearCanvas} className="text-xs text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100">
                            Limpiar
                        </button>
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-ilinyx-600 hover:text-ilinyx-800 px-3 py-1.5 rounded-lg hover:bg-ilinyx-50 cursor-pointer">
                            <Upload className="h-3.5 w-3.5" /> Subir imagen
                            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                    <button onClick={handleConfirm} disabled={!hasDrawn && !signatureUrl}
                        className="px-5 py-2 text-sm font-bold bg-ilinyx-700 text-white rounded-xl hover:bg-ilinyx-800 shadow disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                        <PenLine className="h-4 w-4 inline mr-1.5" /> Confirmar firma
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function ActasPage() {
    const { user } = useUser();
    const [view, setView] = useState('list'); // 'list' | 'form' | 'preview' | 'mis'
    const [actas, setActas] = useState([]);
    const [myActas, setMyActas] = useState([]);
    const [current, setCurrent] = useState(null);
    const [step, setStep] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [expandedComments, setExpandedComments] = useState(null);
    const [signingActaId, setSigningActaId] = useState(null);
    const [loading, setLoading] = useState(false);

    // ── Permisos por rol ──
    const isStudent = user?.role === 'STUDENT';

    // ── Cargar actas desde el backend ──
    const loadActas = async () => {
        setLoading(true);
        try {
            const [res, misRes] = await Promise.all([
                getActasReunion().catch(() => ({ data: [] })),
                getMisActasReunion().catch(() => ({ data: [] })),
            ]);
            setActas(res.data || []);
            setMyActas(misRes.data || []);
        } catch (e) { console.error('Error cargando actas:', e); }
        setLoading(false);
    };

    useEffect(() => { loadActas(); }, []);

    const handleNew = () => { if (isStudent) return; setCurrent(mkActa()); setStep(0); setView('form'); };
    const handleEdit = (a) => { if (isStudent) return; setCurrent({ ...a }); setStep(0); setView('form'); };

    const handleDelete = async (id) => {
        if (isStudent) return;
        if (!confirm('¿Eliminar esta acta?')) return;
        try {
            await deleteActaReunion(id);
            await loadActas();
        } catch (e) { console.error('Error eliminando:', e); alert('Error al eliminar el acta.'); }
    };

    const handleSave = async () => {
        if (!current) return;
        try {
            if (current.id && typeof current.id === 'number') {
                // Ya existe en BD → actualizar
                await updateActaReunion(current.id, current);
            } else {
                // Nueva → crear (quitar id temporal)
                const { id, ...data } = current;
                await createActaReunion(data);
            }
            await loadActas();
            setView('list');
        } catch (e) {
            console.error('Error guardando acta:', e);
            alert('Error al guardar. Revisa la conexión.');
        }
    };

    const handleSign = (actaId) => { setSigningActaId(actaId); };
    const confirmSign = async (firmaData) => {
        if (!signingActaId) return;
        try {
            await firmarActaReunion(signingActaId, firmaData, new Date().toLocaleDateString('es-ES'));
            await loadActas();
        } catch (e) {
            console.error('Error firmando:', e);
            const msg = e.response?.data?.detail || 'Error al firmar';
            alert(msg);
        }
        setSigningActaId(null);
    };

    const handleAddComment = async (actaId) => {
        if (!commentText.trim()) return;
        try {
            await comentarActaReunion(actaId, commentText.trim(), new Date().toISOString());
            await loadActas();
            setCommentText('');
        } catch (e) {
            console.error('Error comentando:', e);
            alert('Error al enviar comentario');
        }
    };

    // Estudiantes empiezan en "Mis Actas"
    useEffect(() => { if (isStudent && view === 'list') setView('mis'); }, [isStudent]);

    if (view === 'preview' && current) return <PrintView acta={current} onBack={() => setView(isStudent ? 'mis' : 'form')} />;
    if (view === 'form' && current && !isStudent) return (
        <FormView acta={current} step={step} setStep={setStep} user={user}
            onChange={setCurrent} onSave={handleSave}
            onPreview={() => setView('preview')} onBack={() => setView('list')} />
    );

    // ── LIST / MIS ACTAS VIEW ──
    return (<>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Actas de Reunión</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Formato FOR023GDC · Universidad Pedagógica Nacional</p>
                </div>
                {!isStudent && (
                    <button onClick={handleNew} className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95">
                        <Plus className="h-4 w-4" /> Nueva Acta
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {(isStudent ? ['Mis Actas'] : ['Todas las Actas', 'Mis Actas']).map((t, i) => {
                    const tabView = isStudent ? 'mis' : (i === 0 ? 'list' : 'mis');
                    return (
                        <button key={t} onClick={() => setView(tabView)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === tabView ? 'bg-white text-ilinyx-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {t} {t === 'Mis Actas' && myActas.length > 0 && <span className="ml-1 bg-ilinyx-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{myActas.length}</span>}
                        </button>
                    );
                })}
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
                                                {(() => {
                                                    const totalP = (a.asistentes?.filter(x => x.nombre && x.nombre !== 'N/A').length || 0) + (a.invitados?.filter(x => x.nombre && x.nombre !== 'N/A').length || 0);
                                                    const totalF = a.firmas?.length || 0;
                                                    const done = totalF >= totalP && totalP > 0;
                                                    return (
                                                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            <CheckCircle2 className={`h-3.5 w-3.5 ${done ? 'text-emerald-500' : 'text-amber-400'}`} />
                                                            {totalF}/{totalP}
                                                        </span>
                                                    );
                                                })()}
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
                                const comments = a.comentarios || [];
                                const isExpanded = expandedComments === a.id;
                                const totalPeople = (a.asistentes?.filter(x => x.nombre && x.nombre !== 'N/A').length || 0) + (a.invitados?.filter(x => x.nombre && x.nombre !== 'N/A').length || 0);
                                const totalFirmas = a.firmas?.length || 0;
                                return (
                                    <div key={a.id} className="px-6 py-4 hover:bg-ilinyx-50/20 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <p className="font-semibold text-slate-800">Acta No. {a.numero || '–'} / {a.total || '–'}</p>
                                                <p className="text-sm text-slate-500">{a.fecha} · {a.lugar}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-slate-400">{a.instancias}</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${totalFirmas >= totalPeople && totalPeople > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        ✍️ {totalFirmas}/{totalPeople} firmas
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setExpandedComments(isExpanded ? null : a.id)}
                                                    className={`p-2 rounded-lg transition-colors relative ${isExpanded ? 'bg-ilinyx-100 text-ilinyx-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                                    title="Comentarios">
                                                    <MessageCircle className="h-4 w-4" />
                                                    {comments.length > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-ilinyx-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{comments.length}</span>
                                                    )}
                                                </button>
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
                                        {/* Comentarios expandibles */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden">
                                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                            <MessageCircle className="h-3.5 w-3.5" /> Comentarios ({comments.length})
                                                        </p>
                                                        {comments.length === 0 && <p className="text-sm text-slate-400 mb-3">No hay comentarios aún.</p>}
                                                        {comments.length > 0 && (
                                                            <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
                                                                {comments.map(c => {
                                                                    const ROLE_ES = { ADMIN: 'Admin', TEACHER: 'Docente', STUDENT: 'Estudiante' };
                                                                    return (
                                                                        <div key={c.id} className="flex gap-2.5">
                                                                            {c.user_foto
                                                                                ? <img src={c.user_foto} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white shadow-sm mt-0.5" />
                                                                                : <div className="w-7 h-7 rounded-full bg-ilinyx-100 flex items-center justify-center text-ilinyx-600 font-bold text-[9px] flex-shrink-0 mt-0.5">
                                                                                    {c.user_name?.split(' ').map(w => w[0]).slice(0, 2).join('') || '?'}
                                                                                </div>
                                                                            }
                                                                            <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                                    <span className="text-xs font-bold text-slate-700">{c.user_name}</span>
                                                                                    <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">{ROLE_ES[c.user_role] || c.user_role}</span>
                                                                                    <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                                                </div>
                                                                                <p className="text-sm text-slate-600">{c.text}</p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2">
                                                            <input value={commentText} onChange={e => setCommentText(e.target.value)}
                                                                onKeyDown={e => { if (e.key === 'Enter') handleAddComment(a.id); }}
                                                                placeholder="Escribe un comentario..."
                                                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500" />
                                                            <button onClick={() => handleAddComment(a.id)} disabled={!commentText.trim()}
                                                                className="p-2.5 rounded-xl bg-ilinyx-700 text-white hover:bg-ilinyx-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95">
                                                                <Send className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>

        {/* Modal de firma */}
        <SignaturePad
            open={!!signingActaId}
            onClose={() => setSigningActaId(null)}
            onConfirm={confirmSign}
            userName={user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''}
        />
    </>);
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
            }).map(r => ({
                nombre: r.nombre,
                firma: '',
                user_id: r.user_id || null,
                fecha: '',
            }));
            if (toAdd.length === 0) return p;
            return { ...p, firmas: [...(p.firmas || []), ...toAdd] };
        });
    }, [step]);

    // Modal para importar clase
    const [importTarget, setImportTarget] = useState(null); // 'asistentes' | 'ausentes' | 'invitados' | null

    const handleCourseImport = (course) => {
        if (!importTarget || !course.students?.length) return;
        const ROLE_ES = { ADMIN: 'Administrador', TEACHER: 'Docente', STUDENT: 'Estudiante' };

        if (importTarget === 'firmas_import') {
            // Importar como firmas pendientes
            const newFirmas = course.students.map(s => ({
                nombre: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
                firma: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
                user_id: s.id,
                fecha: new Date().toLocaleDateString('es-ES'),
            }));
            onChange(p => {
                const existingIds = new Set((p.firmas || []).map(f => f.user_id).filter(Boolean));
                const toAdd = newFirmas.filter(f => !existingIds.has(f.user_id));
                return { ...p, firmas: [...(p.firmas || []), ...toAdd] };
            });
        } else {
            // Importar como filas de personas
            const newRows = course.students.map(s => ({
                nombre: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
                cargo: ROLE_ES[s.role] || s.role || '',
                email: s.email || '',
                user_id: s.id,
                foto: s.photo || '',
            }));
            onChange(p => {
                const existing = p[importTarget].filter(r => r.nombre && r.nombre !== 'N/A' && r.nombre.trim() !== '');
                const existingIds = new Set(existing.map(r => r.user_id).filter(Boolean));
                const toAdd = newRows.filter(r => !existingIds.has(r.user_id));
                return { ...p, [importTarget]: [...existing, ...toAdd] };
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
                                onDel={i => delRow('asistentes', i)}
                                onImportCourse={() => setImportTarget('asistentes')} />
                        </Sec>

                        {/* Sección 3 */}
                        <Sec num="3" title="Ausentes" hint="N/A si no aplica">
                            <PeopleTable rows={acta.ausentes} emptyRow={{ nombre: 'N/A', cargo: '', email: '', user_id: null, foto: '' }}
                                onChange={(i, k, v) => setRow('ausentes', i, k, v)}
                                onAdd={r => addRow('ausentes', r)}
                                onDel={i => delRow('ausentes', i)}
                                onImportCourse={() => setImportTarget('ausentes')} />
                        </Sec>

                        {/* Sección 4 */}
                        <Sec num="4" title="Invitados" hint="N/A si no aplica">
                            <PeopleTable rows={acta.invitados} emptyRow={{ nombre: 'N/A', cargo: '', email: '', user_id: null, foto: '' }}
                                onChange={(i, k, v) => setRow('invitados', i, k, v)}
                                onAdd={r => addRow('invitados', r)}
                                onDel={i => delRow('invitados', i)}
                                onImportCourse={() => setImportTarget('invitados')} />
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
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsable</th>
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
                            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-ilinyx-50 rounded-xl border border-ilinyx-100">
                                <button onClick={addMySig} className="inline-flex items-center gap-2 bg-ilinyx-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-ilinyx-800 transition-all shadow">
                                    <UserPlus className="h-4 w-4" /> Agregar mi firma
                                </button>
                                <button onClick={() => setImportTarget('firmas_import')} className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-emerald-700 transition-all shadow">
                                    <Users className="h-4 w-4" /> Importar grupo o clase
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

            {/* Modal importar clase */}
            <CourseImportModal
                open={!!importTarget}
                onClose={() => setImportTarget(null)}
                onImport={handleCourseImport}
            />
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
