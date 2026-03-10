import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook que encapsula TODA la lógica de calificación:
 * - Carga de rúbrica y calificaciones desde el backend
 * - Estado de puntajes individuales y de referencia
 * - Guardar, reiniciar nota individual y reiniciar grupo completo
 *
 * @param {object} evaluacion — La evaluación activa (contiene .id y .rubrica)
 * @param {object[]} estudiantes — Lista de estudiantes del curso
 */
export default function useCalificacion(evaluacion, estudiantes) {
    const [rubrica, setRubrica] = useState(null);
    const [puntajes, setPuntajes] = useState({});       // { uid: { cid: valor } }
    const [refPuntajes, setRefPuntajes] = useState({}); // { uid: { cid: valor } }
    const [guardados, setGuardados] = useState({});     // { uid: true }
    const [editando, setEditando] = useState({});       // { uid: true }
    const [saving, setSaving] = useState(false);

    // ── Carga inicial ───────────────────────────────────────────
    useEffect(() => {
        Promise.all([
            api.get(`/evaluaciones/rubricas/${evaluacion.rubrica}/`),
            api.get(`/evaluaciones/calificaciones/?evaluacion_id=${evaluacion.id}`),
        ]).then(([rRes, cRes]) => {
            setRubrica(rRes.data);

            const cals = Array.isArray(cRes.data) ? cRes.data : cRes.data?.results || [];
            const pMap = {};
            const rMap = {};
            const gMap = {};

            cals.forEach(c => {
                const normalized = {};
                Object.entries(c.puntajes || {}).forEach(([k, v]) => {
                    normalized[parseInt(k)] = v;
                });

                if (c.evaluador_id === 1) {
                    rMap[c.usuario_agon_id] = normalized;
                } else {
                    pMap[c.usuario_agon_id] = normalized;
                    gMap[c.usuario_agon_id] = true;
                }
            });

            setPuntajes(pMap);
            setRefPuntajes(rMap);
            setGuardados(gMap);
        });
    }, [evaluacion.id, evaluacion.rubrica]);

    // ── Setters ──────────────────────────────────────────────────
    const setScore = (uid, cid, val) =>
        setPuntajes(p => ({ ...p, [uid]: { ...(p[uid] || {}), [cid]: val } }));

    const setScoreRef = (uid, cid, val) =>
        setRefPuntajes(p => ({
            ...p,
            [uid]: { ...(p[uid] || {}), [cid]: val },
        }));

    const clearRefForStudent = (uid) =>
        setRefPuntajes(p => { const n = { ...p }; delete n[uid]; return n; });

    // ── Cálculos ─────────────────────────────────────────────────
    const calcPromedio = useCallback((uid) => {
        if (!rubrica?.criterios?.length) return 0;
        const vals = rubrica.criterios
            .map(c => puntajes[uid]?.[c.id] || 0)
            .filter(v => v > 0);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }, [rubrica, puntajes]);

    const puedeEditar = (uid) => !guardados[uid] || editando[uid];

    // ── Acciones ─────────────────────────────────────────────────
    const guardar = async (uid) => {
        setSaving(true);
        try {
            await api.post('/evaluaciones/calificaciones/guardar_batch/', {
                evaluacion_grupo: evaluacion.id,
                usuario_agon_id: uid,
                puntajes: puntajes[uid] || {},
                puntajes_ref: refPuntajes[uid] || {},
                nota_final: parseFloat(calcPromedio(uid).toFixed(2)),
            });
            setGuardados(p => ({ ...p, [uid]: true }));
            setEditando(p => ({ ...p, [uid]: false }));
        } catch (e) {
            alert('No se pudo guardar la nota: ' + (e?.response?.data?.error || e.message));
        } finally {
            setSaving(false);
        }
    };

    const reiniciarNota = async (uid, nombre) => {
        if (!window.confirm(`¿Reiniciar la nota de ${nombre}?`)) return;
        try {
            await api.delete('/evaluaciones/calificaciones/eliminar_calificacion/', {
                data: { evaluacion_grupo: evaluacion.id, usuario_agon_id: uid },
            });
            setPuntajes(p => { const n = { ...p }; delete n[uid]; return n; });
            setRefPuntajes(p => { const n = { ...p }; delete n[uid]; return n; });
            setGuardados(p => { const n = { ...p }; delete n[uid]; return n; });
            setEditando(p => { const n = { ...p }; delete n[uid]; return n; });
        } catch (e) {
            alert('Error al reiniciar: ' + (e?.response?.data?.error || e.message));
        }
    };

    const reiniciarGrupo = async () => {
        if (!window.confirm('⚠️ ¿Reiniciar TODAS las calificaciones de este grupo?')) return;
        try {
            await api.delete('/evaluaciones/calificaciones/reiniciar_grupo/', {
                data: { evaluacion_grupo: evaluacion.id },
            });
            setPuntajes({});
            setRefPuntajes({});
            setGuardados({});
            setEditando({});
            alert('✓ Grupo reiniciado.');
        } catch (e) {
            alert('Error al reiniciar: ' + (e?.response?.data?.error || e.message));
        }
    };

    return {
        rubrica,
        puntajes,
        refPuntajes,
        guardados,
        editando,
        saving,
        setScore,
        setScoreRef,
        clearRefForStudent,
        setEditando,
        calcPromedio,
        puedeEditar,
        guardar,
        reiniciarNota,
        reiniciarGrupo,
    };
}
