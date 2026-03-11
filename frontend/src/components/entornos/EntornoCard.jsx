import React from 'react';
import { Users2, Calendar, ChevronRight, BookOpen } from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : null;

export default function EntornoCard({ entorno, onClick }) {
    const cortes      = entorno.cortes || [];
    const totalEntregables = cortes.reduce((acc, c) => acc + (c.entregables?.length || 0), 0);
    const activos     = cortes.reduce((acc, c) => acc + (c.entregables?.filter(e => e.activo).length || 0), 0);
    const grupos      = entorno.grupos_nombres?.length || entorno.grupos_agon_ids?.length || 0;

    // Calcular progreso (entregables activos / total)
    const progreso = totalEntregables > 0 ? Math.round((activos / totalEntregables) * 100) : 0;

    return (
        <button onClick={onClick}
            className="group relative w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden active:scale-[0.98]">

            {/* Accent bar top */}
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${entorno.color}, ${entorno.color}88)` }} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Ícono */}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: `${entorno.color}18`, border: `1.5px solid ${entorno.color}30` }}>
                        <BookOpen className="h-5 w-5" style={{ color: entorno.color }} />
                    </div>
                    {/* Semestre badge */}
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${entorno.color}15`, color: entorno.color }}>
                        {entorno.semestre || 'Sin semestre'}
                    </span>
                </div>

                {/* Nombre */}
                <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-ilinyx-700 transition-colors">
                    {entorno.nombre}
                </h3>
                {entorno.descripcion && (
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{entorno.descripcion}</p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <Users2 className="h-3.5 w-3.5" /> {grupos} grupo{grupos !== 1 ? 's' : ''}
                    </span>
                    {entorno.fecha_inicio && (
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {fmtDate(entorno.fecha_inicio)}
                            {entorno.fecha_fin && <> → {fmtDate(entorno.fecha_fin)}</>}
                        </span>
                    )}
                </div>

                {/* Cortes: dots numerados */}
                {cortes.length > 0 && (
                    <div className="flex items-center gap-2 mt-4">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cortes</span>
                        <div className="flex items-center gap-1.5">
                            {cortes.map(c => {
                                const tieneActivos = c.entregables?.some(e => e.activo);
                                return (
                                    <div key={c.id} title={c.nombre}
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all"
                                        style={tieneActivos
                                            ? { backgroundColor: entorno.color, borderColor: entorno.color, color: '#fff' }
                                            : { backgroundColor: 'transparent', borderColor: '#e2e8f0', color: '#94a3b8' }
                                        }>
                                        {c.numero}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                {totalEntregables > 0 && (
                    <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold">
                            <span className="text-slate-400">{activos} de {totalEntregables} activos</span>
                            <span style={{ color: entorno.color }}>{progreso}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${progreso}%`, backgroundColor: entorno.color }} />
                        </div>
                    </div>
                )}

                {/* Footer CTA */}
                <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-50">
                    <span className="text-xs font-semibold flex items-center gap-1 transition-all"
                        style={{ color: entorno.color }}>
                        Ver espacio <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </div>
        </button>
    );
}
