/* eslint-disable */
// components/actas/CourseImportModal.jsx
// Modal que permite importar todos los estudiantes de una clase de AGON.

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, BookOpen, Users, Loader2 } from 'lucide-react';
import { getAgonCourses } from '../../services/api';

export default function CourseImportModal({ open, onClose, onImport }) {
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
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 text-ilinyx-500 animate-spin" />
                        </div>
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
