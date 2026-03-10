import React, { useState } from 'react';

/**
 * Avatar con fallback a iniciales.
 * Reutilizable en CalificarEstudiantes, EvalPDF, EstudianteSidebar, etc.
 *
 * @param {{ user: object, size?: number, borderColor?: string }} props
 */
export default function Avatar({ user, size = 40, borderColor = '#C7D2FE' }) {
    const [err, setErr] = useState(false);

    const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`;

    if (user.photo && !err) {
        return (
            <img
                src={user.photo}
                alt={initials}
                onError={() => setErr(true)}
                style={{
                    width: size, height: size, borderRadius: '50%',
                    objectFit: 'cover', flexShrink: 0,
                    border: `2.5px solid ${borderColor}`,
                }}
            />
        );
    }

    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #818CF8, #6D28D9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: size * 0.34,
            border: `2.5px solid ${borderColor}`,
        }}>
            {initials}
        </div>
    );
}
