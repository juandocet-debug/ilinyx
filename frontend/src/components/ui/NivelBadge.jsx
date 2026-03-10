import React from 'react';
import { NIVEL_LABELS, getNivelStyle } from '../../constants/evaluaciones';

/**
 * Pill de nivel de logro — versión compacta.
 * Muestra "5 · Excelente" con colores semánticos.
 *
 * @param {{ val: number, small?: boolean }} props
 */
export default function NivelBadge({ val, small }) {
    if (!val) {
        return (
            <span style={{ color: '#CBD5E1', fontSize: small ? '0.65rem' : '0.72rem' }}>
                —
            </span>
        );
    }

    const s = getNivelStyle(val);

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: small ? '2px 7px' : '3px 10px',
            borderRadius: 20,
            background: s.bg, color: s.color,
            fontWeight: 700, fontSize: small ? '0.65rem' : '0.72rem',
            border: `1px solid ${s.color}33`,
            whiteSpace: 'nowrap',
        }}>
            <strong>{val}</strong> · {NIVEL_LABELS[val] || `Lv${val}`}
        </span>
    );
}
