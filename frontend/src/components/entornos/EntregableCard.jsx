/* eslint-disable */
import React from 'react';
import { Zap, Trash2, FileText, Hash, Calendar, Weight } from 'lucide-react';

const fmtDate = d => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : null;

export default function EntregableCard({ entregable, color, onToggle, onDelete }) {
    const isRubrica = entregable.tipo === 'rubrica';

    return (
        <div className={`rounded-lg border px-3 py-2.5 transition-all duration-200 flex items-center gap-3 group ${entregable.activo
            ? 'border-emerald-200 bg-emerald-50/30'
            : 'border-slate-100 bg-white hover:border-slate-200'}`}>

            {/* Icono tipo */}
            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                entregable.activo ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                {isRubrica
                    ? <Hash className={`h-3.5 w-3.5 ${entregable.activo ? 'text-emerald-600' : 'text-slate-400'}`} />
                    : <FileText className={`h-3.5 w-3.5 ${entregable.activo ? 'text-emerald-600' : 'text-slate-400'}`} />
                }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-slate-800 text-[13px] truncate">{entregable.nombre}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isRubrica
                        ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isRubrica ? 'Rúbrica' : 'Manual'}
                    </span>
                    {entregable.activo && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Activo
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2.5 mt-0.5 text-[10px] text-slate-400">
                    <span>{entregable.peso}% del corte</span>
                    {entregable.fecha_entrega && <span>{fmtDate(entregable.fecha_entrega)}</span>}
                    {entregable.rubrica_titulo && (
                        <span className="text-violet-500 font-medium truncate max-w-[140px]">📋 {entregable.rubrica_titulo}</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <button onClick={onToggle}
                    className={`p-1 rounded-md transition-all text-xs border ${entregable.activo
                        ? 'border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
                        : 'border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50'}`}
                    title={entregable.activo ? 'Desactivar' : 'Activar'}>
                    <Zap className="h-3 w-3" />
                </button>
                {onDelete && (
                    <button onClick={() => { if (window.confirm(`¿Eliminar "${entregable.nombre}"?`)) onDelete(); }}
                        className="p-1 rounded-md border border-transparent text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                        title="Eliminar">
                        <Trash2 className="h-3 w-3" />
                    </button>
                )}
            </div>
        </div>
    );
}
