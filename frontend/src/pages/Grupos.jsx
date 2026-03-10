import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Loader2, ChevronLeft, ChevronRight, Users2 } from 'lucide-react';
import { getGrupos, deleteGrupo, getTeachers } from '../services/api';
import GrupoModal from '../components/grupos/GrupoModal';

export default function GruposPage() {
    const [grupos, setGrupos] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    const notify = (msg, type = 'success') => setToast({ msg, type });

    const loadAll = async () => {
        setLoading(true);
        try {
            const [g, t] = await Promise.all([getGrupos(), getTeachers()]);
            setGrupos(g.data);
            setTeachers(t.data);
        } catch { notify('Error cargando datos', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadAll(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este grupo?')) return;
        try {
            await deleteGrupo(id);
            setGrupos(prev => prev.filter(g => g.id !== id));
            notify('Grupo eliminado');
        } catch { notify('Error al eliminar', 'error'); }
    };

    const totalPages = Math.max(1, Math.ceil(grupos.length / PER_PAGE));
    const pageData = grupos.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Cohortes / Grupos</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Administra los grupos académicos y asigna asesores de cohorte</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-ilinyx-700/20 transition-all active:scale-95">
                    <Plus className="h-4 w-4" /> Nuevo Grupo
                </button>
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
                                    {['Cohorte', 'Asesor', 'Fecha Inicio', 'Características', 'Acciones'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pageData.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <Users2 className="h-10 w-10 opacity-30" />
                                            <p className="text-sm">No hay grupos registrados. Crea el primero.</p>
                                        </div>
                                    </td></tr>
                                ) : pageData.map(grupo => {
                                    const asesor = teachers.find(t => String(t.id) === String(grupo.advisor_id));
                                    return (
                                        <tr key={grupo.id} className="hover:bg-ilinyx-50/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
                                                    <span className="w-2 h-2 rounded-full bg-ilinyx-500 flex-shrink-0" />
                                                    {grupo.name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {asesor ? `${asesor.first_name} ${asesor.last_name}` : (grupo.advisor_name || <span className="text-slate-400 italic">Sin asignar</span>)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{new Date(grupo.date).toLocaleDateString('es-ES')}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{grupo.features || grupo.description || '—'}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleDelete(grupo.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
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

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <GrupoModal teachers={teachers} onClose={() => setShowModal(false)}
                        onSaved={grupo => { setGrupos(prev => [grupo, ...prev]); setShowModal(false); notify('Grupo/Cohorte guardado'); }}
                        notify={notify} />
                )}
            </AnimatePresence>

            {/* Toast inline */}
            {toast && (
                <div className={`fixed bottom-5 right-5 z-[9999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
                    onAnimationEnd={() => setTimeout(() => setToast(null), 2500)}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
