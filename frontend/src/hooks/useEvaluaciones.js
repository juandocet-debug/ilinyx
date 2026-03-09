/* eslint-disable */
import { useState, useCallback } from 'react';
import {
    getRubricas, createRubrica, deleteRubrica as apiDeleteRubrica,
    getEvaluacionesGrupos, createEvaluacionGrupo,
    getCalificaciones, guardarCalificacion
} from '../services/api';
import api from '../services/api';

export function useEvaluaciones() {
    const [rubricas, setRubricas] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [calificaciones, setCalificaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    // ── Rúbricas ──────────────────────────────────────────────
    const loadRubricas = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getRubricas();
            setRubricas(Array.isArray(res.data) ? res.data : res.data?.results || []);
        } catch {}
        setLoading(false);
    }, []);

    const saveRubrica = async (data) => {
        try {
            await createRubrica(data);
            await loadRubricas();
            return true;
        } catch (e) {
            console.error('Error al crear rúbrica', e);
            return false;
        }
    };

    const deleteRubrica = async (id) => {
        try {
            await apiDeleteRubrica(id);
            await loadRubricas();
        } catch {}
    };

    // ── Evaluaciones de Grupo ─────────────────────────────────
    const loadEvaluacionesGrupo = useCallback(async (grupo_agon_id) => {
        setLoading(true);
        try {
            const res = await getEvaluacionesGrupos(grupo_agon_id);
            setEvaluaciones(Array.isArray(res.data) ? res.data : res.data?.results || []);
        } catch {}
        setLoading(false);
    }, []);

    const saveEvaluacionGrupo = async (data) => {
        try {
            await createEvaluacionGrupo(data);
            await loadEvaluacionesGrupo();
            return true;
        } catch (e) {
            console.error('Error al asignar evaluación', e);
            return false;
        }
    };

    // ── Calificaciones ────────────────────────────────────────
    const loadCalificaciones = useCallback(async (eval_id) => {
        setLoading(true);
        try {
            const res = await getCalificaciones(eval_id);
            setCalificaciones(Array.isArray(res.data) ? res.data : res.data?.results || []);
        } catch {}
        setLoading(false);
    }, []);

    const saveCalificacion = async (data) => {
        try {
            await api.post('/evaluaciones/calificaciones/guardar_batch/', data);
            return true;
        } catch (e) {
            console.error('Error al calificar', e);
            return false;
        }
    };

    return {
        rubricas, evaluaciones, calificaciones, loading,
        loadRubricas, saveRubrica, deleteRubrica,
        loadEvaluacionesGrupo, saveEvaluacionGrupo,
        loadCalificaciones, saveCalificacion,
    };
}
