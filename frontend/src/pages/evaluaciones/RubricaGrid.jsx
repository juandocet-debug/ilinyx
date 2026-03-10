import React from 'react';
import { getNivelColor } from '../../constants/evaluaciones';

/**
 * Grid interactivo de rúbrica — permite seleccionar un nivel por criterio.
 * Reutilizado tanto en modo Individual como Colectivo.
 */
export default function RubricaGrid({ criterios, scores, onScore }) {
    if (!criterios?.length) return null;

    // Valores únicos de nivel presentes en la rúbrica
    const valoresSet = new Set();
    criterios.forEach(c => c.niveles?.forEach(n => valoresSet.add(n.valor)));
    const valores = Array.from(valoresSet).sort((a, b) => a - b);

    // Promedio solo de criterios ya calificados
    const calificados = criterios.filter(c => scores?.[c.id] > 0);
    const total = calificados.length
        ? calificados.reduce((acc, c) => acc + (scores[c.id] || 0), 0) / calificados.length
        : 0;

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                    <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid #e2e8f0', minWidth: '160px' }}>
                            Criterio
                        </th>
                        {valores.map(v => {
                            const c = getNivelColor(v);
                            return (
                                <th key={v} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', minWidth: '130px', verticalAlign: 'bottom' }}>
                                    <div style={{ fontWeight: 900, color: c.color, fontSize: '1.1rem', lineHeight: 1 }}>{v}</div>
                                    <div style={{ fontWeight: 700, color: c.color, fontSize: '0.62rem', marginTop: '2px', opacity: 0.85 }}>{c.label}</div>
                                </th>
                            );
                        })}
                        <th style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', background: '#f1f5f9', fontWeight: 800, color: '#4f46e5', fontSize: '0.68rem', textTransform: 'uppercase', minWidth: '70px' }}>
                            Parcial
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {criterios.map((c, idx) => {
                        const sel = scores?.[c.id] || 0;
                        const selColor = getNivelColor(sel);

                        return (
                            <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.6rem', flexShrink: 0 }}>
                                            {idx + 1}
                                        </span>
                                        {c.nombre}
                                    </div>
                                </td>

                                {valores.map(v => {
                                    const nivel = c.niveles?.find(n => n.valor === v);
                                    const isSelected = sel === v;
                                    const nc = getNivelColor(v);
                                    return (
                                        <td key={v} style={{ padding: '6px', verticalAlign: 'top' }}>
                                            <button
                                                onClick={() => onScore(c.id, v)}
                                                title={nivel?.descripcion || `Nivel ${v}`}
                                                style={{
                                                    width: '100%', minHeight: '70px', borderRadius: '10px',
                                                    border: `2px solid ${isSelected ? nc.color : '#e2e8f0'}`,
                                                    background: isSelected ? nc.bg : '#fff',
                                                    cursor: 'pointer', padding: '8px',
                                                    transition: 'all 0.15s', textAlign: 'left',
                                                    boxShadow: isSelected ? `0 2px 10px ${nc.color}40` : 'none',
                                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                    position: 'relative',
                                                }}
                                            >
                                                {isSelected && (
                                                    <div style={{ position: 'absolute', top: '6px', right: '6px', width: 10, height: 10, borderRadius: '50%', background: nc.color }} />
                                                )}
                                                <p style={{
                                                    margin: 0, fontSize: '0.73rem', lineHeight: 1.45,
                                                    color: isSelected ? nc.color : nivel?.descripcion ? '#374151' : '#d1d5db',
                                                    fontStyle: nivel?.descripcion ? 'normal' : 'italic',
                                                    fontWeight: isSelected ? 600 : 400,
                                                }}>
                                                    {nivel?.descripcion || 'Sin descripción'}
                                                </p>
                                            </button>
                                        </td>
                                    );
                                })}

                                <td style={{ textAlign: 'center', background: '#f8fafc', verticalAlign: 'middle' }}>
                                    {sel > 0 ? (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            width: 38, height: 38, borderRadius: '50%',
                                            background: selColor.bg, color: selColor.color,
                                            fontWeight: 900, fontSize: '1rem',
                                            border: `2px solid ${selColor.color}`,
                                        }}>{sel}</span>
                                    ) : <span style={{ color: '#d1d5db', fontSize: '1rem', fontWeight: 700 }}>–</span>}
                                </td>
                            </tr>
                        );
                    })}

                    {/* Fila total */}
                    <tr style={{ background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', borderTop: '2px solid #c4b5fd' }}>
                        <td colSpan={valores.length + 1} style={{ padding: '12px 16px', fontWeight: 800, color: '#4f46e5', fontSize: '0.82rem', textAlign: 'right', letterSpacing: '0.03em' }}>
                            PROMEDIO TOTAL — calificados {calificados.length}/{criterios.length}
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 44, height: 44, borderRadius: '50%', fontWeight: 900, fontSize: '1.1rem',
                                background: total >= 4 ? '#dcfce7' : total >= 3 ? '#fef9c3' : total > 0 ? '#fee2e2' : '#f1f5f9',
                                color: total >= 4 ? '#16a34a' : total >= 3 ? '#ca8a04' : total > 0 ? '#dc2626' : '#94a3b8',
                                border: total > 0 ? '2.5px solid currentColor' : '2px solid #e2e8f0',
                                boxShadow: total > 0 ? '0 3px 10px rgba(0,0,0,0.1)' : 'none',
                            }}>
                                {total > 0 ? total.toFixed(1) : '–'}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
