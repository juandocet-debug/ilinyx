import React from 'react';
import Avatar from '../ui/Avatar';
import NotaCircle from '../ui/NotaCircle';
import NivelBadge from '../ui/NivelBadge';
import { calcPromedioFromScores } from '../../constants/evaluaciones';

/**
 * Sección PDF de un solo estudiante — header + tabla de criterios.
 * Componente puro de presentación, sin lógica de estado.
 *
 * @param {object} props
 * @param {object}   props.est          — Estudiante
 * @param {number}   props.idx          — Índice (para numerar)
 * @param {object}   props.rubrica      — La rúbrica completa
 * @param {object}   props.puntajes     — Puntajes del evaluador { cid: val }
 * @param {object}   props.refScores    — Puntajes de referencia { cid: val }
 * @param {number}   props.profeAvg     — Promedio del evaluador
 */
export default function EstudiantePDF({ est, idx, rubrica, puntajes, refScores, profeAvg }) {
    const promedioRef = calcPromedioFromScores(rubrica.criterios, refScores);

    const notaFinal = (profeAvg > 0 && promedioRef > 0)
        ? (profeAvg + promedioRef) / 2
        : profeAvg;

    return (
        <div style={{ marginBottom: 28, pageBreakInside: 'avoid' }}>
            {/* Header estudiante */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', marginBottom: 10,
                background: '#F8FAFC', borderRadius: 10,
                border: '1px solid #E2E8F0',
            }}>
                <Avatar user={est} size={50} />

                <div style={{ flex: 1 }}>
                    <strong style={{ color: '#1E293B', fontSize: '0.92rem' }}>
                        {idx + 1}. {est.first_name} {est.last_name}
                    </strong>
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748B' }}>
                        {est.document_number ? `C.C. ${est.document_number}` : ''}
                        {est.document_number && est.email ? ' · ' : ''}
                        {est.email}
                    </p>
                </div>

                {/* Notas */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexShrink: 0 }}>
                    {profeAvg > 0 && <NotaCircle val={profeAvg} label="Evaluador" size={50} />}
                    {promedioRef > 0 && <NotaCircle val={promedioRef} label="Referencia" size={50} />}
                    {profeAvg > 0 && (
                        <>
                            <div style={{ width: 1, height: 48, background: '#E2E8F0' }} />
                            <NotaCircle val={notaFinal} label="Nota Final" size={58} />
                        </>
                    )}
                    {profeAvg === 0 && (
                        <span style={{
                            fontSize: '0.72rem', color: '#94A3B8', fontStyle: 'italic',
                            padding: '6px 12px', background: '#F8FAFC',
                            border: '1px solid #E2E8F0', borderRadius: 8,
                        }}>
                            Sin evaluar
                        </span>
                    )}
                </div>
            </div>

            {/* Tabla de criterios */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem' }}>
                <thead>
                    <tr style={{ background: '#F1F5F9' }}>
                        <th style={{ padding: '7px 10px', textAlign: 'left', width: '4%', color: '#94A3B8', fontWeight: 700, borderBottom: '2px solid #E2E8F0' }}>#</th>
                        <th style={{ padding: '7px 10px', textAlign: 'left', width: '24%', color: '#475569', fontWeight: 700, borderBottom: '2px solid #E2E8F0' }}>Criterio</th>
                        <th style={{ padding: '7px 10px', textAlign: 'left', color: '#4338CA', fontWeight: 700, borderBottom: '2px solid #C7D2FE', background: '#EEF2FF' }}>
                            Nivel alcanzado — Evaluador
                        </th>
                        <th style={{ padding: '7px 10px', textAlign: 'left', color: '#0369A1', fontWeight: 700, borderBottom: '2px solid #BAE6FD', background: '#F0F9FF' }}>
                            Nivel alcanzado — Referencia
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rubrica.criterios?.map((c, ci) => {
                        const selP = puntajes?.[c.id] || 0;
                        const selR = refScores?.[c.id] || 0;
                        const nivelP = c.niveles?.find(n => n.valor === selP);
                        const nivelR = c.niveles?.find(n => n.valor === selR);

                        return (
                            <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9', background: ci % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                                <td style={{ padding: '9px 10px', color: '#CBD5E1', fontWeight: 700, verticalAlign: 'top' }}>{ci + 1}</td>
                                <td style={{ padding: '9px 10px', fontWeight: 700, color: '#1E293B', verticalAlign: 'top', lineHeight: 1.4 }}>{c.nombre}</td>
                                <td style={{ padding: '9px 10px', background: selP ? '#F5F7FF' : 'transparent', verticalAlign: 'top' }}>
                                    <NivelBadge val={selP} />
                                    {nivelP?.descripcion && (
                                        <p style={{ margin: '4px 0 0', fontSize: '0.67rem', color: '#475569', lineHeight: 1.45 }}>
                                            {nivelP.descripcion}
                                        </p>
                                    )}
                                </td>
                                <td style={{ padding: '9px 10px', background: selR ? '#F0F9FF' : '#FAFCFF', verticalAlign: 'top' }}>
                                    {selR ? (
                                        <>
                                            <NivelBadge val={selR} small />
                                            {nivelR?.descripcion && (
                                                <p style={{ margin: '4px 0 0', fontSize: '0.67rem', color: '#0369A1', lineHeight: 1.45 }}>
                                                    {nivelR.descripcion}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <span style={{ fontSize: '0.67rem', color: '#CBD5E1', fontStyle: 'italic' }}>Sin referencia</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}

                    {/* Fila promedio */}
                    <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0' }}>
                        <td colSpan={2} style={{ padding: '9px 10px', fontWeight: 700, color: '#64748B', fontSize: '0.72rem', textAlign: 'right', letterSpacing: '0.05em' }}>
                            PROMEDIO
                        </td>
                        <td style={{ padding: '9px 10px', background: '#EEF2FF' }}>
                            <NivelBadge val={profeAvg > 0 ? Math.round(profeAvg) : 0} />
                            {profeAvg > 0 && (
                                <span style={{ marginLeft: 8, fontWeight: 800, color: '#4338CA', fontSize: '0.8rem' }}>
                                    {profeAvg.toFixed(2)}
                                </span>
                            )}
                        </td>
                        <td style={{ padding: '9px 10px', background: '#F0F9FF' }}>
                            {promedioRef > 0 ? (
                                <>
                                    <NivelBadge val={Math.round(promedioRef)} small />
                                    <span style={{ marginLeft: 8, fontWeight: 800, color: '#0369A1', fontSize: '0.8rem' }}>
                                        {promedioRef.toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span style={{ fontSize: '0.7rem', color: '#CBD5E1', fontStyle: 'italic' }}>Sin referencia</span>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
