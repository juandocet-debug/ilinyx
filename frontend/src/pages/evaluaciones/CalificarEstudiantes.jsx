import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, User, CheckCircle } from 'lucide-react';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import api from '../../services/api';
import RubricaGrid from './RubricaGrid';

export default function CalificarEstudiantes({ evaluacion, curso, onBack }) {
    const { saveCalificacion } = useEvaluaciones();
    const [rubrica, setRubrica] = useState(null);
    const [modo, setModo] = useState('individual'); // 'individual' | 'colectivo'
    const [estudianteActivo, setEstudianteActivo] = useState(null);
    const [puntajes, setPuntajes] = useState({}); // { userId: { criterioId: valor } }
    const [guardados, setGuardados] = useState({});
    const [saving, setSaving] = useState(false);

    const estudiantes = curso?.students || [];

    useEffect(() => {
        api.get(`/evaluaciones/rubricas/${evaluacion.rubrica}/`)
            .then(r => {
                setRubrica(r.data);
                if (estudiantes.length > 0) setEstudianteActivo(estudiantes[0]);
            });
    }, [evaluacion]);

    const setScore = (userId, criterioId, valor) => {
        setPuntajes(prev => ({
            ...prev,
            [userId]: { ...(prev[userId] || {}), [criterioId]: valor }
        }));
    };

    const setScoreColectivo = (criterioId, valor) => {
        const update = {};
        estudiantes.forEach(e => {
            update[e.id] = { ...(puntajes[e.id] || {}), [criterioId]: valor };
        });
        setPuntajes(prev => ({ ...prev, ...update }));
    };

    const calcPromedio = (userId) => {
        if (!rubrica?.criterios?.length) return 0;
        const scores = puntajes[userId] || {};
        const vals = rubrica.criterios.map(c => scores[c.id] || 0);
        return vals.reduce((a, b) => a + b, 0) / vals.length;
    };

    const handleGuardar = async (userId) => {
        if (!rubrica) return;
        setSaving(true);
        const scores = puntajes[userId] || {};
        const nota_final = parseFloat(calcPromedio(userId).toFixed(2));
        await saveCalificacion({
            evaluacion_grupo: evaluacion.id,
            usuario_agon_id: userId,
            puntajes: scores,
            nota_final,
        });
        setSaving(false);
        setGuardados(prev => ({ ...prev, [userId]: true }));
    };

    const handleGuardarTodos = async () => {
        setSaving(true);
        for (const est of estudiantes) {
            const scores = puntajes[est.id] || {};
            const nota_final = parseFloat(calcPromedio(est.id).toFixed(2));
            await saveCalificacion({ evaluacion_grupo: evaluacion.id, usuario_agon_id: est.id, puntajes: scores, nota_final });
            setGuardados(prev => ({ ...prev, [est.id]: true }));
        }
        setSaving(false);
    };

    if (!rubrica) return <div className="eval-empty"><p>Cargando rúbrica...</p></div>;

    const colectivoScores = rubrica.criterios?.reduce((acc, c) => {
        const vals = estudiantes.map(e => puntajes[e.id]?.[c.id]);
        const allSame = vals.every(v => v !== undefined && v === vals[0]);
        acc[c.id] = allSame ? vals[0] : 0;
        return acc;
    }, {});

    return (
        <div className="eval-page">
            {/* Cabecera */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                <button onClick={onBack} className="eval-btn-ghost"><ArrowLeft size={14}/> Volver</button>
                <div style={{ flex:1 }}>
                    <h2 style={{ margin:0, fontWeight:800, color:'#1e1b4b', fontSize:'1.1rem' }}>
                        {curso?.name}
                    </h2>
                    <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#6b7280' }}>
                        Rúbrica: <strong>{rubrica.titulo}</strong> · {rubrica.criterios?.length} criterios
                    </p>
                </div>
                {/* Toggle modo */}
                <div className="eval-tabs">
                    <button className={modo==='individual'?'active':''} onClick={() => setModo('individual')}>
                        <User size={13} style={{marginRight:4}}/> Individual
                    </button>
                    <button className={modo==='colectivo'?'active':''} onClick={() => setModo('colectivo')}>
                        <Users size={13} style={{marginRight:4}}/> Colectivo
                    </button>
                </div>
            </div>

            {modo === 'colectivo' ? (
                /* ── MODO COLECTIVO ── */
                <div className="eval-card" style={{ padding:0, overflow:'hidden' }}>
                    <div style={{ padding:'1rem 1.25rem', background:'linear-gradient(135deg,#1e1b4b,#312e81)', color:'#fff' }}>
                        <h3 style={{ margin:0, fontSize:'0.95rem', fontWeight:700 }}>
                            Evaluación Colectiva — aplica a {estudiantes.length} estudiantes
                        </h3>
                        <p style={{ margin:'4px 0 0', fontSize:'0.75rem', opacity:0.7 }}>
                            Los puntajes que marques aquí se asignan a TODOS los estudiantes del grupo
                        </p>
                    </div>
                    <RubricaGrid
                        criterios={rubrica.criterios}
                        scores={colectivoScores}
                        onScore={(cid, val) => setScoreColectivo(cid, val)}
                    />
                    <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end' }}>
                        <button className="eval-btn-primary" onClick={handleGuardarTodos} disabled={saving}>
                            {saving ? 'Guardando...' : <><CheckCircle size={15}/> Guardar para todos</>}
                        </button>
                    </div>
                </div>
            ) : (
                /* ── MODO INDIVIDUAL ── */
                <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:'1rem', alignItems:'start' }}>
                    {/* Lista de estudiantes */}
                    <div className="eval-card" style={{ padding:'8px', display:'flex', flexDirection:'column', gap:'4px' }}>
                        {estudiantes.map(est => {
                            const promedio = calcPromedio(est.id);
                            const activo = estudianteActivo?.id === est.id;
                            return (
                                <button key={est.id} onClick={() => setEstudianteActivo(est)}
                                    style={{
                                        display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px',
                                        borderRadius:'10px', border:'none', cursor:'pointer', textAlign:'left',
                                        background: activo ? 'linear-gradient(135deg,#ede9fe,#ddd6fe)' : 'transparent',
                                        outline: activo ? '2px solid #7c3aed' : 'none', transition:'all 0.15s'
                                    }}>
                                    {/* Avatar */}
                                    {est.photo
                                        ? <img src={est.photo} alt="" style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}/>
                                        : <div style={{ width:34, height:34, borderRadius:'50%', background:'#e0e7ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#6366f1', fontWeight:700, fontSize:'0.8rem' }}>
                                            {est.first_name?.[0]}{est.last_name?.[0]}
                                          </div>
                                    }
                                    <div style={{ flex:1, overflow:'hidden' }}>
                                        <div style={{ fontWeight:600, color:'#1e293b', fontSize:'0.8rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                            {est.first_name} {est.last_name}
                                        </div>
                                        <div style={{ fontSize:'0.7rem', color: guardados[est.id] ? '#10b981' : promedio > 0 ? '#6366f1' : '#94a3b8', fontWeight:600 }}>
                                            {guardados[est.id] ? '✓ Guardado' : promedio > 0 ? `${promedio.toFixed(1)} / 5.0` : 'Sin calificar'}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Rúbrica del estudiante activo */}
                    {estudianteActivo && (
                        <div className="eval-card" style={{ padding:0, overflow:'hidden' }}>
                            {/* Header estudiante */}
                            <div style={{ padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid #f1f5f9' }}>
                                {estudianteActivo.photo
                                    ? <img src={estudianteActivo.photo} alt="" style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'3px solid #ede9fe' }}/>
                                    : <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1rem' }}>
                                        {estudianteActivo.first_name?.[0]}{estudianteActivo.last_name?.[0]}
                                      </div>
                                }
                                <div style={{ flex:1 }}>
                                    <h3 style={{ margin:0, fontWeight:800, color:'#1e1b4b' }}>
                                        {estudianteActivo.first_name} {estudianteActivo.last_name}
                                    </h3>
                                    <p style={{ margin:'2px 0 0', fontSize:'0.75rem', color:'#6b7280' }}>{estudianteActivo.email}</p>
                                </div>
                                <div style={{ textAlign:'center' }}>
                                    <div style={{
                                        width:52, height:52, borderRadius:'50%',
                                        background: calcPromedio(estudianteActivo.id) >= 3 ? 'linear-gradient(135deg,#10b981,#059669)' : calcPromedio(estudianteActivo.id) > 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : '#f1f5f9',
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        color: calcPromedio(estudianteActivo.id) > 0 ? '#fff' : '#94a3b8',
                                        fontWeight:900, fontSize:'1.1rem',
                                        boxShadow: calcPromedio(estudianteActivo.id) >= 3 ? '0 4px 12px rgba(16,185,129,0.4)' : 'none'
                                    }}>
                                        {calcPromedio(estudianteActivo.id) > 0 ? calcPromedio(estudianteActivo.id).toFixed(1) : '–'}
                                    </div>
                                    <p style={{ margin:'4px 0 0', fontSize:'0.65rem', fontWeight:700, color:'#6b7280' }}>PROMEDIO</p>
                                </div>
                            </div>

                            <RubricaGrid
                                criterios={rubrica.criterios}
                                scores={puntajes[estudianteActivo.id] || {}}
                                onScore={(cid, val) => setScore(estudianteActivo.id, cid, val)}
                            />

                            <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                {guardados[estudianteActivo.id] && (
                                    <span style={{ color:'#10b981', fontWeight:700, fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'4px' }}>
                                        <CheckCircle size={14}/> Calificación guardada
                                    </span>
                                )}
                                <button className="eval-btn-primary" style={{ marginLeft:'auto' }}
                                    onClick={() => handleGuardar(estudianteActivo.id)} disabled={saving}>
                                    {saving ? 'Guardando...' : <><CheckCircle size={14}/> Guardar nota</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
