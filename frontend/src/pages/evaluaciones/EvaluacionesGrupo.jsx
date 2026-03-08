import React, { useState, useEffect } from 'react';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import { useGrupos } from '../../hooks/useGrupos'; // Asegúrate de que existe este hook o algo similar

export default function EvaluacionesGrupo({ addToast, isStudent, user }) {
    const { evaluaciones, calificaciones, loadEvaluacionesGrupo, loadCalificaciones } = useEvaluaciones(addToast);
    
    // Aquí idealmente deberíamos cargar los grupos del usuario. Por simplicidad:
    useEffect(() => {
        loadEvaluacionesGrupo(); // Carga todas a las que tiene acceso
        loadCalificaciones();
    }, [loadEvaluacionesGrupo, loadCalificaciones]);

    if (isStudent) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Tus Calificaciones</h2>
                {calificaciones.length === 0 ? (
                    <div className="p-5 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                        No tienes calificaciones registradas aún.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {calificaciones.map(cal => (
                            <div key={cal.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-lg mb-2">Evaluación ID: {cal.evaluacion_grupo}</h3>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-semibold text-slate-500">Nota Final:</span>
                                    <span className="text-2xl font-black text-emerald-600">{cal.nota_final}</span>
                                </div>
                                <div className="space-y-1 text-sm text-slate-600">
                                    {Object.entries(cal.puntajes).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b pb-1">
                                            <span>Criterio ID {key}:</span>
                                            <span className="font-bold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                {cal.comentarios && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic">
                                        "{cal.comentarios}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-5 bg-white rounded-xl shadow border border-slate-200">
            <h2 className="text-xl font-bold mb-4">Grupos y Calificaciones</h2>
            <p className="text-slate-500 text-sm">Próximamente: Lista detallada de estudiantes por grupo para evaluarlos con la rúbrica.</p>
        </div>
    );
}
