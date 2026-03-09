import React, { useState, useEffect } from 'react';
import { Plus, Award } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import RubricaBuilder from './RubricaBuilder';
import GestionRubricas from './GestionRubricas';
import AsignarEvaluacion from './AsignarEvaluacion';
import CalificarEstudiantes from './CalificarEstudiantes';
import MisNotas from './MisNotas';
import './evaluaciones.css';

export default function EvaluacionesPage() {
    const { user } = useUser();
    const isStudent = user?.role === 'STUDENT';
    const { addToast, toasts } = useEvaluaciones();

    const [tab, setTab] = useState(isStudent ? 'mis_notas' : 'gestionar');
    const [building, setBuilding] = useState(false);
    const [evaluandoGrupo, setEvaluandoGrupo] = useState(null); // { evaluacion, curso }

    if (evaluandoGrupo) {
        return (
            <CalificarEstudiantes
                evaluacion={evaluandoGrupo.evaluacion}
                curso={evaluandoGrupo.curso}
                onBack={() => setEvaluandoGrupo(null)}
            />
        );
    }

    return (
        <div className="eval-page">
            {building && <RubricaBuilder onClose={() => setBuilding(false)} />}

            {/* Header */}
            <div className="eval-header">
                <div className="eval-header-left">
                    <div className="eval-icon"><Award size={22} /></div>
                    <div>
                        <h1>Evaluación y Rúbricas</h1>
                        <p>Gestión de calificaciones por competencias</p>
                    </div>
                </div>
                {!isStudent && tab === 'gestionar' && (
                    <button className="eval-btn-primary" onClick={() => setBuilding(true)}>
                        <Plus size={16} /> Nueva Rúbrica
                    </button>
                )}
            </div>

            {/* Tabs */}
            {!isStudent && (
                <div className="eval-tabs">
                    <button className={tab === 'gestionar' ? 'active' : ''} onClick={() => setTab('gestionar')}>Mis Rúbricas</button>
                    <button className={tab === 'asignar' ? 'active' : ''} onClick={() => setTab('asignar')}>Evaluar Grupos</button>
                </div>
            )}

            <div className="eval-content">
                {tab === 'gestionar' && <GestionRubricas />}
                {tab === 'asignar' && (
                    <AsignarEvaluacion onEvaluar={(ev, curso) => setEvaluandoGrupo({ evaluacion: ev, curso })} />
                )}
                {isStudent && <MisNotas user={user} />}
            </div>
        </div>
    );
}
