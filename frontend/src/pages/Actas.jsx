import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Eye, Trash2, X, Save, FileText,
    ChevronLeft, ChevronRight, Camera, FilePdf, Loader2
} from 'lucide-react';
import {
    getActas, createActa, deleteActa, previewActa,
    getDocumentos, createDocumento, deleteDocumento,
    getGrupos, getTeachers
} from '../services/api';

// ─── Notificación flotante ────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, []);
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-5 right-5 z-[9999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl
        ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {msg}
        </motion.div>
    );
}

// ─── Tab control ─────────────────────────────────────────────────────────────
const TABS = [
    { key: 'actas', label: 'Actas' },
    { key: 'documentos', label: 'Documentos base' },
];

export default function ActasPage() {
    const [tab, setTab] = useState('actas');
    const [actas, setActas] = useState([]);
    const [docs, setDocs] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Modal nuevo acta
    const [showActaModal, setShowActaModal] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [saving, setSaving] = useState(false);

    // Paginación
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    const notify = (msg, type = 'success') => setToast({ msg, type });

    // ── Carga inicial ──────────────────────────────────────────────────────────
    const loadAll = async () => {
        setLoading(true);
        try {
            const [a, d, g, t] = await Promise.all([
                getActas(), getDocumentos(), getGrupos(), getTeachers()
            ]);
            // Normaliza: algunos endpoints devuelven { results: [] } (paginado) y otros array directo
            const toArr = (res) => {
                const d = res.data;
                if (Array.isArray(d)) return d;
                if (d && Array.isArray(d.results)) return d.results;
                return [];
            };
            setActas(toArr(a));
            setDocs(toArr(d));
            setGrupos(toArr(g));
            setTeachers(toArr(t));
        } catch { notify('Error cargando datos', 'error'); }
        finally { setLoading(false); }
    };
    useEffect(() => { loadAll(); }, []);

    // ── Eliminar acta ──────────────────────────────────────────────────────────
    const handleDeleteActa = async (id) => {
        if (!confirm('¿Eliminar este registro?')) return;
        try { await deleteActa(id); setActas(prev => prev.filter(a => a.id !== id)); notify('Acta eliminada'); }
        catch { notify('Error al eliminar', 'error'); }
    };

    const handleDeleteDoc = async (id) => {
        if (!confirm('¿Eliminar este documento?')) return;
        try { await deleteDocumento(id); setDocs(prev => prev.filter(d => d.id !== id)); notify('Documento eliminado'); }
        catch { notify('Error al eliminar', 'error'); }
    };

    // ── Vista previa ──────────────────────────────────────────────────────────
    const handlePreview = async (id) => {
        try { const { data } = await previewActa(id); setPreviewData(data); setShowPreview(true); }
        catch { notify('Error cargando vista previa', 'error'); }
    };

    // ── Paginación ─────────────────────────────────────────────────────────────
    const data = tab === 'actas' ? actas : docs;
    const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
    const pageData = data.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Registro de Actas</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Gestión de actas estudiantiles y documentos base</p>
                </div>
                <button
                    onClick={() => tab === 'actas' ? setShowActaModal(true) : setShowDocModal(true)}
                    className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-ilinyx-700/20 transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    {tab === 'actas' ? 'Nueva Acta' : 'Nuevo Documento'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === t.key ? 'bg-white text-ilinyx-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 text-ilinyx-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {tab === 'actas'
                                        ? ['#', 'Cohorte', 'Docente', 'Fecha', 'Archivos', 'Acciones'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))
                                        : ['#', 'Título', 'Tipo', 'Fecha', 'Propósito', 'Acciones'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pageData.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">No hay registros.</td></tr>
                                ) : pageData.map((item) => (
                                    tab === 'actas' ? (
                                        <tr key={item.id} className="hover:bg-ilinyx-50/30 transition-colors">
                                            <td className="px-4 py-3 text-xs font-mono text-slate-400">#{String(item.id).slice(-4)}</td>
                                            <td className="px-4 py-3 font-medium text-slate-700">{item.group_name || '—'}</td>
                                            <td className="px-4 py-3 text-slate-600 text-sm">{item.advisor_name || '—'}</td>
                                            <td className="px-4 py-3 text-slate-600 text-sm">{new Date(item.date).toLocaleDateString('es-ES')}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs bg-ilinyx-50 text-ilinyx-700 px-2 py-1 rounded-full font-medium">
                                                    {item.file_count} archivo(s)
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 flex items-center gap-2">
                                                <button onClick={() => handlePreview(item.id)}
                                                    className="p-2 rounded-lg bg-ilinyx-50 text-ilinyx-600 hover:bg-ilinyx-100 transition-colors" title="Ver">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDeleteActa(item.id)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Eliminar">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={item.id} className="hover:bg-ilinyx-50/30 transition-colors">
                                            <td className="px-4 py-3 text-xs font-mono text-slate-400">#{item.id}</td>
                                            <td className="px-4 py-3 font-medium text-slate-700">{item.title}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{item.type}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{new Date(item.date).toLocaleDateString('es-ES')}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{item.purpose}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleDeleteDoc(item.id)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Paginación */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Página {page} de {totalPages}</span>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-ilinyx-600 hover:border-ilinyx-300 disabled:opacity-40 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-ilinyx-600 hover:border-ilinyx-300 disabled:opacity-40 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modal Nueva Acta ──────────────────────────────────────── */}
            <AnimatePresence>
                {showActaModal && (
                    <ActaModal
                        docs={docs} grupos={grupos} teachers={teachers}
                        onClose={() => setShowActaModal(false)}
                        onSaved={(acta) => { setActas(prev => [acta, ...prev]); setShowActaModal(false); notify('Acta guardada exitosamente'); }}
                        notify={notify}
                    />
                )}
            </AnimatePresence>

            {/* ── Modal Nuevo Documento ─────────────────────────────────── */}
            <AnimatePresence>
                {showDocModal && (
                    <DocModal
                        onClose={() => setShowDocModal(false)}
                        onSaved={(doc) => { setDocs(prev => [...prev, doc]); setShowDocModal(false); notify('Documento guardado exitosamente'); }}
                        notify={notify}
                    />
                )}
            </AnimatePresence>

            {/* ── Modal Vista Previa ────────────────────────────────────── */}
            <AnimatePresence>
                {showPreview && previewData && (
                    <PreviewModal data={previewData} onClose={() => { setShowPreview(false); setPreviewData(null); }} />
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}

// ─── Modal Nueva Acta ─────────────────────────────────────────────────────────
function ActaModal({ docs, grupos, teachers, onClose, onSaved, notify }) {
    const [form, setForm] = useState({
        linked_doc: '', type: 'Acta Estudiantes', group: '',
        advisor_id: '', advisor_name: '', date: '',
        logros: '', acuerdos: '', sintesis: '',
    });
    const [pdf, setPdf] = useState(null);
    const [photo1, setPhoto1] = useState(null);
    const [photo2, setPhoto2] = useState(null);
    const [photo1Prev, setPhoto1Prev] = useState(null);
    const [photo2Prev, setPhoto2Prev] = useState(null);
    const [saving, setSaving] = useState(false);

    // Auto-completar fecha al elegir documento base (lógica de Recreeo)
    const handleLinkedDoc = (id) => {
        const doc = docs.find(d => String(d.id) === String(id));
        setForm(f => ({ ...f, linked_doc: id, date: doc ? doc.date : f.date }));
    };

    const handleTeacher = (id) => {
        const t = teachers.find(t => String(t.id) === String(id));
        setForm(f => ({ ...f, advisor_id: id, advisor_name: t ? `${t.first_name} ${t.last_name}` : '' }));
    };

    const handlePhoto = (file, setFile, setPreview) => {
        if (!file) return;
        setFile(file);
        const r = new FileReader();
        r.onload = e => setPreview(e.target.result);
        r.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.linked_doc || !form.group || !form.advisor_id || !form.date) {
            notify('Documento base, cohorte, docente y fecha son obligatorios.', 'error'); return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
            if (pdf) fd.append('pdf', pdf);
            if (photo1) fd.append('photo1', photo1);
            if (photo2) fd.append('photo2', photo2);
            const { data } = await createActa(fd);
            onSaved(data);
        } catch { notify('Error al guardar el acta.', 'error'); }
        finally { setSaving(false); }
    };

    return (
        <ModalWrapper title="Nuevo Registro de Acta" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Documento base */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Documento Base <span className="text-red-500">*</span>
                        <span className="text-slate-400 font-normal ml-1">(autocompleta la fecha)</span>
                    </label>
                    <select value={form.linked_doc} onChange={e => handleLinkedDoc(e.target.value)} required
                        className={selectCls}>
                        <option value="">— Seleccionar Documento —</option>
                        {docs.map(d => (
                            <option key={d.id} value={d.id}>{d.title} — {d.type} ({new Date(d.date).toLocaleDateString('es-ES')})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tipo */}
                    <div>
                        <label className={labelCls}>Tipo</label>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={selectCls}>
                            {['Acta Estudiantes', 'Informe', 'Memorando', 'Otro'].map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    {/* Cohorte */}
                    <div>
                        <label className={labelCls}>Cohorte <span className="text-red-500">*</span></label>
                        <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} required className={selectCls}>
                            <option value="">— Seleccionar —</option>
                            {grupos.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    {/* Docente */}
                    <div>
                        <label className={labelCls}>Docente Asignado <span className="text-red-500">*</span></label>
                        <select value={form.advisor_id} onChange={e => handleTeacher(e.target.value)} required className={selectCls}>
                            <option value="">— Seleccionar —</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Fecha */}
                    <div>
                        <label className={labelCls}>Fecha <span className="text-red-500">*</span></label>
                        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className={inputCls} />
                    </div>
                </div>

                {/* Logros, Acuerdos, Síntesis — lógica exacta de Recreeo */}
                <div>
                    <label className={labelCls}>Logros</label>
                    <textarea rows={2} value={form.logros} onChange={e => setForm(f => ({ ...f, logros: e.target.value }))} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Acuerdos</label>
                    <textarea rows={2} value={form.acuerdos} onChange={e => setForm(f => ({ ...f, acuerdos: e.target.value }))} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Compromisos / Síntesis</label>
                    <textarea rows={2} value={form.sintesis} onChange={e => setForm(f => ({ ...f, sintesis: e.target.value }))} className={inputCls} />
                </div>

                {/* Archivos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FileBox label="Acta (PDF)" accept="application/pdf" icon={<FileText className="h-7 w-7 text-slate-300" />}
                        fileName={pdf?.name} onFile={f => setPdf(f)} />
                    <PhotoBox label="Evidencia 1" preview={photo1Prev}
                        onFile={f => handlePhoto(f, setPhoto1, setPhoto1Prev)} />
                    <PhotoBox label="Evidencia 2" preview={photo2Prev}
                        onFile={f => handlePhoto(f, setPhoto2, setPhoto2Prev)} />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className={btnSecondary}>Cancelar</button>
                    <button type="submit" disabled={saving} className={btnPrimary}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Guardar Acta
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
}

// ─── Modal Nuevo Documento ────────────────────────────────────────────────────
function DocModal({ onClose, onSaved, notify }) {
    const [form, setForm] = useState({ title: '', type: 'Informe', date: '', purpose: '' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await createDocumento(form);
            onSaved(data);
        } catch { notify('Error al guardar el documento.', 'error'); }
        finally { setSaving(false); }
    };

    return (
        <ModalWrapper title="Nuevo Documento Base" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelCls}>Título <span className="text-red-500">*</span></label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className={inputCls} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Tipo</label>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={selectCls}>
                            {['Acta Estudiantes', 'Informe', 'Memorando', 'Otro'].map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Fecha <span className="text-red-500">*</span></label>
                        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className={inputCls} />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Propósito del documento <span className="text-red-500">*</span></label>
                    <textarea rows={3} value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required className={inputCls} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className={btnSecondary}>Cancelar</button>
                    <button type="submit" disabled={saving} className={btnPrimary}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Guardar
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
}

// ─── Modal Vista Previa ────────────────────────────────────────────────────────
function PreviewModal({ data, onClose }) {
    return (
        <ModalWrapper title={`Vista Previa — Cohorte ${data.group_name || ''}`} onClose={onClose} wide>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PDF */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Acta PDF</h4>
                    {data.pdf_url
                        ? <iframe src={data.pdf_url} className="w-full h-72 rounded-xl border border-slate-200" title="PDF" />
                        : <div className="w-full h-72 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">Sin PDF adjunto</div>
                    }
                    <div className="mt-4 space-y-3">
                        {[['Logros', data.logros], ['Acuerdos', data.acuerdos], ['Compromisos / Síntesis', data.sintesis]].map(([h, v]) => (
                            <div key={h}>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</p>
                                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 mt-1">{v || '—'}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Detalles */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Detalles</h4>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                        {[
                            ['Tipo', data.type],
                            ['Cohorte', data.group_name],
                            ['Docente', data.advisor_name],
                            ['Fecha', data.date ? new Date(data.date).toLocaleDateString('es-ES') : '—'],
                            ['Propósito (doc. base)', data.linked_doc_purpose],
                        ].map(([label, val]) => (
                            <div key={label} className="flex gap-2">
                                <span className="font-semibold text-slate-500 min-w-[110px]">{label}:</span>
                                <span className="text-slate-700">{val || '—'}</span>
                            </div>
                        ))}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2 mt-4">Evidencias fotográficas</h4>
                    <div className="space-y-2">
                        {[data.photo1_url, data.photo2_url].map((url, i) => url
                            ? <img key={i} src={url} alt={`Evidencia ${i + 1}`} className="w-full rounded-xl object-cover max-h-40" />
                            : <div key={i} className="w-full h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">Sin foto {i + 1}</div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <button onClick={onClose} className={btnSecondary}>Cerrar</button>
            </div>
        </ModalWrapper>
    );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function ModalWrapper({ title, onClose, children, wide = false }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
                className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </motion.div>
        </motion.div>
    );
}

function FileBox({ label, accept, icon, fileName, onFile }) {
    return (
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:border-ilinyx-400 hover:bg-ilinyx-50 transition-all group">
            <input type="file" accept={accept} className="hidden" onChange={e => onFile(e.target.files[0])} />
            {icon}
            <span className="text-xs text-slate-500 mt-2 text-center px-2 group-hover:text-ilinyx-600 transition-colors">
                {fileName || label}
            </span>
        </label>
    );
}

function PhotoBox({ label, preview, onFile }) {
    return (
        <label className="relative flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:border-ilinyx-400 hover:bg-ilinyx-50 transition-all overflow-hidden">
            <input type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files[0])} />
            {preview
                ? <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                : <>
                    <Camera className="h-7 w-7 text-slate-300" />
                    <span className="text-xs text-slate-500 mt-2">{label}</span>
                </>
            }
        </label>
    );
}

// Clases reutilizables
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1';
const inputCls = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-500/20 focus:border-ilinyx-500 transition-all';
const selectCls = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-500/20 focus:border-ilinyx-500 transition-all';
const btnPrimary = 'inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-60';
const btnSecondary = 'inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-5 py-2.5 rounded-xl transition-all';
