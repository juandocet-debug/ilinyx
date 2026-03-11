/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Search, Download, Calculator, TrendingUp } from 'lucide-react';
import api from '../../services/api';

export default function SeguimientoPanel({ entornoId, entornoColor }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        api.get(`/entornos/${entornoId}/seguimiento/`)
            .then(res => {
                if (mounted) {
                    setData(res.data);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (mounted) {
                    console.error("Seguimiento error", err);
                    setError('No se pudo cargar el seguimiento agregado.');
                    setLoading(false);
                }
            });
        return () => { mounted = false; };
    }, [entornoId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
                <Loader2 className="h-8 w-8 text-ilinyx-500 animate-spin mb-4" />
                <p className="text-slate-500 text-sm font-medium">Calculando matriz de notas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-2xl border border-red-100 mt-4 text-red-500 text-sm gap-2">
                <AlertCircle className="h-6 w-6" />
                <p>{error}</p>
            </div>
        );
    }

    if (!data || !data.estudiantes || data.estudiantes.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
                <p className="text-slate-500 font-medium">No hay estudiantes en los grupos asignados a este entorno.</p>
                <p className="text-sm text-slate-400 mt-1">Regresa a la configuración y asegúrate de elegir grupos válidos.</p>
            </div>
        );
    }

    const { estructura, estudiantes } = data;
    
    // Calcular cuántas columnas de entregables hay en total para el grid layout si se necesita
    let totalEntregables = 0;
    estructura.forEach(c => totalEntregables += c.entregables.length);

    // Filter students
    const filteredEstudiantes = estudiantes.filter(e => {
        if (!search) return true;
        const q = search.toLowerCase();
        return e.nombre.toLowerCase().includes(q) || e.grupo_nombre?.toLowerCase().includes(q);
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-4">
            
            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${entornoColor}15` }}>
                        <Calculator className="h-5 w-5" style={{ color: entornoColor }} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Matriz de Calificaciones</h3>
                        <p className="text-xs text-slate-500">{estudiantes.length} estudiantes en total</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar estudiante..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ '--tw-ring-color': `${entornoColor}40` }}
                        />
                    </div>
                    {/* Botón placeholder para Excel/CSV a futuro */}
                    <button className="hidden sm:flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                        <Download className="h-4 w-4" /> Exportar
                    </button>
                </div>
            </div>

            {/* ── Tabla Matriz ────────────────────────────────────────────── */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        {/* Cabecera Nivel 1: Cortes */}
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 font-semibold text-slate-600 border-r border-slate-200 sticky left-0 z-20 bg-slate-50 min-w-[280px]">
                                Estudiante
                            </th>
                            {estructura.map(corte => (
                                <th key={corte.id} 
                                    className="px-4 py-2 font-bold text-center border-r border-slate-200"
                                    colSpan={corte.entregables.length + 1}
                                    style={{ color: entornoColor }}>
                                    {corte.nombre} <span className="text-xs opacity-70 font-normal">({corte.porcentaje}%)</span>
                                </th>
                            ))}
                            <th className="px-4 py-3 font-bold text-center bg-slate-100 text-slate-700 min-w-[100px]">
                                FINAL
                            </th>
                        </tr>
                        {/* Cabecera Nivel 2: Entregables */}
                        <tr className="bg-white border-b border-slate-100">
                            <th className="px-4 py-2 text-xs font-semibold text-slate-400 border-r border-slate-100 sticky left-0 z-20 bg-white">
                                Nombre y Grupo
                            </th>
                            {estructura.map(corte => (
                                <React.Fragment key={`sub-${corte.id}`}>
                                    {corte.entregables.map(ent => (
                                        <th key={ent.id} className="px-3 py-2 text-xs font-medium text-slate-500 border-r border-slate-100 text-center bg-slate-50/30" title={ent.nombre}>
                                            <div className="max-w-[120px] truncate mx-auto">
                                                {ent.nombre}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{ent.peso}%</div>
                                        </th>
                                    ))}
                                    <th className="px-3 py-2 text-xs font-bold text-slate-600 border-r border-slate-200 text-center bg-slate-50/80">
                                        Def. Corte
                                    </th>
                                </React.Fragment>
                            ))}
                            <th className="px-4 py-2 bg-slate-100"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredEstudiantes.map((est, idx) => (
                            <tr key={est.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 border-r border-slate-100 sticky left-0 z-10 bg-white">
                                    <div className="font-semibold text-slate-800">{est.nombre}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{est.grupo_nombre}</div>
                                </td>
                                
                                {estructura.map(corte => {
                                    // Buscar los datos del estudiante para este corte
                                    const estCorte = est.cortes.find(c => c.id === corte.id) || { entregables: [], nota_corte: 0 };
                                    
                                    return (
                                        <React.Fragment key={`td-${corte.id}`}>
                                            {corte.entregables.map(ent => {
                                                const entData = estCorte.entregables.find(e => e.id === ent.id);
                                                const nota = entData ? entData.nota : 0;
                                                const isZero = nota === 0;
                                                return (
                                                    <td key={ent.id} className="px-3 py-3 text-center border-r border-slate-100">
                                                        <span className={`font-medium ${isZero ? 'text-slate-300' : 'text-slate-700'}`}>
                                                            {nota.toFixed(1)}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                            {/* Definitiva del Corte */}
                                            <td className="px-3 py-3 text-center border-r border-slate-200 bg-slate-50/50 font-bold"
                                                style={{ color: estCorte.nota_corte >= 3.0 ? entornoColor : '#ef4444' }}>
                                                {estCorte.nota_corte.toFixed(2)}
                                            </td>
                                        </React.Fragment>
                                    );
                                })}
                                
                                {/* Nota Final del Semestre */}
                                <td className="px-4 py-3 text-center font-bold text-base bg-slate-50"
                                    style={{ color: est.nota_final >= 3.0 ? '#10b981' : '#ef4444' }}>
                                    {est.nota_final.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredEstudiantes.length === 0 && (
                    <div className="p-10 text-center text-slate-400">
                        No se encontraron estudiantes que coincidan con la búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
}
