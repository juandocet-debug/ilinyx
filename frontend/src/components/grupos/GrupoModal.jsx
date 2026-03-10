import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { createGrupo } from '../../services/api';

/**
 * Modal para crear un nuevo grupo/cohorte.
 * Extraído de Grupos.jsx para mantener el archivo principal enfocado.
 */
export default function GrupoModal({ teachers, onClose, onSaved, notify }) {
    const [form, setForm] = useState({
        name: '', date: '', description: '', features: '', advisor_id: '', advisor_name: '',
    });
    const [saving, setSaving] = useState(false);

    const handleTeacher = (id) => {
        const t = teachers.find(t => String(t.id) === String(id));
        setForm(f => ({ ...f, advisor_id: id, advisor_name: t ? `${t.first_name} ${t.last_name}` : '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.date) { notify('Nombre y fecha son obligatorios.', 'error'); return; }
        setSaving(true);
        try {
            const { data } = await createGrupo(form);
            onSaved(data);
        } catch { notify('Error al guardar el grupo.', 'error'); }
        finally { setSaving(false); }
    };

    const labelCls = 'block text-xs font-semibold text-slate-600 mb-1';
    const inputCls = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-500/20 focus:border-ilinyx-500 transition-all';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Nuevo Grupo / Cohorte</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="px-6 py-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={labelCls}>Nombre de cohorte (ej. 2025-2) <span className="text-red-500">*</span></label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="2025-2" className={inputCls} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Fecha de inicio <span className="text-red-500">*</span></label>
                                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Asesor de cohorte</label>
                                <select value={form.advisor_id} onChange={e => handleTeacher(e.target.value)} className={inputCls}>
                                    <option value="">— Sin asignar —</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Descripción</label>
                            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Características, condiciones y elementos del grupo</label>
                            <textarea rows={3} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} className={inputCls}
                                placeholder="Investigación aplicada, enfoque en..." />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose}
                                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-5 py-2.5 rounded-xl transition-all">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving}
                                className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-60">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar Grupo
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
}
