import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../services/api';

export default function MisNotas({ user }) {
    const [calificaciones, setCalificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/evaluaciones/calificaciones/')
            .then(r => setCalificaciones(Array.isArray(r.data) ? r.data : r.data?.results || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="eval-empty"><p>Cargando notas...</p></div>;

    if (calificaciones.length === 0) return (
        <div className="eval-empty">
            <Star size={40}/>
            <p>Aún no tienes calificaciones registradas.</p>
        </div>
    );

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <h2 style={{ fontWeight:800, color:'#1e1b4b', margin:0 }}>Mis Calificaciones</h2>
            {calificaciones.map(cal => {
                const nota = parseFloat(cal.nota_final);
                const aprobado = nota >= 3;
                return (
                    <div key={cal.id} className="eval-card" style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:'1rem' }}>
                        <div>
                            <h3 style={{ margin:'0 0 6px', fontWeight:700, color:'#1e1b4b' }}>
                                {cal.rubrica_nombre || `Evaluación #${cal.evaluacion_grupo}`}
                            </h3>
                            {/* Criterios */}
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                                {Object.entries(cal.puntajes || {}).map(([cid, val]) => (
                                    <span key={cid} className="criterio-tag">
                                        Criterio {cid}: <strong>{val}/5</strong>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                            <div style={{
                                width:'64px', height:'64px', borderRadius:'50%',
                                background: aprobado ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                boxShadow: aprobado ? '0 4px 14px rgba(16,185,129,0.4)' : '0 4px 14px rgba(239,68,68,0.4)',
                                color:'#fff', fontWeight:900, fontSize:'1.3rem'
                            }}>
                                {nota.toFixed(1)}
                            </div>
                            <p style={{ margin:'6px 0 0', fontSize:'0.7rem', fontWeight:700, color: aprobado ? '#10b981' : '#ef4444' }}>
                                {aprobado ? 'Aprobado' : 'Reprobado'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
