import React, { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

const NIVEL_LABELS = {
    1: 'Insuficiente', 2: 'Básico', 3: 'Adecuado', 4: 'Bueno', 5: 'Excelente',
};
const NIVEL_STYLE = {
    1: { color: '#B91C1C', bg: '#FEF2F2' },
    2: { color: '#C2410C', bg: '#FFF7ED' },
    3: { color: '#92400E', bg: '#FFFBEB' },
    4: { color: '#166534', bg: '#F0FDF4' },
    5: { color: '#4338CA', bg: '#EEF2FF' },
};

function getNivelStyle(v) {
    return NIVEL_STYLE[v] || { color: '#475569', bg: '#F8FAFC' };
}

/** Pill de nivel — compacto */
function NivelPill({ val, small }) {
    if (!val) return <span style={{ color: '#CBD5E1', fontSize: small ? '0.65rem' : '0.72rem' }}>—</span>;
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

/** Círculo de nota final */
function NotaCircle({ val, label, size = 52 }) {
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
                <p style={{ margin: '3px 0 0', fontSize: '0.6rem', color: '#94A3B8', fontWeight: 600 }}>{label}</p>
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

function calcPromedioRef(criterios, colScores) {
    if (!criterios?.length) return 0;
    const vals = criterios.map(c => colScores?.[c.id] || 0).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function Avatar({ est, size = 52 }) {
    const [err, setErr] = useState(false);
    if (est.photo && !err) {
        return (
            <img
                src={est.photo}
                alt=""
                onError={() => setErr(true)}
                style={{
                    width: size, height: size, borderRadius: '50%',
                    objectFit: 'cover', flexShrink: 0,
                    border: '2.5px solid #C7D2FE',
                }}
            />
        );
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#818CF8,#6D28D9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: size * 0.34,
            border: '2.5px solid #C7D2FE',
        }}>
            {est.first_name?.[0]}{est.last_name?.[0]}
        </div>
    );
}

export default function EvalPDF({ rubrica, curso, puntajes, colScores = {}, calcPromedio, onClose }) {
    const estudiantes = curso?.students || [];

    const valoresSet = new Set();
    rubrica.criterios?.forEach(c => c.niveles?.forEach(n => valoresSet.add(n.valor)));
    const valMin = Math.min(...[...valoresSet]);
    const valMax = Math.max(...[...valoresSet]);

    const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="eval-page">
            {/* Controles — solo pantalla */}
            <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: '1rem', alignItems: 'center' }}>
                <button onClick={onClose} className="eval-btn-ghost"><ArrowLeft size={14} /> Volver</button>
                <button className="eval-btn-primary" onClick={() => window.print()}>
                    <Printer size={14} /> Imprimir / PDF
                </button>
                <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                    Elige <strong>"Guardar como PDF"</strong> en el diálogo de impresión
                </span>
            </div>

            {/* ── Documento ── */}
            <div className="pdf-report">

                {/* Encabezado del reporte */}
                <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #E2E8F0' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Reporte de Evaluación · ILINYX UPN·CIAR
                    </p>
                    <h1 style={{ margin: '0 0 3px', color: '#1E1B4B', fontSize: '1.2rem', fontWeight: 900 }}>
                        {rubrica.titulo}
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                        <strong>{curso?.name}</strong>
                        &nbsp;·&nbsp;{rubrica.criterios?.length} criterios
                        &nbsp;·&nbsp;Escala {valMin}–{valMax}
                        &nbsp;·&nbsp;{fecha}
                    </p>
                    <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: '0.68rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#6366F1', display: 'inline-block' }} />
                            <span style={{ color: '#475569' }}>Evaluador (docente)</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#0EA5E9', display: 'inline-block' }} />
                            <span style={{ color: '#475569' }}>Referencia colectiva</span>
                        </span>
                    </div>
                </div>

                {/* ── Sección por estudiante ── */}
                {estudiantes.map((est, idx) => {
                    const profeAvg = calcPromedio(est.id);
                    const refScores = colScores[est.id] || {};
                    const promedioRef = calcPromedioRef(rubrica.criterios, refScores);
                    // Nota final SOLO si el evaluador dio puntaje — la referencia no cuenta por sí sola
                    const notaFinal = (profeAvg > 0 && promedioRef > 0)
                        ? (profeAvg + promedioRef) / 2
                        : profeAvg;  // si no hay nota de evaluador, nota final = 0 (sin calificar)

                    return (
                        <div key={est.id} style={{ marginBottom: 28, pageBreakInside: 'avoid' }}>

                            {/* Header estudiante */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px', marginBottom: 10,
                                background: '#F8FAFC', borderRadius: 10,
                                border: '1px solid #E2E8F0',
                            }}>
                                <Avatar est={est} size={50} />

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

                                {/* Notas — Nota Final solo si el evaluador calificó */}
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

                            {/* Tabla de criterios — COMPACTA (sin columnas de niveles) */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem' }}>
                                <thead>
                                    <tr style={{ background: '#F1F5F9' }}>
                                        <th style={{ padding: '7px 10px', textAlign: 'left', width: '4%', color: '#94A3B8', fontWeight: 700, borderBottom: '2px solid #E2E8F0' }}>#</th>
                                        <th style={{ padding: '7px 10px', textAlign: 'left', width: '24%', color: '#475569', fontWeight: 700, borderBottom: '2px solid #E2E8F0' }}>Criterio</th>
                                        <th style={{ padding: '7px 10px', textAlign: 'left', color: '#4338CA', fontWeight: 700, borderBottom: '2px solid #C7D2FE', background: '#EEF2FF' }}>
                                            Nivel alcanzado — Evaluador
                                        </th>
                                        {/* Columna Referencia — SIEMPRE visible */}
                                        <th style={{ padding: '7px 10px', textAlign: 'left', color: '#0369A1', fontWeight: 700, borderBottom: '2px solid #BAE6FD', background: '#F0F9FF' }}>
                                            Nivel alcanzado — Referencia
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rubrica.criterios?.map((c, ci) => {
                                        const selP = puntajes[est.id]?.[c.id] || 0;
                                        const selR = refScores[c.id] || 0;
                                        const nivelP = c.niveles?.find(n => n.valor === selP);
                                        const nivelR = c.niveles?.find(n => n.valor === selR);
                                        return (
                                            <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9', background: ci % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                                                {/* Número */}
                                                <td style={{ padding: '9px 10px', color: '#CBD5E1', fontWeight: 700, verticalAlign: 'top' }}>
                                                    {ci + 1}
                                                </td>
                                                {/* Nombre criterio */}
                                                <td style={{ padding: '9px 10px', fontWeight: 700, color: '#1E293B', verticalAlign: 'top', lineHeight: 1.4 }}>
                                                    {c.nombre}
                                                </td>
                                                {/* Evaluador */}
                                                <td style={{ padding: '9px 10px', background: selP ? '#F5F7FF' : 'transparent', verticalAlign: 'top' }}>
                                                    <NivelPill val={selP} />
                                                    {nivelP?.descripcion && (
                                                        <p style={{ margin: '4px 0 0', fontSize: '0.67rem', color: '#475569', lineHeight: 1.45 }}>
                                                            {nivelP.descripcion}
                                                        </p>
                                                    )}
                                                </td>
                                                {/* Referencia — SIEMPRE visible */}
                                                <td style={{ padding: '9px 10px', background: selR ? '#F0F9FF' : '#FAFCFF', verticalAlign: 'top' }}>
                                                    {selR ? (
                                                        <>
                                                            <NivelPill val={selR} small />
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
                                            <NivelPill val={profeAvg > 0 ? Math.round(profeAvg) : 0} />
                                            {profeAvg > 0 && (
                                                <span style={{ marginLeft: 8, fontWeight: 800, color: '#4338CA', fontSize: '0.8rem' }}>
                                                    {profeAvg.toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        {/* Promedio Referencia — SIEMPRE visible */}
                                        <td style={{ padding: '9px 10px', background: '#F0F9FF' }}>
                                            {promedioRef > 0 ? (
                                                <>
                                                    <NivelPill val={Math.round(promedioRef)} small />
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
                })}

                {/* Pie */}
                <div style={{ marginTop: 24, paddingTop: 10, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#CBD5E1' }}>
                    <span>ILINYX · UPN·CIAR · {curso?.name}</span>
                    <span>{fecha}</span>
                </div>
            </div>

            <style>{`
                @page { size: A4; margin: 16mm 14mm; }
                @media print {
                    .no-print { display: none !important; }
                    .eval-page { padding: 0 !important; background: #fff !important; }
                    .pdf-report { font-size: 11px; max-width: 100% !important; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    table { width: 100% !important; table-layout: fixed; }
                    td, th { word-break: break-word; }
                }
            `}</style>
        </div>
    );
}
