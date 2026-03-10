import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import EstudiantePDF from '../../components/evaluaciones/EstudiantePDF';

/**
 * Vista de reporte PDF — orquesta EstudiantePDF por cada estudiante.
 * Toda la presentación per-student está en EstudiantePDF.
 */
export default function EvalPDF({ rubrica, curso, puntajes, colScores = {}, calcPromedio, onClose }) {
    const estudiantes = curso?.students || [];

    const valoresSet = new Set();
    rubrica.criterios?.forEach(c => c.niveles?.forEach(n => valoresSet.add(n.valor)));
    const valMin = Math.min(...[...valoresSet]);
    const valMax = Math.max(...[...valoresSet]);

    const fecha = new Date().toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

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
                {/* Encabezado */}
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

                {/* Secciones por estudiante */}
                {estudiantes.map((est, idx) => (
                    <EstudiantePDF
                        key={est.id}
                        est={est}
                        idx={idx}
                        rubrica={rubrica}
                        puntajes={puntajes[est.id] || {}}
                        refScores={colScores[est.id] || {}}
                        profeAvg={calcPromedio(est.id)}
                    />
                ))}

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
