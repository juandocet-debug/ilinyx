import React from 'react';
import { Plus, Trash2, UserPlus, Users, CheckCircle2 } from 'lucide-react';
import UserAutocomplete from '../../components/actas/UserAutocomplete';

const inp = 'w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500';

/**
 * Paso 2 del formulario de actas: Compromisos, Próx. Convocatoria, Anexos.
 */
export function StepResultados({ acta, set, setRow, addRow, delRow, Sec }) {
    return (
        <>
            <Sec num="7" title="Compromisos" hint="N/A si no aplica">
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full"><thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Compromiso</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsable</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                            <th className="w-10" />
                        </tr>
                    </thead><tbody className="divide-y divide-slate-50">
                        {acta.compromisos.map((c, i) => (
                            <tr key={i}>
                                <td className="px-2 py-2"><input value={c.compromiso} onChange={e => setRow('compromisos', i, 'compromiso', e.target.value)} className={inp} /></td>
                                <td className="px-2 py-2"><UserAutocomplete value={c.responsable} onChangeName={v => setRow('compromisos', i, 'responsable', v)} onSelect={(user, name) => { setRow('compromisos', i, 'responsable', name); setRow('compromisos', i, 'responsable_id', user.id); }} /></td>
                                <td className="px-2 py-2"><input type="date" value={c.fecha} onChange={e => setRow('compromisos', i, 'fecha', e.target.value)} className={inp} /></td>
                                <td className="px-2 py-2 text-center"><button onClick={() => delRow('compromisos', i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button></td>
                            </tr>
                        ))}
                    </tbody></table>
                </div>
                <button onClick={() => addRow('compromisos', { compromiso: '', responsable: '', responsable_id: null, fecha: '' })}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ilinyx-600 hover:text-ilinyx-800 px-2 py-1 rounded-lg hover:bg-ilinyx-50 mt-2">
                    <Plus className="h-3.5 w-3.5" /> Agregar compromiso
                </button>
            </Sec>
            <Sec num="8" title="Próxima Convocatoria">
                <textarea rows={3} value={acta.proxima_convocatoria} onChange={e => set('proxima_convocatoria', e.target.value)} className={`${inp} w-full`} />
            </Sec>
            <Sec num="9" title="Anexos">
                <textarea rows={3} value={acta.anexos} onChange={e => set('anexos', e.target.value)} className={`${inp} w-full`} />
            </Sec>
        </>
    );
}

/**
 * Paso 3 del formulario de actas: Firmas.
 */
export function StepFirmas({ acta, user, delRow, addMySig, onImportFirmas, Sec }) {
    return (
        <Sec num="10" title="Firmas" hint="El firmante puede hacerlo desde 'Mis Actas'">
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-ilinyx-50 rounded-xl border border-ilinyx-100">
                <button onClick={addMySig}
                    className="inline-flex items-center gap-2 bg-ilinyx-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-ilinyx-800 transition-all shadow">
                    <UserPlus className="h-4 w-4" /> Agregar mi firma
                </button>
                <button onClick={onImportFirmas}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-emerald-700 transition-all shadow">
                    <Users className="h-4 w-4" /> Importar grupo o clase
                </button>
                <div>
                    <p className="text-sm font-semibold text-ilinyx-800">
                        Firmando como: {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '—'}
                    </p>
                    <p className="text-xs text-ilinyx-600">Los demás participantes pueden firmar desde "Mis Actas"</p>
                </div>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full"><thead className="bg-slate-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Firma</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th className="w-10" />
                    </tr>
                </thead><tbody className="divide-y divide-slate-50">
                    {(acta.firmas || []).length === 0 && (
                        <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-sm">Sin firmas aún</td></tr>
                    )}
                    {(acta.firmas || []).map((f, i) => (
                        <tr key={i} className={f.firmado ? 'bg-emerald-50/30' : 'bg-amber-50/20'}>
                            <td className="px-3 py-2.5 font-medium text-slate-700 text-sm">{f.nombre}</td>
                            <td className="px-3 py-2.5 text-sm">
                                {f.firmado && f.firma?.startsWith('data:')
                                    ? <img src={f.firma} alt="Firma" className="max-h-10 max-w-[140px] object-contain" />
                                    : f.firmado ? <span className="text-emerald-600 font-semibold">✓ Firmado</span>
                                        : <span className="text-amber-500 italic">Pendiente</span>
                                }
                            </td>
                            <td className="px-3 py-2.5 text-slate-400 text-xs">{f.fecha || '—'}</td>
                            <td className="px-2 py-2 text-center flex items-center gap-1">
                                {f.firmado
                                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                    : <span className="w-4 h-4 rounded-full bg-amber-200 mx-auto block" title="Pendiente" />
                                }
                                <button onClick={() => delRow('firmas', i)} className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors" title="Quitar">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody></table>
            </div>
        </Sec>
    );
}
