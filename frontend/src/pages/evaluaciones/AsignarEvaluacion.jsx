import React, { useState, useEffect, useCallback } from 'react';
import { Users, ChevronRight, ClipboardList, Trash2, RefreshCw } from 'lucide-react';
import api, { getAgonCourses, createEvaluacionGrupo, deleteRubrica } from '../../services/api';

export default function AsignarEvaluacion({ rubricas, onEvaluar }) {
    const [cursos, setCursos]           = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [rubricaId, setRubricaId]     = useState('');
    const [cursoId, setCursoId]         = useState('');
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState('');

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const [cRes, eRes] = await Promise.all([
                getAgonCourses(),
                api.get('/evaluaciones/grupos/'),
            ]);
            setCursos(Array.isArray(cRes.data) ? cRes.data : []);
            setEvaluaciones(Array.isArray(eRes.data) ? eRes.data : eRes.data?.results || []);
        } catch (e) {
            setError('Error al cargar datos: ' + (e?.response?.status || e.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargar(); }, []);

    const getCurso = (id) => cursos.find(c => String(c.id) === String(id));

    const handleAsignar = async () => {
        if (!rubricaId || !cursoId) return;
        setSaving(true);
        setError('');
        const curso = getCurso(cursoId);
        try {
            await createEvaluacionGrupo({
                rubrica: Number(rubricaId),
                grupo_agon_id: Number(cursoId),
                grupo_nombre: curso?.name || '',
            });
            await cargar();
            setRubricaId('');
            setCursoId('');
        } catch (e) {
            setError('Error al asignar: ' + (e?.response?.data?.error || e.message));
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Eliminar esta evaluación? Se borrarán todas las calificaciones.')) return;
        await api.delete(`/evaluaciones/grupos/${id}/`);
        cargar();
    };

    const handleEvaluar = async (ev) => {
        // Buscar el curso en memoria o intentarlo de nuevo desde el estado
        let curso = getCurso(ev.grupo_agon_id);
        if (!curso) {
            // Si no está en cache, intentar recargar cursos
            try {
                const r = await getAgonCourses();
                const lista = Array.isArray(r.data) ? r.data : [];
                setCursos(lista);
                curso = lista.find(c => String(c.id) === String(ev.grupo_agon_id));
            } catch {}
        }
        if (!curso) {
            curso = { id: ev.grupo_agon_id, name: ev.grupo_nombre || `Grupo ${ev.grupo_agon_id}`, students: [] };
        }
        onEvaluar(ev, curso);
    };

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            {/* Asignador */}
            <div className="eval-card" style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', border:'none', color:'#fff' }}>
                <h3 style={{ fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>
                    <ClipboardList size={18}/> Asignar Rúbrica a un Grupo de AGON
                </h3>
                {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:'8px', padding:'8px 12px', fontSize:'0.8rem', marginBottom:'10px' }}>{error}</div>}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'12px', alignItems:'flex-end' }}>
                    <div>
                        <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#a5b4fc', marginBottom:'6px' }}>RÚBRICA</label>
                        <select className="eval-select" value={rubricaId} onChange={e => setRubricaId(e.target.value)}>
                            <option value="">-- Seleccionar rúbrica --</option>
                            {rubricas.map(r => <option key={r.id} value={r.id}>{r.titulo}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#a5b4fc', marginBottom:'6px' }}>GRUPO / CLASE (AGON)</label>
                        <select className="eval-select" value={cursoId} onChange={e => setCursoId(e.target.value)} disabled={loading}>
                            <option value="">{loading ? 'Cargando grupos...' : '-- Seleccionar grupo --'}</option>
                            {cursos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <button className="eval-btn-primary" onClick={handleAsignar} disabled={saving || !rubricaId || !cursoId}
                        style={{ whiteSpace:'nowrap', marginBottom:0 }}>
                        {saving ? 'Guardando...' : 'Asignar →'}
                    </button>
                </div>
            </div>

            {/* Lista de evaluaciones activas */}
            <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                    <h3 style={{ fontWeight:700, color:'#1e1b4b', fontSize:'0.95rem', margin:0 }}>
                        Evaluaciones Activas ({evaluaciones.length})
                    </h3>
                    <button className="eval-btn-ghost" onClick={cargar} style={{ fontSize:'0.75rem', padding:'5px 10px' }}>
                        <RefreshCw size={13}/> Actualizar
                    </button>
                </div>

                {loading ? (
                    <div className="eval-empty"><p>Cargando...</p></div>
                ) : evaluaciones.length === 0 ? (
                    <div className="eval-empty"><Users size={36}/><p>No has creado evaluaciones aún.</p></div>
                ) : (
                    <div className="eval-grid">
                        {evaluaciones.map(ev => {
                            const curso   = getCurso(ev.grupo_agon_id);
                            const rubrica = ev.rubrica_detalle || rubricas.find(r => String(r.id) === String(ev.rubrica));
                            return (
                                <div key={ev.id} className="ev-grupo-card">
                                    <div className="ev-grupo-header">
                                        <h3>{curso?.name || ev.grupo_nombre || `Grupo ${ev.grupo_agon_id}`}</h3>
                                        <p>{rubrica?.titulo || `Rúbrica ${ev.rubrica}`}</p>
                                    </div>
                                    <div className="ev-grupo-body">
                                        <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:'0.75rem' }}>
                                            {rubrica?.criterios?.length || 0} criterios · {curso?.students?.length || 0} estudiantes
                                        </div>
                                        <div style={{ display:'flex', gap:'8px' }}>
                                            <button className="eval-btn-primary" style={{ flex:1, justifyContent:'center' }}
                                                onClick={() => handleEvaluar(ev)}>
                                                Evaluar Estudiantes <ChevronRight size={15}/>
                                            </button>
                                            <button title="Eliminar evaluación" onClick={() => handleEliminar(ev.id)}
                                                style={{ background:'#fee2e2', border:'none', color:'#dc2626', cursor:'pointer', padding:'8px 10px', borderRadius:'10px', display:'flex', alignItems:'center' }}>
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
