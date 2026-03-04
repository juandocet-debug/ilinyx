/* eslint-disable */
// components/actas/PeopleTable.jsx
// Tabla editable de personas (asistentes, ausentes, invitados) con autocomplete y avatar.

import React from 'react';
import { Trash2, Plus, Users } from 'lucide-react';
import UserAutocomplete from './UserAutocomplete';

const ROLE_ES = { ADMIN: 'Administrador', TEACHER: 'Docente', STUDENT: 'Estudiante', COORDINATOR: 'Coordinador' };

export default function PeopleTable({ rows, onChange, onAdd, onDel, emptyRow, onImportCourse }) {
    return (
        <div className="space-y-2">
            <div className="rounded-xl border border-slate-200 overflow-visible">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12" />
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre completo</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargo / Dependencia</th>
                            <th className="w-10" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                                <td className="px-2 py-2">
                                    {row.foto
                                        ? <img src={row.foto} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow" />
                                        : row.nombre && row.nombre !== 'N/A'
                                            ? <div className="w-9 h-9 rounded-full bg-ilinyx-100 flex items-center justify-center text-ilinyx-600 font-bold text-[10px]">
                                                {row.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                            </div>
                                            : <div className="w-9 h-9 rounded-full bg-slate-100 border border-dashed border-slate-300" />
                                    }
                                </td>
                                <td className="px-2 py-2">
                                    <UserAutocomplete
                                        value={row.nombre}
                                        onChangeName={val => onChange(i, 'nombre', val)}
                                        onSelect={(user, name) => {
                                            onChange(i, 'nombre', name);
                                            onChange(i, 'cargo', ROLE_ES[user.role] || user.role || user.cargo || '');
                                            onChange(i, 'email', user.email || '');
                                            onChange(i, 'user_id', user.id);
                                            onChange(i, 'foto', user.photo || '');
                                        }}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input value={row.cargo || ''} onChange={e => onChange(i, 'cargo', e.target.value)}
                                        placeholder="Se autocompleta o escribe"
                                        className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ilinyx-400/20 focus:border-ilinyx-500 transition-all" />
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <button onClick={() => onDel(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onAdd(emptyRow)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ilinyx-600 hover:text-ilinyx-800 transition-colors px-2 py-1 rounded-lg hover:bg-ilinyx-50">
                    <Plus className="h-3.5 w-3.5" /> Agregar fila
                </button>
                {onImportCourse && (
                    <button onClick={onImportCourse}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50">
                        <Users className="h-3.5 w-3.5" /> Importar grupo o clase
                    </button>
                )}
            </div>
        </div>
    );
}
