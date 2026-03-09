import React from 'react';
import { Trash2, BookOpen, PenLine, Edit2 } from 'lucide-react';

export default function GestionRubricas({ rubricas, loading, onEditar, onEliminar }) {
    if (loading) return <div className="eval-empty"><p>Cargando...</p></div>;

    if (!rubricas || rubricas.length === 0) return (
        <div className="eval-empty">
            <BookOpen size={40} />
            <p>Aún no tienes rúbricas creadas.</p>
            <p style={{ fontSize:'0.78rem', marginTop:'4px' }}>Usa el botón <strong>+ Nueva Rúbrica</strong> para empezar.</p>
        </div>
    );

    return (
        <div className="eval-grid">
            {rubricas.map(r => (
                <div key={r.id} className="eval-card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <div style={{ background:'#ede9fe', padding:'8px', borderRadius:'10px', color:'#7c3aed' }}>
                                <PenLine size={16}/>
                            </div>
                            <h3 style={{ fontWeight:700, color:'#1e1b4b', fontSize:'0.95rem', margin:0 }}>{r.titulo}</h3>
                        </div>
                        <div style={{ display:'flex', gap:'4px' }}>
                            <button title="Editar" onClick={() => onEditar(r)}
                                style={{ background:'#ede9fe', border:'none', color:'#7c3aed', cursor:'pointer', padding:'6px 8px', borderRadius:'8px', display:'flex', alignItems:'center' }}>
                                <Edit2 size={14}/>
                            </button>
                            <button title="Eliminar" className="eval-btn-danger" onClick={() => onEliminar(r.id)}>
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    </div>

                    {r.descripcion && (
                        <p style={{ fontSize:'0.78rem', color:'#6b7280', marginBottom:'0.75rem', lineHeight:1.5 }}>{r.descripcion}</p>
                    )}

                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                        {r.criterios?.map(c => (
                            <span key={c.id} className="criterio-tag">{c.nombre}</span>
                        ))}
                    </div>

                    <div style={{ marginTop:'1rem', paddingTop:'0.75rem', borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{r.criterios?.length || 0} criterios · Escala 1–5</span>
                        <span className="rubrica-badge">Activa</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
