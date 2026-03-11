import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// ── API helpers ────────────────────────────────────────────────
const getEntornos    = ()        => api.get('/entornos/entornos/');
const getEntorno     = (id)      => api.get(`/entornos/entornos/${id}/`);
const createEntorno  = (data)    => api.post('/entornos/entornos/', data);
const updateEntorno  = (id, d)   => api.put(`/entornos/entornos/${id}/`, d);
const deleteEntorno  = (id)      => api.delete(`/entornos/entornos/${id}/`);
const createCorte    = (data)    => api.post('/entornos/cortes/', data);
const updateCorte    = (id, d)   => api.put(`/entornos/cortes/${id}/`, d);
const deleteCorte    = (id)      => api.delete(`/entornos/cortes/${id}/`);
const createEntregable   = (data)  => api.post('/entornos/entregables/', data);
const updateEntregable   = (id, d) => api.put(`/entornos/entregables/${id}/`, d);
const deleteEntregable   = (id)    => api.delete(`/entornos/entregables/${id}/`);
const activarEntregable  = (id)    => api.post(`/entornos/entregables/${id}/activar/`);
const desactivarEntregable = (id)  => api.post(`/entornos/entregables/${id}/desactivar/`);

export { activarEntregable, desactivarEntregable };

export function useEntornos() {
    const [entornos, setEntornos] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const { data } = await getEntornos();
            setEntornos(Array.isArray(data) ? data : []);
        } catch (e) {
            setError('No se pudieron cargar los entornos');
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const saveEntorno = async (form, editId = null) => {
        if (editId) {
            await updateEntorno(editId, form);
        } else {
            await createEntorno(form);
        }
        await load();
    };

    const removeEntorno = async (id) => {
        await deleteEntorno(id);
        await load();
    };

    const saveCorte = async (entornoId, corteData, corteId = null) => {
        const payload = { ...corteData, entorno: entornoId };
        if (corteId) await updateCorte(corteId, payload);
        else await createCorte(payload);
        const { data } = await getEntorno(entornoId);
        setEntornos(prev => prev.map(e => e.id === entornoId ? data : e));
    };

    const removeCorte = async (corteId, entornoId) => {
        await deleteCorte(corteId);
        const { data } = await getEntorno(entornoId);
        setEntornos(prev => prev.map(e => e.id === entornoId ? data : e));
    };

    const saveEntregable = async (corteId, entornoId, data, entregableId = null) => {
        const payload = { ...data, corte: corteId };
        if (entregableId) await updateEntregable(entregableId, payload);
        else await createEntregable(payload);
        const res = await getEntorno(entornoId);
        setEntornos(prev => prev.map(e => e.id === entornoId ? res.data : e));
    };

    const removeEntregable = async (entregableId, entornoId) => {
        await deleteEntregable(entregableId);
        const { data } = await getEntorno(entornoId);
        setEntornos(prev => prev.map(e => e.id === entornoId ? data : e));
    };

    const toggleEntregable = async (entregableId, activo, entornoId) => {
        if (activo) await desactivarEntregable(entregableId);
        else        await activarEntregable(entregableId);
        const { data } = await getEntorno(entornoId);
        setEntornos(prev => prev.map(e => e.id === entornoId ? data : e));
    };

    return {
        entornos, loading, error,
        load, saveEntorno, removeEntorno,
        saveCorte, removeCorte,
        saveEntregable, removeEntregable, toggleEntregable,
    };
}
