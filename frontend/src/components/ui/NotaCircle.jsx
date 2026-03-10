import React from 'react';

/**
 * Círculo visual de nota con estado aprobado/reprobado.
 * Reutilizable en EvalPDF y cualquier vista de calificación.
 *
 * @param {{ val: number, label?: string, size?: number }} props
 */
export default function NotaCircle({ val, label, size = 52 }) {
    const empty = !val || val === 0;
    const ok = val >= 3;

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: size, height: size, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: empty ? '#F8FAFC' : ok ? '#F0FDF4' : '#FEF2F2',
                border: `2.5px solid ${empty ? '#E2E8F0' : ok ? '#86EFAC' : '#FCA5A5'}`,
                color: empty ? '#CBD5E1' : ok ? '#15803D' : '#B91C1C',
                fontWeight: 900, fontSize: size > 50 ? '1.2rem' : '0.85rem',
                margin: '0 auto',
            }}>
                {empty ? '—' : val.toFixed(1)}
            </div>
            {label && (
                <p style={{ margin: '3px 0 0', fontSize: '0.6rem', color: '#94A3B8', fontWeight: 600 }}>
                    {label}
                </p>
            )}
            {!empty && (
                <p style={{
                    margin: '2px 0 0', fontSize: '0.6rem', fontWeight: 700,
                    color: ok ? '#15803D' : '#B91C1C', letterSpacing: '0.04em',
                }}>
                    {ok ? 'APROBADO' : 'REPROBADO'}
                </p>
            )}
        </div>
    );
}
