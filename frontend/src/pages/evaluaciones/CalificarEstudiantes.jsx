import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Users, User, Edit2, Download } from 'lucide-react';
import useCalificacion from '../../hooks/useCalificacion';
import Avatar from '../../components/ui/Avatar';
import EstudianteSidebar from '../../components/evaluaciones/EstudianteSidebar';
import ModoColectivo from '../../components/evaluaciones/ModoColectivo';
import RubricaGrid from './RubricaGrid';
import EvalPDF from './EvalPDF';

/**
 * Orquestador principal de calificación por rúbrica.
 * Toda la lógica de estado vive en useCalificacion.
 * Toda la UI de bloques vive en componentes dedicados.
 */
export default function CalificarEstudiantes({ evaluacion, curso, onBack }) {
    const [modo, setModo] = useState('individual');
    const [busqueda, setBusqueda] = useState('');
    const [estudianteActivo, setEstudianteActivo] = useState(null);
    const [showPDF, setShowPDF] = useState(false);

    const todosEstudiantes = curso?.students || [];
    const estudiantes = busqueda.trim()
        ? todosEstudiantes.filter(e => {
            const q = busqueda.toLowerCase();
            return `${e.first_name} ${e.last_name}`.toLowerCase().includes(q)
                || (e.document_number || '').includes(q);
        })
        : todosEstudiantes;

    const {
        rubrica, puntajes, refPuntajes, guardados, editando, saving,
        setScore, setScoreRef, clearRefForStudent, setEditando,
        calcPromedio, puedeEditar, guardar, reiniciarNota, reiniciarGrupo,
    } = useCalificacion(evaluacion, todosEstudiantes);

    // Seleccionar primer estudiante cuando carga la rúbrica
    React.useEffect(() => {
        if (rubrica && todosEstudiantes.length && !estudianteActivo) {
            setEstudianteActivo(todosEstudiantes[0]);
        }
    }, [rubrica, todosEstudiantes.length]);

    if (!rubrica) return <div className="eval-empty"><p>Cargando rúbrica...</p></div>;

    if (showPDF) {
        return (
            <EvalPDF
                rubrica={rubrica} curso={curso} puntajes={puntajes}
                colScores={refPuntajes} calcPromedio={calcPromedio}
                onClose={() => setShowPDF(false)}
            />
        );
    }

    const currentRef = refPuntajes[estudianteActivo?.id] || {};
    const hayRef = rubrica.criterios?.some(c => (currentRef[c.id] || 0) > 0);

    return (
        <div className="eval-page">
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={onBack} className="eval-btn-ghost"><ArrowLeft size={14} /> Volver</button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontWeight: 800, color: '#1e1b4b', fontSize: '1.1rem' }}>{curso?.name}</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
                        Rúbrica: <strong>{rubrica.titulo}</strong> · {rubrica.criterios?.length} criterios
                    </p>
                </div>
                <button className="eval-btn-ghost" onClick={() => setShowPDF(true)}>
                    <Download size={14} /> Descargar PDF
                </button>
                {Object.keys(guardados).length > 0 && (
                    <button onClick={reiniciarGrupo}
                        style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚠️ Reiniciar notas ({Object.keys(guardados).length})
                    </button>
                )}
                <div className="eval-tabs">
                    <button className={modo === 'individual' ? 'active' : ''} onClick={() => setModo('individual')}><User size={13} style={{ marginRight: 4 }} /> Individual</button>
                    <button className={modo === 'colectivo' ? 'active' : ''} onClick={() => setModo('colectivo')}><Users size={13} style={{ marginRight: 4 }} /> Colectivo</button>
                </div>
            </div>

            {/* ── Body ── */}
            {modo === 'colectivo' ? (
                <ModoColectivo
                    rubrica={rubrica}
                    estudianteActivo={estudianteActivo}
                    currentRef={currentRef}
                    hayRef={hayRef}
                    onScoreRef={(cid, val) => setScoreRef(estudianteActivo?.id, cid, val)}
                    onClearRef={() => clearRefForStudent(estudianteActivo?.id)}
                />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem', alignItems: 'start' }}>
                    <EstudianteSidebar
                        estudiantes={estudiantes} busqueda={busqueda} setBusqueda={setBusqueda}
                        estudianteActivo={estudianteActivo} setEstudianteActivo={setEstudianteActivo}
                        calcPromedio={calcPromedio} guardados={guardados} editando={editando}
                        setEditando={setEditando} reiniciarNota={reiniciarNota}
                    />

                    {/* Panel rúbrica */}
                    {estudianteActivo && (
                        <div className="eval-card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Header estudiante */}
                            <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                <Avatar user={estudianteActivo} size={44} borderColor="#ede9fe" />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontWeight: 800, color: '#1e1b4b' }}>{estudianteActivo.first_name} {estudianteActivo.last_name}</h3>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                        {estudianteActivo.document_number ? `CC ${estudianteActivo.document_number} · ` : ''}{estudianteActivo.email}
                                    </p>
                                </div>
                                {guardados[estudianteActivo.id] && !editando[estudianteActivo.id] && (
                                    <span style={{ background: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle size={12} /> Guardado
                                    </span>
                                )}
                                {editando[estudianteActivo.id] && (
                                    <span style={{ background: '#fef9c3', color: '#ca8a04', fontWeight: 700, fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px' }}>
                                        ✏️ Editando
                                    </span>
                                )}
                            </div>

                            {/* Grid de rúbrica */}
                            <div style={{ opacity: puedeEditar(estudianteActivo.id) ? 1 : 0.65, pointerEvents: puedeEditar(estudianteActivo.id) ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                                <RubricaGrid
                                    criterios={rubrica.criterios}
                                    scores={puntajes[estudianteActivo.id] || {}}
                                    onScore={(cid, val) => setScore(estudianteActivo.id, cid, val)}
                                />
                            </div>

                            {/* Footer con acciones */}
                            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                {puedeEditar(estudianteActivo.id) ? (
                                    <button className="eval-btn-primary" onClick={() => guardar(estudianteActivo.id)} disabled={saving}>
                                        {saving ? 'Guardando...' : <><CheckCircle size={14} /> Guardar nota</>}
                                    </button>
                                ) : (
                                    <button className="eval-btn-ghost" onClick={() => setEditando(p => ({ ...p, [estudianteActivo.id]: true }))}>
                                        <Edit2 size={14} /> Editar calificación
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
