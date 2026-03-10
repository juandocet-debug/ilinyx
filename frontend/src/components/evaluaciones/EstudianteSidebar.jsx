import React from 'react';
import { Search, Edit2 } from 'lucide-react';
import Avatar from '../ui/Avatar';

/**
 * Sidebar de estudiantes con búsqueda, selección y acciones.
 *
 * @param {object} props
 * @param {object[]} props.estudiantes — Estudiantes filtrados
 * @param {string}   props.busqueda
 * @param {function} props.setBusqueda
 * @param {object}   props.estudianteActivo
 * @param {function} props.setEstudianteActivo
 * @param {function} props.calcPromedio
 * @param {object}   props.guardados
 * @param {object}   props.editando
 * @param {function} props.setEditando
 * @param {function} props.reiniciarNota
 */
export default function EstudianteSidebar({
    estudiantes, busqueda, setBusqueda,
    estudianteActivo, setEstudianteActivo,
    calcPromedio, guardados, editando, setEditando,
    reiniciarNota,
}) {
    return (
        <div className="eval-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Búsqueda */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}>
                <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o cédula..."
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', color: '#1e293b', width: '100%' }}
                />
            </div>

            {/* Lista */}
            <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {estudiantes.map(est => {
                    const promedio = calcPromedio(est.id);
                    const activo = estudianteActivo?.id === est.id;
                    const saved = guardados[est.id];
                    const enEdicion = editando[est.id];

                    return (
                        <div key={est.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                                onClick={() => setEstudianteActivo(est)}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '8px 10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                    textAlign: 'left', transition: 'all 0.15s',
                                    background: activo ? 'linear-gradient(135deg,#ede9fe,#ddd6fe)' : 'transparent',
                                    outline: activo ? '2px solid #7c3aed' : 'none',
                                }}
                            >
                                <Avatar user={est} size={34} borderColor={activo ? '#7c3aed' : 'transparent'} />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {est.first_name} {est.last_name}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: saved && !enEdicion ? '#10b981' : promedio > 0 ? '#6366f1' : '#94a3b8' }}>
                                        {saved && !enEdicion ? '✓ Guardado' : promedio > 0 ? `${promedio.toFixed(1)} / 5.0` : est.document_number || 'Sin calificar'}
                                    </div>
                                </div>
                            </button>

                            {/* Editar */}
                            {(saved || promedio > 0) && (
                                <button
                                    title="Editar calificación"
                                    onClick={() => { setEstudianteActivo(est); setEditando(p => ({ ...p, [est.id]: true })); }}
                                    style={{
                                        background: enEdicion ? '#ede9fe' : '#f1f5f9', border: 'none',
                                        color: enEdicion ? '#7c3aed' : '#64748b', cursor: 'pointer',
                                        padding: '6px', borderRadius: '8px', display: 'flex', flexShrink: 0,
                                    }}
                                >
                                    <Edit2 size={13} />
                                </button>
                            )}

                            {/* Reiniciar */}
                            {saved && (
                                <button
                                    title="Reiniciar nota"
                                    onClick={() => reiniciarNota(est.id, `${est.first_name} ${est.last_name}`)}
                                    style={{
                                        background: '#fff1f2', border: 'none', color: '#f43f5e',
                                        cursor: 'pointer', padding: '6px', borderRadius: '8px',
                                        display: 'flex', flexShrink: 0,
                                    }}
                                >
                                    🗑
                                </button>
                            )}
                        </div>
                    );
                })}

                {estudiantes.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '1rem' }}>
                        Sin resultados
                    </p>
                )}
            </div>
        </div>
    );
}
