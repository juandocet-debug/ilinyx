import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import ToastContainer, { useToast } from '../../components/ui/Toast';
import ListaRubricas from './ListaRubricas';
import EvaluacionesGrupo from './EvaluacionesGrupo';
import RubricaBuilder from './RubricaBuilder';

export default function EvaluacionesPage() {
    const { user } = useUser();
    const { toasts, addToast } = useToast();
    const isStudent = user?.role === 'STUDENT';

    // Tabs: 'rubricas' (Solo teachers), 'mis_evaluaciones' (todos)
    const [view, setView] = useState(isStudent ? 'mis_evaluaciones' : 'rubricas');
    const [building, setBuilding] = useState(false);

    const checkTeacher = !isStudent && user?.role !== 'ADMIN';

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} />
            
            {building && (
                <RubricaBuilder 
                    onClose={() => setBuilding(false)} 
                    addToast={addToast} 
                />
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Evaluación y Rúbricas</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Gestión de calificaciones por competencias</p>
                </div>
                {!isStudent && view === 'rubricas' && (
                    <button onClick={() => setBuilding(true)}
                        className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all">
                        <Plus className="h-4 w-4" /> Crear Rúbrica
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                    {!isStudent && (
                        <button onClick={() => setView('rubricas')}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'rubricas' ? 'bg-white text-ilinyx-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            Gestión de Rúbricas
                        </button>
                    )}
                    <button onClick={() => setView('mis_evaluaciones')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'mis_evaluaciones' ? 'bg-white text-ilinyx-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        Mis Evaluaciones
                    </button>
                </div>
            </div>

            <div className="pt-2">
                {view === 'rubricas' && <ListaRubricas addToast={addToast} />}
                {view === 'mis_evaluaciones' && <EvaluacionesGrupo addToast={addToast} isStudent={isStudent} user={user} />}
            </div>
        </div>
    );
}
