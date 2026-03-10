import React from 'react';
import { Info } from 'lucide-react';
import RubricaGrid from '../../pages/evaluaciones/RubricaGrid';

/**
 * Panel de referencia colectiva — muestra el grid para el estudiante activo
 * y un footer con estado y opción de limpiar la referencia.
 *
 * @param {object} props
 * @param {object}   props.rubrica
 * @param {object}   props.estudianteActivo
 * @param {object}   props.currentRef       — { cid: valor } del estudiante activo
 * @param {boolean}  props.hayRef
 * @param {function} props.onScoreRef       — (cid, val) => void
 * @param {function} props.onClearRef       — () => void
 */
export default function ModoColectivo({
    rubrica, estudianteActivo, currentRef, hayRef,
    onScoreRef, onClearRef,
}) {
    const criteriosConRef = rubrica.criterios?.filter(c => (currentRef[c.id] || 0) > 0).length || 0;
    const totalCriterios = rubrica.criterios?.length || 0;

    return (
        <div className="eval-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#fff' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                    Referencia Colectiva
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#a5b4fc' }}>
                    Ingresa los puntajes de referencia. Aparecerán en el PDF junto a las notas individuales.
                </p>
            </div>

            {/* Grid */}
            <RubricaGrid
                criterios={rubrica.criterios}
                scores={currentRef}
                onScore={onScoreRef}
            />

            {/* Footer status */}
            <div style={{
                padding: '0.75rem 1.25rem', borderTop: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '8px', background: hayRef ? '#f0fdf4' : '#fffbeb',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={14} style={{ color: hayRef ? '#16a34a' : '#d97706', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: hayRef ? '#166534' : '#92400e' }}>
                        {hayRef
                            ? <>✓ Referencia añadida a <strong>{estudianteActivo?.first_name}</strong>: <strong>{criteriosConRef}/{totalCriterios}</strong> criterios.</>
                            : <>Añade los puntajes de referencia para <strong>{estudianteActivo?.first_name}</strong>.</>
                        }
                    </span>
                </div>
                {hayRef && (
                    <button
                        onClick={onClearRef}
                        style={{
                            fontSize: '0.7rem', color: '#dc2626', background: '#fee2e2',
                            border: 'none', borderRadius: '6px', padding: '4px 10px',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                    >
                        Limpiar referencia
                    </button>
                )}
            </div>
        </div>
    );
}
