import React, { useState, useEffect } from 'react';
import { Plus, Users, ClipboardCheck } from 'lucide-react';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import { getGrupos } from '../../services/api';

export default function EvaluacionesGrupo({ addToast, isStudent, user }) {
    const { evaluaciones, rubricas, loadEvaluacionesGrupo, saveEvaluacionGrupo } = useEvaluaciones(addToast);
    const [grupos, setGrupos] = useState([]);
    const [asignando, setAsignando] = useState(false);
    
    // Formulario de asignación
    const [rubricaId, setRubricaId] = useState('');
    const [grupoId, setGrupoId] = useState('');

    useEffect(() => {
        loadEvaluacionesGrupo(); 
        if (!isStudent) {
            getGrupos().then(res => setGrupos(res.data)).catch(() => {});
        }
    }, [loadEvaluacionesGrupo, isStudent]);

    const handleAsignar = async () => {
        if (!rubricaId || !grupoId) return addToast('Selecciona Rúbrica y Grupo', 'warning');
        await saveEvaluacionGrupo({ rubrica: rubricaId, grupo: grupoId });
        setAsignando(false);
    };

    if (isStudent) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Tus Calificaciones (Próximamente)</h2>
                <div className="p-5 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                    Las calificaciones de tus rúbricas aparecerán aquí.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Grupos Evaluados</h2>
                <button onClick={() => setAsignando(!asignando)}
                    className="flex items-center gap-2 bg-ilinyx-100 text-ilinyx-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-ilinyx-200">
                    {asignando ? 'Cancelar' : <><Plus className="w-4 h-4"/> Asignar Rúbrica a Grupo</>}
                </button>
            </div>

            {asignando && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Rúbrica</label>
                        <select value={rubricaId} onChange={e => setRubricaId(e.target.value)}
                            className="w-full text-sm border-slate-200 rounded-lg p-2">
                            <option value="">-- Seleccionar --</option>
                            {rubricas.map(r => <option key={r.id} value={r.id}>{r.titulo}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Grupo / Cohorte</label>
                        <select value={grupoId} onChange={e => setGrupoId(e.target.value)}
                            className="w-full text-sm border-slate-200 rounded-lg p-2">
                            <option value="">-- Seleccionar --</option>
                            {grupos.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleAsignar} 
                        className="bg-emerald-500 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-600">
                        Asignar y Empezar
                    </button>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {evaluaciones.map(ev => (
                    <div key={ev.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-start gap-3">
                            <div className="bg-ilinyx-50 p-2 rounded-lg text-ilinyx-600"><ClipboardCheck className="w-6 h-6"/></div>
                            <div>
                                <h3 className="font-bold text-slate-800 line-clamp-1">{ev.rubrica_detalle?.titulo}</h3>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Users className="w-3 h-3"/> Grupo {ev.grupo}
                                </p>
                            </div>
                        </div>
                        <button className="w-full mt-4 bg-slate-900 text-white font-semibold text-sm py-2 rounded-lg hover:bg-ilinyx-700 transition-colors">
                            Evaluar Estudiantes
                        </button>
                    </div>
                ))}
            </div>
            {evaluaciones.length === 0 && !asignando && (
                <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl border-slate-300">
                    No has asignado ninguna rúbrica a tus grupos todavía.
                </div>
            )}
        </div>
    );
}
