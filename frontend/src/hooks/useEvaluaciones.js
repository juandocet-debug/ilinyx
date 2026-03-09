/* eslint-disable */
import { useState, useCallback } from 'react';
import { getRubricas, createRubrica, deleteRubrica as apiDeleteRubrica, getEvaluacionesGrupos, createEvaluacionGrupo } from '../services/api';
import api from '../services/api';

export function useEvaluaciones() {
    const [rubricas, setRubricas]       = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loading, setLoading]         = useState(false);

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
            if (data.id) {
                // Edición → PUT
                await api.put(`/evaluaciones/rubricas/${data.id}/`, data);
            } else {
                // Creación → POST
                await createRubrica(data);
            }
            return true;
        } catch (e) {
            console.error('Error al guardar rúbrica', e?.response?.data || e);
            return false;
        }
    };

    const deleteRubrica = async (id) => {
        try { await apiDeleteRubrica(id); } catch {}
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
            return true;
        } catch (e) {
            console.error('Error al asignar evaluación', e?.response?.data || e);
            return false;
        }
    };

    return {
        rubricas, evaluaciones, loading,
        loadRubricas, saveRubrica, deleteRubrica,
        loadEvaluacionesGrupo, saveEvaluacionGrupo,
    };
}
