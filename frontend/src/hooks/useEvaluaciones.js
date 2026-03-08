/* eslint-disable */
import { useState, useCallback } from 'react';
import {
    getRubricas, createRubrica, deleteRubrica,
    getEvaluacionesGrupos, createEvaluacionGrupo,
    getCalificaciones, guardarCalificacion
} from '../services/api';

export function useEvaluaciones(addToast) {
    const [rubricas, setRubricas] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [calificaciones, setCalificaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadRubricas = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getRubricas();
            setRubricas(res.data);
        } catch { } // Silencioso
        setLoading(false);
    }, []);

    const saveRubrica = async (data) => {
        try {
            await createRubrica(data);
            addToast('Rúbrica creada con éxito', 'success');
            await loadRubricas();
            return true;
        } catch {
            addToast('Error al crear rúbrica', 'error');
            return false;
        }
    };

    const loadEvaluacionesGrupo = useCallback(async (grupo_id) => {
        setLoading(true);
        try {
            const res = await getEvaluacionesGrupos(grupo_id);
            setEvaluaciones(res.data);
        } catch {}
        setLoading(false);
    }, []);

    const saveEvaluacionGrupo = async (data) => {
        try {
            await createEvaluacionGrupo(data);
            addToast('Evaluación asignada a grupo', 'success');
            if (data.grupo) await loadEvaluacionesGrupo(data.grupo);
            return true;
        } catch {
            addToast('Error al asignar evaluación', 'error');
            return false;
        }
    };

    const loadCalificaciones = useCallback(async (eval_id) => {
        setLoading(true);
        try {
            const res = await getCalificaciones(eval_id);
            setCalificaciones(res.data);
        } catch {}
        setLoading(false);
    }, []);

    const evaluateStudent = async (data) => {
        try {
            await guardarCalificacion(data);
            addToast('Calificación guardada', 'success');
            await loadCalificaciones(data.evaluacion_grupo);
            return true;
        } catch {
            addToast('Error al calificar', 'error');
            return false;
        }
    };

    return {
        rubricas, evaluaciones, calificaciones, loading,
        loadRubricas, saveRubrica, deleteRubrica: async (id) => { await deleteRubrica(id); await loadRubricas(); },
        loadEvaluacionesGrupo, saveEvaluacionGrupo,
        loadCalificaciones, evaluateStudent
    };
}
