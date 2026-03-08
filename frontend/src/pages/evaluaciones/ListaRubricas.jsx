import React, { useEffect } from 'react';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import { PenTool, Trash2 } from 'lucide-react';

export default function ListaRubricas({ addToast }) {
    const { rubricas, loading, loadRubricas, deleteRubrica } = useEvaluaciones(addToast);

    useEffect(() => { loadRubricas(); }, [loadRubricas]);

    if (loading) return <div>Cargando rúbricas...</div>;
    if (rubricas.length === 0) return <div className="text-center text-slate-500 py-10">No has creado rúbricas.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rubricas.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-800 text-lg">{r.titulo}</h3>
                        <button onClick={() => deleteRubrica(r.id)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{r.descripcion || 'Sin descripción'}</p>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                            <PenTool className="h-4 w-4 text-ilinyx-500" />
                            Criterios ({r.criterios.length})
                        </div>
                        <ul className="text-xs text-slate-500 space-y-1 ml-6 list-disc">
                            {r.criterios.map(c => <li key={c.id}>{c.nombre}</li>)}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
