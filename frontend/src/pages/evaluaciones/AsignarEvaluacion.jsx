import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, ClipboardList } from 'lucide-react';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import { getAgonCourses } from '../../services/api';

export default function AsignarEvaluacion({ onEvaluar }) {
    const { rubricas, evaluaciones, loadRubricas, loadEvaluacionesGrupo, saveEvaluacionGrupo } = useEvaluaciones();
    const [cursos, setCursos] = useState([]);
    const [rubricaId, setRubricaId] = useState('');
    const [cursoId, setCursoId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRubricas();
        loadEvaluacionesGrupo();
        getAgonCourses()
            .then(r => setCursos(Array.isArray(r.data) ? r.data : []))
            .catch(() => setCursos([]))
            .finally(() => setLoading(false));
    }, []);

    const handleAsignar = async () => {
        if (!rubricaId || !cursoId) return;
        setSaving(true);
        await saveEvaluacionGrupo({ rubrica: rubricaId, grupo_agon_id: cursoId });
        setSaving(false);
        loadEvaluacionesGrupo();
    };

    const getCurso = (id) => cursos.find(c => String(c.id) === String(id));
    const getRubrica = (id) => rubricas.find(r => String(r.id) === String(id));

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            {/* Asignador */}
            <div className="eval-card" style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', border:'none', color:'#fff' }}>
                <h3 style={{ fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>
                    <ClipboardList size={18}/> Asignar Rúbrica a un Grupo de AGON
                </h3>
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

            {/* Lista de evaluaciones creadas */}
            <div>
                <h3 style={{ fontWeight:700, color:'#1e1b4b', marginBottom:'0.75rem', fontSize:'0.95rem' }}>
                    Evaluaciones Activas ({evaluaciones.length})
                </h3>
                {evaluaciones.length === 0 ? (
                    <div className="eval-empty"><Users size={36}/><p>No has creado evaluaciones aún.</p></div>
                ) : (
                    <div className="eval-grid">
                        {evaluaciones.map(ev => {
                            const curso = getCurso(ev.grupo_agon_id) || { name: `Grupo ${ev.grupo_agon_id}` };
                            const rubrica = getRubrica(ev.rubrica);
                            return (
                                <div key={ev.id} className="ev-grupo-card">
                                    <div className="ev-grupo-header">
                                        <h3>{curso?.name || 'Grupo'}</h3>
                                        <p>{rubrica?.titulo || 'Sin rúbrica'}</p>
                                    </div>
                                    <div className="ev-grupo-body">
                                        <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:'0.75rem' }}>
                                            {rubrica?.criterios?.length || 0} criterios · {curso?.students?.length || 0} estudiantes
                                        </div>
                                        <button className="eval-btn-primary" style={{ width:'100%', justifyContent:'center' }}
                                            onClick={() => onEvaluar(ev, curso)}>
                                            Evaluar Estudiantes <ChevronRight size={15}/>
                                        </button>
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
