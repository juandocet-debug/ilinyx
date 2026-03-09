import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import api from '../../services/api';

export default function CalificarEstudiantes({ evaluacion, curso, onBack }) {
    const { saveCalificacion, rubricas } = useEvaluaciones();
    const [rubrica, setRubrica] = useState(null);
    const [estudiantes, setEstudiantes] = useState([]);
    const [puntajes, setPuntajes] = useState({}); // { userId: { criterioId: valor } }
    const [guardados, setGuardados] = useState({});
    const [saving, setSaving] = useState(null);

    useEffect(() => {
        // Cargar rubrica completa con criterios
        api.get(`/evaluaciones/rubricas/${evaluacion.rubrica}/`)
            .then(r => setRubrica(r.data))
            .catch(() => {});

        // Los estudiantes vienen del objeto curso de AGON
        const ests = curso?.students || [];
        setEstudiantes(ests);
    }, [evaluacion, curso]);

    const setScore = (userId, criterioId, valor) => {
        setPuntajes(prev => ({
            ...prev,
            [userId]: { ...(prev[userId] || {}), [criterioId]: valor }
        }));
    };

    const getPromedio = (userId) => {
        if (!rubrica?.criterios?.length) return '-';
        const scores = puntajes[userId] || {};
        const vals = rubrica.criterios.map(c => scores[c.id] || 0);
        const promedio = vals.reduce((a, b) => a + b, 0) / vals.length;
        return promedio.toFixed(1);
    };

    const handleGuardar = async (userId) => {
        if (!rubrica?.criterios?.length) return;
        const scores = puntajes[userId] || {};
        const vals = rubrica.criterios.map(c => scores[c.id] || 0);
        const nota_final = vals.reduce((a, b) => a + b, 0) / vals.length;

        setSaving(userId);
        await saveCalificacion({
            evaluacion_grupo: evaluacion.id,
            usuario_agon_id: userId,
            puntajes: scores,
            nota_final: parseFloat(nota_final.toFixed(2))
        });
        setSaving(null);
        setGuardados(prev => ({ ...prev, [userId]: true }));
    };

    if (!rubrica) return (
        <div style={{ padding:'2rem', textAlign:'center', color:'#64748b' }}>Cargando rúbrica...</div>
    );

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            {/* Back header */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <button onClick={onBack} className="eval-btn-ghost">
                    <ArrowLeft size={15}/> Volver
                </button>
                <div>
                    <h2 style={{ margin:0, fontWeight:800, color:'#1e1b4b', fontSize:'1.1rem' }}>
                        Calificar — {curso?.name}
                    </h2>
                    <p style={{ margin:0, fontSize:'0.78rem', color:'#6b7280' }}>
                        Rúbrica: <strong>{rubrica.titulo}</strong> · {rubrica.criterios?.length} criterios · Escala 1–5
                    </p>
                </div>
            </div>

            {/* Tabla de calificaciones */}
            {estudiantes.length === 0 ? (
                <div className="eval-empty"><p>Este grupo no tiene estudiantes registrados en AGON.</p></div>
            ) : (
                <div className="eval-card" style={{ overflow:'auto', padding:0 }}>
                    <table className="calif-table">
                        <thead>
                            <tr>
                                <th style={{ minWidth:'160px' }}>Estudiante</th>
                                {rubrica.criterios?.map(c => (
                                    <th key={c.id} style={{ minWidth:'120px', textAlign:'center' }}>{c.nombre}</th>
                                ))}
                                <th style={{ textAlign:'center', color:'#4f46e5' }}>Promedio</th>
                                <th style={{ textAlign:'center' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantes.map(est => (
                                <tr key={est.id}>
                                    <td>
                                        <div style={{ fontWeight:600, color:'#1e293b', fontSize:'0.83rem' }}>
                                            {est.first_name} {est.last_name}
                                        </div>
                                        <div style={{ fontSize:'0.7rem', color:'#94a3b8' }}>{est.email}</div>
                                    </td>
                                    {rubrica.criterios?.map(c => {
                                        const val = puntajes[est.id]?.[c.id] || 0;
                                        return (
                                            <td key={c.id}>
                                                <div style={{ display:'flex', gap:'4px', justifyContent:'center' }}>
                                                    {[1,2,3,4,5].map(n => (
                                                        <button key={n}
                                                            className={`score-pill${val === n ? ' selected' : ''}`}
                                                            onClick={() => setScore(est.id, c.id, n)}>
                                                            {n}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td style={{ textAlign:'center' }}>
                                        <span style={{
                                            fontWeight:800, fontSize:'1.1rem',
                                            color: parseFloat(getPromedio(est.id)) >= 3 ? '#10b981' : '#ef4444'
                                        }}>
                                            {getPromedio(est.id)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign:'center' }}>
                                        {guardados[est.id] ? (
                                            <span style={{ color:'#10b981', display:'flex', alignItems:'center', gap:'4px', justifyContent:'center', fontSize:'0.8rem', fontWeight:700 }}>
                                                <CheckCircle size={14}/> Guardado
                                            </span>
                                        ) : (
                                            <button className="eval-btn-primary"
                                                style={{ padding:'6px 14px', fontSize:'0.78rem', boxShadow:'none' }}
                                                onClick={() => handleGuardar(est.id)}
                                                disabled={saving === est.id}>
                                                {saving === est.id ? '...' : <><Save size={13}/> Guardar</>}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
