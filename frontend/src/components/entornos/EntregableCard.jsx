import React from 'react';
import { Zap, PenLine, FileText, Hash, Calendar, Weight } from 'lucide-react';

const fmtDate = d => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : null;

export default function EntregableCard({ entregable, color, onToggle, onEvaluar }) {
    const isRubrica = entregable.tipo === 'rubrica';

    return (
        <div className={`rounded-xl border p-4 transition-all duration-300 ${entregable.activo
            ? 'border-emerald-200 bg-emerald-50/40'
            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>

            <div className="flex items-start gap-3">
                {/* Tipo icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 
                    ${entregable.activo ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    {isRubrica
                        ? <Hash className={`h-4 w-4 ${entregable.activo ? 'text-emerald-600' : 'text-slate-400'}`} />
                        : <FileText className={`h-4 w-4 ${entregable.activo ? 'text-emerald-600' : 'text-slate-400'}`} />
                    }
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">{entregable.nombre}</p>
                        {/* Badges */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isRubrica
                            ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isRubrica ? 'Rúbrica' : 'Manual'}
                        </span>
                        {entregable.activo && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
                            </span>
                        )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                            <Weight className="h-3 w-3" /> {entregable.peso}% del corte
                        </span>
                        {entregable.fecha_entrega && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {fmtDate(entregable.fecha_entrega)}
                            </span>
                        )}
                        {entregable.rubrica_titulo && (
                            <span className="text-violet-500 font-medium truncate max-w-[160px]">
                                📋 {entregable.rubrica_titulo}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {entregable.activo && onEvaluar && (
                        <button onClick={onEvaluar}
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                            style={{ backgroundColor: color }}>
                            <PenLine className="h-3.5 w-3.5" /> Evaluar
                        </button>
                    )}
                    <button onClick={onToggle}
                        className={`p-1.5 rounded-lg transition-all text-xs font-semibold border ${entregable.activo
                            ? 'bg-white text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}`}
                        title={entregable.activo ? 'Desactivar' : 'Activar'}>
                        <Zap className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
