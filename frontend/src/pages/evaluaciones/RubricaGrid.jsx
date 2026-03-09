import React from 'react';

const NIVELES = [
    { valor: 1, label: '1', desc: 'Insuficiente', color: '#ef4444', bg: '#fee2e2' },
    { valor: 2, label: '2', desc: 'Básico',       color: '#f97316', bg: '#ffedd5' },
    { valor: 3, label: '3', desc: 'Adecuado',     color: '#eab308', bg: '#fef9c3' },
    { valor: 4, label: '4', desc: 'Bueno',        color: '#22c55e', bg: '#dcfce7' },
    { valor: 5, label: '5', desc: 'Excelente',    color: '#6366f1', bg: '#ede9fe' },
];

export default function RubricaGrid({ criterios, scores, onScore }) {
    // Calcular promedio total
    const vals = criterios?.map(c => scores?.[c.id] || 0) || [];
    const calificados = vals.filter(v => v > 0);
    const total = calificados.length > 0 ? (calificados.reduce((a, b) => a + b, 0) / calificados.length) : 0;

    return (
        <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                <thead>
                    <tr style={{ background:'#f8fafc' }}>
                        <th style={{ padding:'10px 16px', textAlign:'left', fontWeight:800, color:'#64748b', fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'2px solid #e2e8f0', width:'200px' }}>
                            Criterio
                        </th>
                        {NIVELES.map(n => (
                            <th key={n.valor} style={{ padding:'10px 8px', textAlign:'center', borderBottom:'2px solid #e2e8f0', minWidth:'80px' }}>
                                <div style={{ fontWeight:800, color:n.color, fontSize:'1rem' }}>{n.label}</div>
                                <div style={{ fontWeight:600, color:n.color, fontSize:'0.62rem', opacity:0.85 }}>{n.desc}</div>
                            </th>
                        ))}
                        <th style={{ padding:'10px 8px', textAlign:'center', borderBottom:'2px solid #e2e8f0', background:'#f1f5f9', fontWeight:800, color:'#4f46e5', fontSize:'0.7rem', textTransform:'uppercase', minWidth:'80px' }}>
                            Parcial
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {criterios?.map((c, idx) => {
                        const sel = scores?.[c.id] || 0;
                        const nivel = NIVELES.find(n => n.valor === sel);
                        return (
                            <tr key={c.id} style={{ borderBottom:'1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                <td style={{ padding:'12px 16px', fontWeight:600, color:'#1e293b' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                        <span style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'0.62rem', flexShrink:0 }}>
                                            {idx + 1}
                                        </span>
                                        {c.nombre}
                                    </div>
                                </td>
                                {NIVELES.map(n => {
                                    const isSelected = sel === n.valor;
                                    return (
                                        <td key={n.valor} style={{ padding:'8px', textAlign:'center' }}>
                                            <button onClick={() => onScore(c.id, n.valor)}
                                                style={{
                                                    width:'52px', height:'42px', borderRadius:'10px', border:'2px solid',
                                                    borderColor: isSelected ? n.color : '#e2e8f0',
                                                    background: isSelected ? n.bg : 'transparent',
                                                    cursor:'pointer', transition:'all 0.15s',
                                                    fontWeight: isSelected ? 900 : 600,
                                                    fontSize: isSelected ? '1.05rem' : '0.88rem',
                                                    color: isSelected ? n.color : '#cbd5e1',
                                                    boxShadow: isSelected ? `0 2px 8px ${n.color}40` : 'none',
                                                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                                }}>
                                                {n.label}
                                            </button>
                                        </td>
                                    );
                                })}
                                {/* Parcial por criterio */}
                                <td style={{ textAlign:'center', background:'#f8fafc' }}>
                                    {sel > 0 ? (
                                        <span style={{
                                            display:'inline-flex', alignItems:'center', justifyContent:'center',
                                            width:38, height:38, borderRadius:'50%',
                                            background: nivel ? nivel.bg : '#f1f5f9',
                                            color: nivel ? nivel.color : '#94a3b8',
                                            fontWeight:900, fontSize:'1rem',
                                            border: `2px solid ${nivel ? nivel.color : '#e2e8f0'}`,
                                        }}>{sel}</span>
                                    ) : (
                                        <span style={{ color:'#cbd5e1', fontSize:'1.1rem', fontWeight:700 }}>–</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {/* Fila Total Definitivo */}
                    <tr style={{ background:'linear-gradient(135deg,#ede9fe,#ddd6fe)', borderTop:'2px solid #c4b5fd' }}>
                        <td colSpan={6} style={{ padding:'12px 16px', fontWeight:800, color:'#4f46e5', fontSize:'0.85rem', textAlign:'right', letterSpacing:'0.03em' }}>
                            PROMEDIO TOTAL
                        </td>
                        <td style={{ textAlign:'center', padding:'10px 8px' }}>
                            <span style={{
                                display:'inline-flex', alignItems:'center', justifyContent:'center',
                                width:44, height:44, borderRadius:'50%',
                                background: total >= 4 ? '#dcfce7' : total >= 3 ? '#fef9c3' : total > 0 ? '#fee2e2' : '#f1f5f9',
                                color: total >= 4 ? '#16a34a' : total >= 3 ? '#ca8a04' : total > 0 ? '#dc2626' : '#94a3b8',
                                fontWeight:900, fontSize:'1.1rem',
                                border: total > 0 ? '2.5px solid currentColor' : '2px solid #e2e8f0',
                                boxShadow: total > 0 ? '0 3px 10px rgba(0,0,0,0.1)' : 'none'
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
