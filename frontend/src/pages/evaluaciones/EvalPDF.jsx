import React, { useEffect } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

const NIVEL_LABELS = { 1:'Insuficiente', 2:'Básico', 3:'Adecuado', 4:'Bueno', 5:'Excelente' };
const NIVEL_COLORS = { 1:'#ef4444', 2:'#f97316', 3:'#eab308', 4:'#22c55e', 5:'#6366f1' };

export default function EvalPDF({ rubrica, curso, puntajes, calcPromedio, onClose }) {
    const estudiantes = curso?.students || [];

    // Recolectar todos los valores únicos de nivel en la rúbrica
    const valoresSet = new Set();
    rubrica.criterios?.forEach(c => c.niveles?.forEach(n => valoresSet.add(n.valor)));
    const valores = Array.from(valoresSet).sort((a, b) => a - b);

    return (
        <div className="eval-page">
            {/* Controles (no se imprimen) */}
            <div className="no-print" style={{ display:'flex', gap:'10px', marginBottom:'1rem' }}>
                <button onClick={onClose} className="eval-btn-ghost"><ArrowLeft size={14}/> Volver</button>
                <button className="eval-btn-primary" onClick={() => window.print()}>
                    <Printer size={14}/> Imprimir / Guardar PDF
                </button>
                <span style={{ fontSize:'0.78rem', color:'#6b7280', alignSelf:'center' }}>
                    En el diálogo de impresión elige <strong>"Guardar como PDF"</strong>
                </span>
            </div>

            {/* Reporte imprimible */}
            <div className="pdf-report">
                <div style={{ textAlign:'center', marginBottom:'24px', borderBottom:'3px solid #4f46e5', paddingBottom:'16px' }}>
                    <h1 style={{ margin:'0 0 4px', color:'#1e1b4b', fontSize:'1.4rem' }}>Reporte de Evaluación</h1>
                    <h2 style={{ margin:'0 0 4px', color:'#4f46e5', fontSize:'1.1rem' }}>{rubrica.titulo}</h2>
                    <p style={{ margin:0, color:'#6b7280', fontSize:'0.85rem' }}>
                        Clase: <strong>{curso?.name}</strong> · Criterios: {rubrica.criterios?.length} · Escala: {Math.min(...valores)}–{Math.max(...valores)}
                    </p>
                </div>

                {/* Una sección por estudiante */}
                {estudiantes.map((est, estIdx) => {
                    const promedio = calcPromedio(est.id);
                    const aprobado = promedio >= 3;
                    return (
                        <div key={est.id} style={{ marginBottom:'28px', pageBreakInside:'avoid' }}>
                            {/* Header estudiante */}
                            <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', background:'#f8fafc', borderRadius:'8px', marginBottom:'10px', border:'1px solid #e2e8f0' }}>
                                <div style={{ flex:1 }}>
                                    <strong style={{ color:'#1e293b', fontSize:'1rem' }}>{estIdx + 1}. {est.first_name} {est.last_name}</strong>
                                    <p style={{ margin:0, fontSize:'0.78rem', color:'#6b7280' }}>
                                        {est.document_number ? `CC ${est.document_number} · ` : ''}{est.email}
                                    </p>
                                </div>
                                <div style={{ textAlign:'center' }}>
                                    <div style={{
                                        width:52, height:52, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                                        background: aprobado ? '#dcfce7' : promedio > 0 ? '#fee2e2' : '#f1f5f9',
                                        border: `3px solid ${aprobado ? '#22c55e' : promedio > 0 ? '#ef4444' : '#e2e8f0'}`,
                                        color: aprobado ? '#16a34a' : promedio > 0 ? '#dc2626' : '#94a3b8',
                                        fontWeight: 900, fontSize:'1.15rem',
                                    }}>
                                        {promedio > 0 ? promedio.toFixed(1) : '–'}
                                    </div>
                                    <p style={{ margin:'4px 0 0', fontSize:'0.65rem', fontWeight:700, color: aprobado ? '#16a34a' : '#dc2626' }}>
                                        {promedio > 0 ? (aprobado ? 'Aprobado' : 'Reprobado') : 'Sin calificar'}
                                    </p>
                                </div>
                            </div>

                            {/* Tabla de criterios */}
                            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.75rem' }}>
                                <thead>
                                    <tr style={{ background:'#1e1b4b', color:'#fff' }}>
                                        <th style={{ padding:'7px 10px', textAlign:'left', fontWeight:700 }}>Criterio</th>
                                        {valores.map(v => (
                                            <th key={v} style={{ padding:'7px 8px', textAlign:'center', fontWeight:700, color: NIVEL_COLORS[v] || '#fff', background:'#1e1b4b' }}>
                                                {v} — {NIVEL_LABELS[v] || `Nivel ${v}`}
                                            </th>
                                        ))}
                                        <th style={{ padding:'7px 8px', textAlign:'center', background:'#4f46e5', fontWeight:700 }}>Parcial</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rubrica.criterios?.map((c, ci) => {
                                        const sel = puntajes[est.id]?.[c.id] || 0;
                                        return (
                                            <tr key={c.id} style={{ background: ci % 2 === 0 ? '#fff' : '#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                                                <td style={{ padding:'8px 10px', fontWeight:600, color:'#1e293b' }}>
                                                    <span style={{ display:'inline-block', width:18, height:18, borderRadius:'50%', background:'#4f46e5', color:'#fff', fontWeight:800, fontSize:'0.6rem', textAlign:'center', lineHeight:'18px', marginRight:'6px' }}>{ci+1}</span>
                                                    {c.nombre}
                                                </td>
                                                {valores.map(v => {
                                                    const nivel = c.niveles?.find(n => n.valor === v);
                                                    const isSelected = sel === v;
                                                    return (
                                                        <td key={v} style={{
                                                            padding:'8px',
                                                            background: isSelected ? `${NIVEL_COLORS[v]}18` : 'transparent',
                                                            border: isSelected ? `2px solid ${NIVEL_COLORS[v]}` : '1px solid transparent',
                                                            borderRadius:'6px', fontSize:'0.72rem', color: isSelected ? NIVEL_COLORS[v] : '#374151',
                                                            fontWeight: isSelected ? 700 : 400, verticalAlign:'top',
                                                        }}>
                                                            {nivel?.descripcion || '—'}
                                                            {isSelected && <span style={{ display:'block', fontWeight:900, marginTop:'4px' }}>▶ Seleccionado</span>}
                                                        </td>
                                                    );
                                                })}
                                                <td style={{ textAlign:'center', fontWeight:900, fontSize:'1rem', color: sel > 0 ? (NIVEL_COLORS[sel] || '#4f46e5') : '#94a3b8' }}>
                                                    {sel || '–'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Total */}
                                    <tr style={{ background:'#ede9fe', borderTop:'2px solid #7c3aed' }}>
                                        <td colSpan={valores.length + 1} style={{ padding:'10px', textAlign:'right', fontWeight:800, color:'#4f46e5', fontSize:'0.82rem' }}>
                                            PROMEDIO TOTAL
                                        </td>
                                        <td style={{ textAlign:'center', fontWeight:900, fontSize:'1.1rem', color: aprobado ? '#16a34a' : promedio > 0 ? '#dc2626' : '#94a3b8', padding:'8px' }}>
                                            {promedio > 0 ? promedio.toFixed(2) : '–'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })}

                <div style={{ marginTop:'32px', paddingTop:'16px', borderTop:'2px solid #e2e8f0', fontSize:'0.72rem', color:'#94a3b8', textAlign:'center' }}>
                    Generado por ILINYX · {new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })}
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .eval-page { padding: 0 !important; }
                    .pdf-report { font-size: 12px; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
