import React from 'react';

const NIVELES = [
    { valor: 1, label: '1', desc: 'Insuficiente', color: '#ef4444', bg: '#fee2e2' },
    { valor: 2, label: '2', desc: 'Básico',       color: '#f97316', bg: '#ffedd5' },
    { valor: 3, label: '3', desc: 'Adecuado',     color: '#eab308', bg: '#fef9c3' },
    { valor: 4, label: '4', desc: 'Bueno',        color: '#22c55e', bg: '#dcfce7' },
    { valor: 5, label: '5', desc: 'Excelente',    color: '#6366f1', bg: '#ede9fe' },
];

export default function RubricaGrid({ criterios, scores, onScore }) {
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                <thead>
                    <tr style={{ background:'#f8fafc' }}>
                        <th style={{ padding:'10px 16px', textAlign:'left', fontWeight:800, color:'#64748b', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'2px solid #e2e8f0', minWidth:'180px' }}>
                            Criterio
                        </th>
                        {NIVELES.map(n => (
                            <th key={n.valor} style={{ padding:'10px 8px', textAlign:'center', borderBottom:'2px solid #e2e8f0', minWidth:'90px' }}>
                                <div style={{ fontWeight:800, color: n.color, fontSize:'1rem' }}>{n.label}</div>
                                <div style={{ fontWeight:600, color: n.color, fontSize:'0.65rem', opacity:0.8 }}>{n.desc}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {criterios?.map((c, idx) => {
                        const sel = scores?.[c.id] || 0;
                        return (
                            <tr key={c.id} style={{ borderBottom:'1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                <td style={{ padding:'12px 16px', fontWeight:600, color:'#1e293b' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                        <span style={{
                                            width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                            display:'inline-flex', alignItems:'center', justifyContent:'center',
                                            color:'#fff', fontWeight:800, fontSize:'0.65rem', flexShrink:0
                                        }}>{idx + 1}</span>
                                        {c.nombre}
                                    </div>
                                </td>
                                {NIVELES.map(n => {
                                    const isSelected = sel === n.valor;
                                    return (
                                        <td key={n.valor} style={{ padding:'8px', textAlign:'center' }}>
                                            <button onClick={() => onScore(c.id, n.valor)}
                                                style={{
                                                    width:'56px', height:'44px', borderRadius:'10px', border:'2px solid',
                                                    borderColor: isSelected ? n.color : '#e2e8f0',
                                                    background: isSelected ? n.bg : 'transparent',
                                                    cursor:'pointer', transition:'all 0.15s',
                                                    fontWeight: isSelected ? 900 : 600,
                                                    fontSize: isSelected ? '1.1rem' : '0.9rem',
                                                    color: isSelected ? n.color : '#94a3b8',
                                                    boxShadow: isSelected ? `0 2px 8px ${n.color}40` : 'none',
                                                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                                                }}>
                                                {n.label}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
