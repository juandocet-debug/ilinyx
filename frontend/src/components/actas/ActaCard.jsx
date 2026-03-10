import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

/**
 * Tarjeta de un acta en el listado.
 * Muestra: título, fecha, progreso de firmas, botón de firma y comentarios.
 */
export default function ActaCard({ acta, userId, onEdit, onDelete, onView, onSign, onComment }) {
    const totalFirmas = (acta.firmas || []).length;
    const firmasHechas = (acta.firmas || []).filter(f => f.firmado).length;
    const miEntry = (acta.firmas || []).find(f =>
        f.user_id && (f.user_id === userId || String(f.user_id) === String(userId))
    );
    const yoFirme = miEntry?.firmado;

    const [commentText, setCommentText] = useState('');

    const submitComment = () => {
        if (!commentText.trim()) return;
        onComment(acta.id, commentText);
        setCommentText('');
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                        {acta.numero ? `Acta ${acta.numero}` : 'Sin número'} · {acta.tipo}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {acta.fecha || 'Sin fecha'} · {acta.lugar || 'Sin lugar'}
                    </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onView(acta)} className="p-1.5 rounded-lg hover:bg-ilinyx-50 text-ilinyx-600 transition-colors text-xs font-semibold">Ver</button>
                    {onEdit && <button onClick={() => onEdit(acta)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors text-xs">Editar</button>}
                    {onDelete && <button onClick={() => onDelete(acta.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors text-xs">Eliminar</button>}
                </div>
            </div>

            {/* Progreso de firmas */}
            {totalFirmas > 0 && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Firmas</span>
                        <span className="font-semibold">{firmasHechas}/{totalFirmas}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(firmasHechas / totalFirmas) * 100}%` }} />
                    </div>
                </div>
            )}

            {/* Botón firma propia */}
            {miEntry && !yoFirme && (
                <button onClick={() => onSign(acta.id)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow">
                    ✍️ Firmar ahora
                </button>
            )}
            {yoFirme && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    ✓ Firmaste este acta
                </span>
            )}

            {/* Comentarios */}
            {onComment && (
                <div className="flex gap-2 pt-1 border-t border-slate-50">
                    <input value={commentText} onChange={e => setCommentText(e.target.value)}
                        placeholder="Comentar..."
                        onKeyDown={e => { if (e.key === 'Enter') submitComment(); }}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-300/30 focus:border-ilinyx-400" />
                    <button onClick={submitComment}
                        className="px-3 py-1.5 text-xs font-semibold bg-ilinyx-600 text-white rounded-lg hover:bg-ilinyx-700">
                        Enviar
                    </button>
                </div>
            )}
        </div>
    );
}
