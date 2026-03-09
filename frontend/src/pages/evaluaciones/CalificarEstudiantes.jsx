import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, CheckCircle, Users, User, Edit2, Download } from 'lucide-react';
import api from '../../services/api';
import RubricaGrid from './RubricaGrid';
import EvalPDF from './EvalPDF';

export default function CalificarEstudiantes({ evaluacion, curso, onBack }) {
    const [rubrica, setRubrica] = useState(null);
    const [modo, setModo] = useState('individual');
    const [busqueda, setBusqueda] = useState('');
    const [estudianteActivo, setEstudianteActivo] = useState(null);
    const [puntajes, setPuntajes] = useState({});    // { uid: { cid: valor } }
    const [guardados, setGuardados] = useState({});   // { uid: true }
    const [editando, setEditando] = useState({});    // { uid: true } unlock edit
    const [saving, setSaving] = useState(false);
    const [showPDF, setShowPDF] = useState(false);

    const todosEstudiantes = curso?.students || [];
    const estudiantes = busqueda.trim()
        ? todosEstudiantes.filter(e => {
            const q = busqueda.toLowerCase();
            return `${e.first_name} ${e.last_name}`.toLowerCase().includes(q)
                || (e.document_number || '').includes(q);
          })
        : todosEstudiantes;

    // Cargar rubrica + calificaciones existentes del DB
    useEffect(() => {
        Promise.all([
            api.get(`/evaluaciones/rubricas/${evaluacion.rubrica}/`),
            api.get(`/evaluaciones/calificaciones/?evaluacion_id=${evaluacion.id}`),
        ]).then(([rRes, cRes]) => {
            setRubrica(rRes.data);
            const cals = Array.isArray(cRes.data) ? cRes.data : cRes.data?.results || [];
            const pMap = {};
            const gMap = {};
            cals.forEach(c => {
                // puntajes del DB tienen claves como strings → convertir a number
                const normalized = {};
                Object.entries(c.puntajes || {}).forEach(([k, v]) => {
                    normalized[parseInt(k)] = v;
                });
                pMap[c.usuario_agon_id] = normalized;
                gMap[c.usuario_agon_id] = true;
            });
            setPuntajes(pMap);
            setGuardados(gMap);
            if (todosEstudiantes.length) setEstudianteActivo(todosEstudiantes[0]);
        });
    }, []);

    const setScore = (uid, cid, val) =>
        setPuntajes(p => ({ ...p, [uid]: { ...(p[uid] || {}), [cid]: val } }));

    const setScoreCol = (cid, val) => {
        const update = {};
        todosEstudiantes.forEach(e => {
            update[e.id] = { ...(puntajes[e.id] || {}), [cid]: val };
        });
        setPuntajes(p => ({ ...p, ...update }));
    };

    const calcPromedio = useCallback((uid) => {
        if (!rubrica?.criterios?.length) return 0;
        const vals = rubrica.criterios.map(c => puntajes[uid]?.[c.id] || 0).filter(v => v > 0);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }, [rubrica, puntajes]);

    const guardar = async (uid) => {
        setSaving(true);
        try {
            await api.post('/evaluaciones/calificaciones/guardar_batch/', {
                evaluacion_grupo: evaluacion.id,
                usuario_agon_id: uid,
                puntajes: puntajes[uid] || {},
                nota_final: parseFloat(calcPromedio(uid).toFixed(2)),
            });
            setGuardados(p => ({ ...p, [uid]: true }));
            setEditando(p => ({ ...p, [uid]: false }));
        } catch (e) {
            console.error('Error guardando:', e?.response?.data || e.message);
            alert('No se pudo guardar la nota: ' + (e?.response?.data?.error || e.message));
        } finally {
            setSaving(false);
        }
    };

    const guardarTodos = async () => {
        setSaving(true);
        try {
            for (const e of todosEstudiantes) {
                await api.post('/evaluaciones/calificaciones/guardar_batch/', {
                    evaluacion_grupo: evaluacion.id,
                    usuario_agon_id: e.id,
                    puntajes: puntajes[e.id] || {},
                    nota_final: parseFloat(calcPromedio(e.id).toFixed(2)),
                });
                setGuardados(p => ({ ...p, [e.id]: true }));
            }
        } catch (e) {
            console.error('Error guardando colectivo:', e?.response?.data || e.message);
        } finally {
            setSaving(false);
        }
    };

    const puedeEditar = (uid) => !guardados[uid] || editando[uid];

    if (!rubrica) return <div className="eval-empty"><p>Cargando rúbrica...</p></div>;

    if (showPDF) {
        return (
            <EvalPDF
                rubrica={rubrica}
                curso={curso}
                puntajes={puntajes}
                calcPromedio={calcPromedio}
                onClose={() => setShowPDF(false)}
            />
        );
    }

    const colScores = rubrica.criterios?.reduce((acc, c) => {
        const vals = todosEstudiantes.map(e => puntajes[e.id]?.[c.id]);
        acc[c.id] = vals.every(v => v !== undefined && v === vals[0]) ? vals[0] || 0 : 0;
        return acc;
    }, {});

    return (
        <div className="eval-page">
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                <button onClick={onBack} className="eval-btn-ghost"><ArrowLeft size={14}/> Volver</button>
                <div style={{ flex:1 }}>
                    <h2 style={{ margin:0, fontWeight:800, color:'#1e1b4b', fontSize:'1.1rem' }}>{curso?.name}</h2>
                    <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#6b7280' }}>
                        Rúbrica: <strong>{rubrica.titulo}</strong> · {rubrica.criterios?.length} criterios
                    </p>
                </div>
                <button className="eval-btn-ghost" onClick={() => setShowPDF(true)}>
                    <Download size={14}/> Descargar PDF
                </button>
                <div className="eval-tabs">
                    <button className={modo==='individual'?'active':''} onClick={() => setModo('individual')}><User size={13} style={{marginRight:4}}/> Individual</button>
                    <button className={modo==='colectivo'?'active':''} onClick={() => setModo('colectivo')}><Users size={13} style={{marginRight:4}}/> Colectivo</button>
                </div>
            </div>

            {modo === 'colectivo' ? (
                <div className="eval-card" style={{ padding:0, overflow:'hidden' }}>
                    <div style={{ padding:'1rem 1.25rem', background:'linear-gradient(135deg,#1e1b4b,#312e81)', color:'#fff' }}>
                        <h3 style={{ margin:0, fontSize:'0.95rem', fontWeight:700 }}>Evaluación Colectiva — {todosEstudiantes.length} estudiantes</h3>
                    </div>
                    <RubricaGrid criterios={rubrica.criterios} scores={colScores} onScore={(cid, val) => setScoreCol(cid, val)} />
                    <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end' }}>
                        <button className="eval-btn-primary" onClick={guardarTodos} disabled={saving}>
                            {saving ? 'Guardando...' : <><CheckCircle size={15}/> Guardar para todos</>}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'1rem', alignItems:'start' }}>
                    {/* Sidebar */}
                    <div className="eval-card" style={{ padding:'10px', display:'flex', flexDirection:'column', gap:'6px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', background:'#f8fafc', borderRadius:'10px', border:'1.5px solid #e2e8f0' }}>
                            <Search size={14} style={{ color:'#94a3b8', flexShrink:0 }}/>
                            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre o cédula..."
                                style={{ border:'none', background:'transparent', outline:'none', fontSize:'0.8rem', color:'#1e293b', width:'100%' }}/>
                        </div>
                        <div style={{ maxHeight:'60vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:'3px' }}>
                            {estudiantes.map(est => {
                                const promedio = calcPromedio(est.id);
                                const activo = estudianteActivo?.id === est.id;
                                const saved = guardados[est.id];
                                const enEdicion = editando[est.id];
                                return (
                                    <div key={est.id} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                                        <button onClick={() => setEstudianteActivo(est)}
                                            style={{ flex:1, display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'10px', border:'none', cursor:'pointer', textAlign:'left', background: activo ? 'linear-gradient(135deg,#ede9fe,#ddd6fe)' : 'transparent', outline: activo ? '2px solid #7c3aed' : 'none', transition:'all 0.15s' }}>
                                            {est.photo
                                                ? <img src={est.photo} alt="" style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover', flexShrink:0, border: activo ? '2px solid #7c3aed' : '2px solid transparent' }}/>
                                                : <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#818cf8,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff', fontWeight:700, fontSize:'0.75rem' }}>
                                                    {est.first_name?.[0]}{est.last_name?.[0]}
                                                  </div>
                                            }
                                            <div style={{ flex:1, overflow:'hidden' }}>
                                                <div style={{ fontWeight:600, color:'#1e293b', fontSize:'0.8rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                                    {est.first_name} {est.last_name}
                                                </div>
                                                <div style={{ fontSize:'0.68rem', fontWeight:600, color: saved && !enEdicion ? '#10b981' : promedio > 0 ? '#6366f1' : '#94a3b8' }}>
                                                    {saved && !enEdicion ? '✓ Guardado' : promedio > 0 ? `${promedio.toFixed(1)} / 5.0` : est.document_number || 'Sin calificar'}
                                                </div>
                                            </div>
                                        </button>
                                        {/* Botón editar: aparece si ya está guardado O si hay nota cargada del DB */}
                                        {(saved || calcPromedio(est.id) > 0) && (
                                            <button title="Editar calificación"
                                                onClick={() => { setEstudianteActivo(est); setEditando(p => ({ ...p, [est.id]: true })); }}
                                                style={{ background: enEdicion ? '#ede9fe' : '#f1f5f9', border:'none', color: enEdicion ? '#7c3aed' : '#64748b', cursor:'pointer', padding:'6px', borderRadius:'8px', display:'flex', flexShrink:0, transition:'all 0.15s' }}>
                                                <Edit2 size={13}/>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {estudiantes.length === 0 && (
                                <p style={{ textAlign:'center', color:'#94a3b8', fontSize:'0.8rem', padding:'1rem' }}>Sin resultados</p>
                            )}
                        </div>
                    </div>

                    {/* Panel rúbrica */}
                    {estudianteActivo && (
                        <div className="eval-card" style={{ padding:0, overflow:'hidden' }}>
                            <div style={{ padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid #f1f5f9' }}>
                                {estudianteActivo.photo
                                    ? <img src={estudianteActivo.photo} alt="" style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'3px solid #ede9fe' }}/>
                                    : <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1rem' }}>
                                        {estudianteActivo.first_name?.[0]}{estudianteActivo.last_name?.[0]}
                                      </div>
                                }
                                <div style={{ flex:1 }}>
                                    <h3 style={{ margin:0, fontWeight:800, color:'#1e1b4b' }}>{estudianteActivo.first_name} {estudianteActivo.last_name}</h3>
                                    <p style={{ margin:'2px 0 0', fontSize:'0.75rem', color:'#6b7280' }}>
                                        {estudianteActivo.document_number ? `CC ${estudianteActivo.document_number} · ` : ''}{estudianteActivo.email}
                                    </p>
                                </div>
                                {/* Badge estado */}
                                {guardados[estudianteActivo.id] && !editando[estudianteActivo.id] && (
                                    <span style={{ background:'#dcfce7', color:'#16a34a', fontWeight:700, fontSize:'0.72rem', padding:'4px 10px', borderRadius:'20px', display:'flex', alignItems:'center', gap:'4px' }}>
                                        <CheckCircle size={12}/> Guardado
                                    </span>
                                )}
                                {editando[estudianteActivo.id] && (
                                    <span style={{ background:'#fef9c3', color:'#ca8a04', fontWeight:700, fontSize:'0.72rem', padding:'4px 10px', borderRadius:'20px' }}>
                                        ✏️ Editando
                                    </span>
                                )}
                            </div>

                            {/* Grid (deshabilitado si guardado y no editando) */}
                            <div style={{ opacity: puedeEditar(estudianteActivo.id) ? 1 : 0.65, pointerEvents: puedeEditar(estudianteActivo.id) ? 'auto' : 'none', transition:'opacity 0.2s' }}>
                                <RubricaGrid
                                    criterios={rubrica.criterios}
                                    scores={puntajes[estudianteActivo.id] || {}}
                                    onScore={(cid, val) => setScore(estudianteActivo.id, cid, val)}
                                />
                            </div>

                            <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:'8px' }}>
                                {puedeEditar(estudianteActivo.id) ? (
                                    <button className="eval-btn-primary" onClick={() => guardar(estudianteActivo.id)} disabled={saving}>
                                        {saving ? 'Guardando...' : <><CheckCircle size={14}/> Guardar nota</>}
                                    </button>
                                ) : (
                                    <button className="eval-btn-ghost" onClick={() => setEditando(p => ({ ...p, [estudianteActivo.id]: true }))}>
                                        <Edit2 size={14}/> Editar calificación
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
