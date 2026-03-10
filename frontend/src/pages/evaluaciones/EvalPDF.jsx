import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

const NIVEL_LABELS = { 1:'Insuficiente', 2:'Básico', 3:'Adecuado', 4:'Bueno', 5:'Excelente' };

// Paleta sobria: sin colores saturados, solo índigo suave y slate
const NIVEL_DOT = {
    1: { bg:'#fee2e2', color:'#b91c1c' },
    2: { bg:'#ffedd5', color:'#c2410c' },
    3: { bg:'#fef9c3', color:'#a16207' },
    4: { bg:'#dcfce7', color:'#15803d' },
    5: { bg:'#ede9fe', color:'#6d28d9' },
};

function Dot({ val }) {
    if (!val) return <span style={{ color:'#CBD5E1', fontWeight:600 }}>—</span>;
    const s = NIVEL_DOT[val] || { bg:'#f1f5f9', color:'#475569' };
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:28, height:28, borderRadius:'50%',
            background: s.bg, color: s.color,
            fontWeight:800, fontSize:'0.8rem',
        }}>{val}</span>
    );
}

function ScoreBadge({ val, label }) {
    const aprobado = val >= 3;
    const sinCal   = val === 0;
    const bg    = sinCal ? '#F8FAFC' : aprobado ? '#F0FDF4' : '#FEF2F2';
    const color = sinCal ? '#94A3B8' : aprobado ? '#15803D' : '#B91C1C';
    const border= sinCal ? '#E2E8F0' : aprobado ? '#86EFAC' : '#FCA5A5';
    return (
        <div style={{ textAlign:'center' }}>
            <div style={{
                width:52, height:52, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                background: bg, border: `2.5px solid ${border}`,
                color, fontWeight:900, fontSize:'1.15rem', margin:'0 auto',
            }}>
                {sinCal ? '—' : val.toFixed(1)}
            </div>
            {!sinCal && (
                <p style={{ margin:'3px 0 0', fontSize:'0.62rem', fontWeight:700, color, letterSpacing:'0.03em' }}>
                    {aprobado ? 'APROBADO' : 'REPROBADO'}
                </p>
            )}
            {label && (
                <p style={{ margin:'2px 0 0', fontSize:'0.6rem', color:'#94A3B8', fontWeight:500 }}>{label}</p>
            )}
        </div>
    );
}

/** Convierte URL de imagen a base64 para window.print() */
async function toBase64(url) {
    try {
        const resp = await fetch(url, { mode: 'no-cors' });
        const blob = await resp.blob();
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
        });
    } catch { return null; }
}

/**
 * Calcula promedio de los puntajes de colScores por criterio.
 * colScores: { criterio_id: valor } — los del evaluador de referencia.
 */
function calcPromedioRef(criterios, colScores) {
    if (!criterios?.length) return 0;
    const vals = criterios.map(c => colScores?.[c.id] || 0).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

/** Promedio ponderado entre nota del profesor y nota de referencia */
function calcNotaFinal(profeAvg, refAvg) {
    if (profeAvg > 0 && refAvg > 0) return (profeAvg + refAvg) / 2;
    return profeAvg || refAvg;
}

export default function EvalPDF({ rubrica, curso, puntajes, colScores = {}, calcPromedio, onClose }) {
    const estudiantes = curso?.students || [];
    const [fotos, setFotos] = useState({});

    const valoresSet = new Set();
    rubrica.criterios?.forEach(c => c.niveles?.forEach(n => valoresSet.add(n.valor)));
    const valores = Array.from(valoresSet).sort((a, b) => a - b);

    const hayColScores = rubrica.criterios?.some(c => (colScores[c.id] || 0) > 0);
    const promedioRef  = hayColScores ? calcPromedioRef(rubrica.criterios, colScores) : 0;

    useEffect(() => {
        Promise.all(
            estudiantes.filter(e => e.photo).map(async e => {
                const b64 = await toBase64(e.photo);
                return [e.id, b64];
            })
        ).then(pairs => {
            const map = {};
            pairs.forEach(([id, b64]) => { if (b64) map[id] = b64; });
            setFotos(map);
        });
    }, []);

    return (
        <div className="eval-page">
            {/* Controles (no se imprimen) */}
            <div className="no-print" style={{ display:'flex', gap:'10px', marginBottom:'1rem', alignItems:'center' }}>
                <button onClick={onClose} className="eval-btn-ghost"><ArrowLeft size={14}/> Volver</button>
                <button className="eval-btn-primary" onClick={() => window.print()}>
                    <Printer size={14}/> Imprimir / Guardar PDF
                </button>
                <span style={{ fontSize:'0.78rem', color:'#6b7280' }}>
                    En el diálogo de impresión elige <strong>"Guardar como PDF"</strong>
                </span>
            </div>

            {/* Reporte */}
            <div className="pdf-report">

                {/* Encabezado */}
                <div style={{ marginBottom:'24px', paddingBottom:'16px', borderBottom:'2px solid #E2E8F0' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                            <p style={{ margin:'0 0 2px', fontSize:'0.7rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                                Reporte de Evaluación · ILINYX
                            </p>
                            <h1 style={{ margin:'0 0 4px', color:'#1E1B4B', fontSize:'1.3rem', fontWeight:900 }}>
                                {rubrica.titulo}
                            </h1>
                            <p style={{ margin:0, fontSize:'0.8rem', color:'#64748B' }}>
                                <strong>{curso?.name}</strong>
                                &nbsp;·&nbsp;{rubrica.criterios?.length} criterios
                                &nbsp;·&nbsp;Escala {Math.min(...valores)}–{Math.max(...valores)}
                                &nbsp;·&nbsp;{new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })}
                            </p>
                        </div>
                        {/* Leyenda columnas */}
                        {hayColScores && (
                            <div style={{ display:'flex', gap:'12px', fontSize:'0.68rem' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                                    <span style={{ width:10, height:10, borderRadius:'50%', background:'#6366F1', display:'inline-block' }}/>
                                    <span style={{ color:'#475569' }}>Evaluador</span>
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                                    <span style={{ width:10, height:10, borderRadius:'50%', background:'#0EA5E9', display:'inline-block' }}/>
                                    <span style={{ color:'#475569' }}>Referencia</span>
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                                    <span style={{ width:10, height:10, borderRadius:'50%', background:'#10B981', display:'inline-block' }}/>
                                    <span style={{ color:'#475569' }}>Nota Final</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Una sección por estudiante */}
                {estudiantes.map((est, estIdx) => {
                    const profeAvg = calcPromedio(est.id);
                    const notaFinal = calcNotaFinal(profeAvg, promedioRef);
                    const fotoSrc  = fotos[est.id] || est.photo;

                    return (
                        <div key={est.id} style={{ marginBottom:'32px', pageBreakInside:'avoid' }}>

                            {/* Header del estudiante */}
                            <div style={{
                                display:'flex', alignItems:'center', gap:'14px',
                                padding:'12px 16px', marginBottom:'10px',
                                background:'#F8FAFC', borderRadius:'10px',
                                border:'1px solid #E2E8F0',
                            }}>
                                {/* Foto */}
                                {fotoSrc ? (
                                    <img src={fotoSrc} alt=""
                                        style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover',
                                                 border:'2.5px solid #C7D2FE', flexShrink:0 }}
                                    />
                                ) : (
                                    <div style={{
                                        width:52, height:52, borderRadius:'50%', flexShrink:0,
                                        background:'linear-gradient(135deg,#818CF8,#6D28D9)',
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        color:'#fff', fontWeight:800, fontSize:'1rem',
                                    }}>
                                        {est.first_name?.[0]}{est.last_name?.[0]}
                                    </div>
                                )}

                                {/* Datos */}
                                <div style={{ flex:1 }}>
                                    <strong style={{ color:'#1E293B', fontSize:'0.95rem' }}>
                                        {estIdx + 1}. {est.first_name} {est.last_name}
                                    </strong>
                                    <p style={{ margin:'2px 0 0', fontSize:'0.75rem', color:'#64748B' }}>
                                        {est.document_number ? `C.C. ${est.document_number}` : ''}
                                        {est.document_number && est.email ? ' · ' : ''}
                                        {est.email}
                                    </p>
                                </div>

                                {/* Badges de notas */}
                                <div style={{ display:'flex', gap:'18px', alignItems:'center' }}>
                                    {profeAvg > 0 && (
                                        <ScoreBadge val={profeAvg} label="Evaluador" />
                                    )}
                                    {hayColScores && promedioRef > 0 && (
                                        <ScoreBadge val={promedioRef} label="Referencia" />
                                    )}
                                    {(profeAvg > 0 || promedioRef > 0) && (
                                        <>
                                            <div style={{ width:'1px', height:44, background:'#E2E8F0' }}/>
                                            <div style={{ textAlign:'center' }}>
                                                <div style={{
                                                    width:58, height:58, borderRadius:'50%',
                                                    display:'flex', alignItems:'center', justifyContent:'center',
                                                    background: notaFinal >= 3 ? '#F0FDF4' : '#FEF2F2',
                                                    border: `3px solid ${notaFinal >= 3 ? '#4ADE80' : '#FCA5A5'}`,
                                                    color: notaFinal >= 3 ? '#15803D' : '#B91C1C',
                                                    fontWeight:900, fontSize:'1.25rem', margin:'0 auto',
                                                }}>
                                                    {notaFinal.toFixed(1)}
                                                </div>
                                                <p style={{ margin:'3px 0 0', fontSize:'0.62rem', fontWeight:700,
                                                    color: notaFinal >= 3 ? '#15803D' : '#B91C1C',
                                                    letterSpacing:'0.04em' }}>
                                                    {notaFinal >= 3 ? 'APROBADO' : 'REPROBADO'}
                                                </p>
                                                <p style={{ margin:'1px 0 0', fontSize:'0.6rem', color:'#94A3B8' }}>Nota Final</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Tabla de criterios */}
                            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.73rem' }}>
                                <thead>
                                    <tr style={{ background:'#F1F5F9' }}>
                                        <th style={{ padding:'8px 12px', textAlign:'left', fontWeight:700, color:'#475569', borderBottom:'2px solid #E2E8F0', width:'30%' }}>
                                            Criterio
                                        </th>
                                        {valores.map(v => (
                                            <th key={v} style={{ padding:'8px', textAlign:'center', fontWeight:700, color:'#475569', borderBottom:'2px solid #E2E8F0', fontSize:'0.7rem' }}>
                                                {v} · {NIVEL_LABELS[v] || `Nivel ${v}`}
                                            </th>
                                        ))}
                                        {/* Columna nota evaluador */}
                                        <th style={{ padding:'8px', textAlign:'center', background:'#EEF2FF', borderBottom:'2px solid #C7D2FE', color:'#4338CA', fontWeight:700, fontSize:'0.68rem', whiteSpace:'nowrap' }}>
                                            Eval.
                                        </th>
                                        {/* Columna nota referencia */}
                                        {hayColScores && (
                                            <th style={{ padding:'8px', textAlign:'center', background:'#F0F9FF', borderBottom:'2px solid #BAE6FD', color:'#0369A1', fontWeight:700, fontSize:'0.68rem', whiteSpace:'nowrap' }}>
                                                Ref.
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rubrica.criterios?.map((c, ci) => {
                                        const selProfe = puntajes[est.id]?.[c.id] || 0;
                                        const selRef   = colScores?.[c.id] || 0;
                                        return (
                                            <tr key={c.id} style={{ borderBottom:'1px solid #F1F5F9', background: ci % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                                {/* Nombre criterio */}
                                                <td style={{ padding:'8px 12px', fontWeight:600, color:'#1E293B', verticalAlign:'middle' }}>
                                                    <span style={{
                                                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                                                        width:18, height:18, borderRadius:'50%',
                                                        background:'#EEF2FF', color:'#4338CA',
                                                        fontWeight:800, fontSize:'0.6rem', marginRight:'7px', flexShrink:0,
                                                    }}>{ci + 1}</span>
                                                    {c.nombre}
                                                </td>

                                                {/* Celdas por nivel */}
                                                {valores.map(v => {
                                                    const nivel = c.niveles?.find(n => n.valor === v);
                                                    const isProfe = selProfe === v;
                                                    const isRef   = selRef === v;
                                                    return (
                                                        <td key={v} style={{
                                                            padding:'7px 8px', verticalAlign:'top',
                                                            background: isProfe ? '#EEF2FF' : isRef ? '#F0F9FF' : 'transparent',
                                                            border: isProfe
                                                                ? '1.5px solid #A5B4FC'
                                                                : isRef
                                                                ? '1.5px solid #BAE6FD'
                                                                : '1px solid #F1F5F9',
                                                            borderRadius:'6px',
                                                            fontSize:'0.69rem',
                                                            color: isProfe ? '#3730A3' : isRef ? '#0369A1' : '#94A3B8',
                                                            fontWeight: (isProfe || isRef) ? 600 : 400,
                                                            position:'relative',
                                                        }}>
                                                            {/* Indicador pequeño de quién seleccionó */}
                                                            {(isProfe || isRef) && (
                                                                <span style={{
                                                                    position:'absolute', top:4, right:4,
                                                                    width:7, height:7, borderRadius:'50%',
                                                                    background: isProfe ? '#6366F1' : '#0EA5E9',
                                                                }}/>
                                                            )}
                                                            {nivel?.descripcion || <span style={{ fontStyle:'italic', color:'#CBD5E1' }}>Sin desc.</span>}
                                                        </td>
                                                    );
                                                })}

                                                {/* Dot evaluador */}
                                                <td style={{ textAlign:'center', verticalAlign:'middle', background:'#F5F7FF', padding:'8px 6px' }}>
                                                    <Dot val={selProfe} />
                                                </td>
                                                {/* Dot referencia */}
                                                {hayColScores && (
                                                    <td style={{ textAlign:'center', verticalAlign:'middle', background:'#F0F9FF', padding:'8px 6px' }}>
                                                        <Dot val={selRef} />
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}

                                    {/* Fila totales */}
                                    <tr style={{ background:'#F8FAFC', borderTop:'2px solid #E2E8F0' }}>
                                        <td colSpan={valores.length + 1} style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:'#64748B', fontSize:'0.75rem', letterSpacing:'0.04em' }}>
                                            PROMEDIO
                                        </td>
                                        <td style={{ textAlign:'center', background:'#EEF2FF', padding:'8px 6px' }}>
                                            <Dot val={profeAvg > 0 ? Math.round(profeAvg) : 0} />
                                            {profeAvg > 0 && (
                                                <p style={{ margin:'2px 0 0', fontSize:'0.65rem', fontWeight:700, color:'#4338CA' }}>{profeAvg.toFixed(2)}</p>
                                            )}
                                        </td>
                                        {hayColScores && (
                                            <td style={{ textAlign:'center', background:'#F0F9FF', padding:'8px 6px' }}>
                                                <Dot val={promedioRef > 0 ? Math.round(promedioRef) : 0} />
                                                {promedioRef > 0 && (
                                                    <p style={{ margin:'2px 0 0', fontSize:'0.65rem', fontWeight:700, color:'#0369A1' }}>{promedioRef.toFixed(2)}</p>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })}

                {/* Pie del reporte */}
                <div style={{ marginTop:'24px', paddingTop:'12px', borderTop:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.68rem', color:'#CBD5E1' }}>
                        ILINYX · {curso?.name} · {rubrica.titulo}
                    </span>
                    <span style={{ fontSize:'0.68rem', color:'#CBD5E1' }}>
                        {new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })}
                    </span>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .eval-page { padding: 0 !important; }
                    .pdf-report { font-size: 11px; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
