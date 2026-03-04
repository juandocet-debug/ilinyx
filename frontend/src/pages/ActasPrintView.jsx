/* eslint-disable */
// pages/ActasPrintView.jsx
// Vista de impresión/PDF del acta — formato FOR023GDC UPN.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, Printer } from 'lucide-react';

const UPN_LOGO = 'https://i.ibb.co/C5SB6zj4/Identidad-UPN-25-vertical-azul-fondo-blanco.png';

export default function ActasPrintView({ acta, onBack }) {
    // Auto-merge: asegurar que firmas incluya todos los asistentes + invitados
    const mergedFirmas = useMemo(() => {
        const people = [...(acta.asistentes || []), ...(acta.invitados || [])]
            .filter(r => r.nombre && r.nombre !== 'N/A' && r.nombre.trim() !== '');
        const existingFirmas = acta.firmas || [];
        const existingKeys = new Set(existingFirmas.map(f => f.user_id || f.nombre).filter(Boolean));
        const toAdd = people.filter(r => {
            const key = r.user_id || r.nombre;
            return key && !existingKeys.has(key);
        }).map(r => ({ nombre: r.nombre, firma: '', user_id: r.user_id || null, firmado: false, fecha: '' }));
        return [...existingFirmas, ...toAdd];
    }, [acta]);

    const actaRef = useRef(null);
    const [totalPages, setTotalPages] = useState(1);
    useEffect(() => {
        const calc = () => {
            if (!actaRef.current) return;
            setTotalPages(Math.max(1, Math.ceil(actaRef.current.scrollHeight / 880)));
        };
        calc();
        window.addEventListener('resize', calc);
        return () => window.removeEventListener('resize', calc);
    }, [acta, mergedFirmas]);

    return (
        <div>
            <style>{`
                @media print {
                    html, body, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                    nav, aside, header, footer, .no-print,
                    [class*="sidebar"], [class*="Sidebar"] { display: none !important; }
                    .flex.min-h-screen { display: block !important; }
                    .flex.min-h-screen > div { margin-left: 0 !important; width: 100% !important; }
                    main, [class*="flex-1"] { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    #print-acta {
                        width: 100% !important; max-width: none !important; margin: 0 !important;
                        padding: 0 !important; border: none !important; box-shadow: none !important;
                        border-radius: 0 !important; background: white !important;
                    }
                    @page { size: letter; margin: 1.5cm; }
                    #print-acta .page-header-wrap thead { display: table-header-group; }
                    #print-acta .page-header-wrap tbody { display: table-row-group; }
                    #print-acta .sec   { page-break-after: avoid; }
                    #print-acta table  { page-break-inside: auto; }
                    #print-acta tr     { page-break-inside: avoid; }
                }
                #print-acta { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
                #print-acta table { border-collapse: collapse; width: 100%; }
                #print-acta td, #print-acta th { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
                #print-acta .sec { background: #d9d9d9; font-weight: bold; padding: 4px 6px; border: 1px solid #000; margin-top: 6px; }
                #print-acta .hdr { background: #d9d9d9; font-weight: bold; }
                #print-acta .header-table td { border: 1px solid #000; }
                #print-acta .header-table .meta-row td { background: #dbe5f1; font-size: 11px; font-weight: bold; padding: 5px 10px; }
                #print-acta .page-header-wrap { border: none; }
                #print-acta .page-header-wrap > thead > tr > td { border: none; padding: 0; }
                #print-acta .page-header-wrap > tbody > tr > td { border: none; padding: 0; }
            `}</style>

            {/* Barra de acciones (oculta al imprimir) */}
            <div className="no-print flex items-center gap-3 mb-6">
                <button onClick={onBack}
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm">
                    <ChevronLeft className="h-4 w-4" /> Volver
                </button>
                <button onClick={() => window.print()}
                    className="inline-flex items-center gap-2 bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md">
                    <Printer className="h-4 w-4" /> Imprimir / PDF
                </button>
                <span className="text-slate-400 text-xs">Ctrl+P → Guardar como PDF</span>
            </div>

            {/* Cuerpo del acta */}
            <div id="print-acta" ref={actaRef} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
                <table className="page-header-wrap">
                    <thead>
                        <tr><td>
                            <table className="header-table" style={{ marginBottom: 0 }}><tbody>
                                <tr>
                                    <td rowSpan={2} style={{ width: '22%', textAlign: 'center', verticalAlign: 'middle', padding: '8px' }}>
                                        <img src={UPN_LOGO} alt="UPN" style={{ height: 60, objectFit: 'contain' }} />
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 14, padding: '8px' }}>FORMATO</td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12, padding: '8px' }}>ACTA DE REUNIÓN / RESUMEN DE REUNIÓN</td>
                                </tr>
                                <tr className="meta-row">
                                    <td style={{ textAlign: 'center' }}>Código: FOR023GDC</td>
                                    <td style={{ textAlign: 'center' }}>Versión: 03</td>
                                </tr>
                                <tr className="meta-row">
                                    <td style={{ textAlign: 'center' }}>Fecha de Aprobación: 22-03-2012</td>
                                    <td style={{ textAlign: 'center' }}>Página 1 de {totalPages}</td>
                                </tr>
                            </tbody></table>
                        </td></tr>
                    </thead>
                    <tbody>
                        <tr><td>
                            <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '8px 0 4px' }}>Marque según corresponda (*):</p>
                            <p style={{ textAlign: 'center', marginBottom: 6 }}>
                                <span style={{ border: '1px solid #000', padding: '2px 8px', marginRight: 16 }}>{acta.tipo === 'ACTA' ? '✓' : ' '}</span> ACTA DE REUNIÓN &nbsp;&nbsp;
                                <span style={{ border: '1px solid #000', padding: '2px 8px', marginRight: 16 }}>{acta.tipo === 'RESUMEN' ? '✓' : ' '}</span> RESUMEN DE REUNIÓN
                            </p>
                            <table style={{ marginBottom: 6 }}><tbody>
                                <tr><td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}>
                                    Acta / Resumen de Reunión No. {acta.numero || '___'} de {acta.total || '___'}
                                </td></tr>
                            </tbody></table>

                            <div className="sec">1. Información General:</div>
                            <table><tbody>
                                <tr><td style={{ width: '30%' }}>Fecha</td><td>{acta.fecha}</td><td style={{ width: '15%' }}>Hora inicio:</td><td>{acta.hora_inicio}</td><td style={{ width: '12%' }}>Hora final:</td><td>{acta.hora_final}</td></tr>
                                <tr><td>Instancias / Dependencias:</td><td colSpan={5}>{acta.instancias}</td></tr>
                                <tr><td>Lugar:</td><td colSpan={5}>{acta.lugar}</td></tr>
                            </tbody></table>

                            {[
                                { num: '2', title: 'Asistentes', data: acta.asistentes },
                                { num: '3', title: 'Ausentes', data: acta.ausentes },
                                { num: '4', title: 'Invitados', data: acta.invitados },
                            ].map(s => (
                                <div key={s.num}>
                                    <div className="sec">{s.num}. {s.title}:</div>
                                    <table><thead><tr><th className="hdr" style={{ width: '50%' }}>Nombres</th><th className="hdr">Cargo/Dependencia</th></tr></thead>
                                        <tbody>{(s.data || [{ nombre: 'N/A', cargo: '' }]).map((r, i) => <tr key={i}><td>{r.nombre}</td><td>{r.cargo}</td></tr>)}</tbody>
                                    </table>
                                </div>
                            ))}

                            <div className="sec">5. Orden del Día:</div>
                            <table><tbody><tr><td style={{ minHeight: 80, whiteSpace: 'pre-wrap' }}>{acta.orden_dia}</td></tr></tbody></table>

                            <div className="sec">6. Desarrollo del Orden del Día:</div>
                            <table><tbody><tr><td style={{ minHeight: 120, whiteSpace: 'pre-wrap' }}>{acta.desarrollo}</td></tr></tbody></table>

                            <div className="sec">7. Compromisos:</div>
                            <table><thead><tr><th className="hdr">Compromiso</th><th className="hdr">Responsable</th><th className="hdr">Fecha (dd-mm-aaaa)</th></tr></thead>
                                <tbody>{acta.compromisos.map((c, i) => <tr key={i}><td>{c.compromiso}</td><td>{c.responsable}</td><td>{c.fecha}</td></tr>)}</tbody>
                            </table>

                            <div className="sec">8. Próxima Convocatoria:</div>
                            <table><tbody><tr><td style={{ whiteSpace: 'pre-wrap' }}>{acta.proxima_convocatoria}</td></tr></tbody></table>

                            <div className="sec">9. Anexos:</div>
                            <table><tbody><tr><td style={{ whiteSpace: 'pre-wrap' }}>{acta.anexos}</td></tr></tbody></table>

                            <div className="sec">10. Firmas:</div>
                            <table><thead><tr><th className="hdr">Nombre</th><th className="hdr">Firma</th><th className="hdr" style={{ width: '20%' }}>Fecha</th></tr></thead>
                                <tbody>
                                    {mergedFirmas.length === 0
                                        ? <tr><td style={{ height: 36 }} /><td /><td /></tr>
                                        : mergedFirmas.map((f, i) => (
                                            <tr key={i}>
                                                <td style={{ height: 50 }}>{f.nombre}</td>
                                                <td>{f.firmado && f.firma?.startsWith('data:')
                                                    ? <img src={f.firma} alt="Firma" style={{ maxHeight: 40, maxWidth: 140 }} />
                                                    : f.firmado ? (f.firma || '✓') : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pendiente</span>
                                                }</td>
                                                <td>{f.fecha || '—'}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>

                            <p style={{ marginTop: 12, fontSize: 10 }}>
                                <b>(*) Acta de Reunión:</b> Reuniones que contemplan elaboración formal de actas. <b>Resumen de Reunión:</b> Se aplica en los demás casos.
                            </p>
                        </td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
