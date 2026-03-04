/* eslint-disable */
// hooks/useActas.js
// Toda la lógica de datos de actas de reunión (CRUD + firma + comentarios).

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getActasReunion, createActaReunion, updateActaReunion, deleteActaReunion,
    getMisActasReunion, firmarActaReunion, comentarActaReunion,
    getFirmaUsuario, saveFirmaUsuario,
} from '../services/api';

export function useActas(user, addToast) {
    const [actas, setActas] = useState([]);
    const [misActas, setMisActas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [firmaPersonal, setFirmaPersonal] = useState(null);

    // ── Firma personal ──────────────────────────────────────────────
    useEffect(() => {
        getFirmaUsuario()
            .then(r => setFirmaPersonal(r.data?.firma_data || null))
            .catch(() => { });
    }, []);

    // ── Cargar actas ────────────────────────────────────────────────
    const loadActas = useCallback(async () => {
        setLoading(true);
        try {
            const [res1, res2] = await Promise.all([
                getActasReunion().catch(() => ({ data: [] })),
                getMisActasReunion().catch(() => ({ data: [] })),
            ]);
            setActas(Array.isArray(res1.data) ? res1.data : []);
            setMisActas(Array.isArray(res2.data) ? res2.data : []);
        } catch { /* silencioso */ }
        setLoading(false);
    }, []);

    useEffect(() => { loadActas(); }, [loadActas]);

    // ── CRUD ────────────────────────────────────────────────────────
    const saveActa = async (current) => {
        if (!current) return false;
        try {
            const isExisting = current.id && actas.find(a => a.id === current.id);
            if (isExisting) {
                await updateActaReunion(current.id, current);
                addToast('Acta actualizada correctamente', 'success');
            } else {
                await createActaReunion(current);
                addToast('Acta creada correctamente', 'success');
            }
            await loadActas();
            return true;   // éxito → el llamador puede navegar
        } catch (err) {
            const detail = err.response?.data?.detail
                || (typeof err.response?.data === 'string' ? err.response.data : null)
                || err.message || 'Error desconocido';
            addToast(`Error al guardar: ${detail}`, 'error');
            return false;   // fallo → el llamador NO navega
        }
    };

    const deleteActa = async (id) => {
        try {
            await deleteActaReunion(id);
            addToast('Acta eliminada correctamente', 'success');
        } catch (err) {
            const msg = err.response?.data?.detail || 'No se pudo eliminar el acta';
            addToast(msg, 'error');
        }
        await loadActas();
    };

    // ── Firma ───────────────────────────────────────────────────────
    const firmarActa = async (actaId, firmaData) => {
        try {
            // Guardar firma personal si no existe
            if (!firmaPersonal) {
                await saveFirmaUsuario(firmaData);
                setFirmaPersonal(firmaData);
                addToast('Firma personal guardada ✓', 'success');
            }
            await firmarActaReunion(actaId, firmaData, new Date().toLocaleDateString('es-ES'));
            addToast('Acta firmada correctamente ✍️', 'success');
        } catch (err) {
            addToast(err.response?.data?.detail || 'Error al firmar', 'error');
        }
        await loadActas();
    };

    const guardarFirmaPersonal = async (data) => {
        try {
            await saveFirmaUsuario(data);
            setFirmaPersonal(data);
            addToast('Firma guardada correctamente', 'success');
        } catch {
            addToast('Error al guardar la firma', 'error');
        }
    };

    // ── Comentarios ─────────────────────────────────────────────────
    const comentar = async (actaId, text) => {
        try {
            await comentarActaReunion(actaId, text);
            addToast('Comentario agregado', 'info');
        } catch {
            addToast('Error al agregar comentario', 'error');
        }
        await loadActas();
    };

    // ── Métricas de "Mis Actas" ─────────────────────────────────────
    const pendingCount = useMemo(() => {
        const uid = user?.id;
        return misActas.filter(a => {
            const entry = a.firmas?.find(f => f.user_id && (f.user_id === uid || String(f.user_id) === String(uid)));
            return !entry?.firmado;
        }).length;
    }, [misActas, user]);

    const availableYears = useMemo(() => {
        const years = new Set();
        misActas.forEach(a => { const m = (a.fecha || '').match(/(\d{4})/); if (m) years.add(m[1]); });
        return [...years].sort().reverse();
    }, [misActas]);

    return {
        actas, misActas, loading,
        firmaPersonal, setFirmaPersonal,
        loadActas, saveActa, deleteActa,
        firmarActa, guardarFirmaPersonal, comentar,
        pendingCount, availableYears,
    };
}
