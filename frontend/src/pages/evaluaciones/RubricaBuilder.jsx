import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';

export default function RubricaBuilder({ onClose, addToast }) {
    const { saveRubrica } = useEvaluaciones(addToast);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [criterios, setCriterios] = useState([{ nombre: '' }]);

    const addCriterio = () => setCriterios([...criterios, { nombre: '' }]);
    const updateCriterio = (index, value) => {
        const newCriterios = [...criterios];
        newCriterios[index].nombre = value;
        setCriterios(newCriterios);
    };

    const handleSave = async () => {
        if (!titulo.trim()) return addToast('El título es requerido', 'warning');
        const crits = criterios.filter(c => c.nombre.trim() !== '');
        if (crits.length === 0) return addToast('Debes agregar al menos un criterio', 'warning');
        
        await saveRubrica({ titulo, descripcion, criterios: crits.map(c => c.nombre) });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-ilinyx-900 text-white">
                    <h2 className="font-bold text-lg">Crear Rúbrica de Evaluación</h2>
                    <button onClick={onClose} className="p-1 hover:bg-ilinyx-800 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                </div>

                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Título de la Rúbrica</label>
                        <input value={titulo} onChange={e => setTitulo(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ilinyx-300"
                            placeholder="Ej: Evaluación Proyecto Final" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Descripción (Opcional)</label>
                        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ilinyx-300"
                            placeholder="Describe el propósito de la evaluación..." rows={2} />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-xs font-bold text-slate-500">Criterios de Evaluación (1 a 5)</label>
                            <button onClick={addCriterio} className="text-xs font-semibold text-ilinyx-600 flex items-center gap-1 hover:bg-ilinyx-50 px-2 py-1 rounded-lg">
                                <Plus className="w-3 h-3"/> Agregar Criterio
                            </button>
                        </div>
                        <div className="space-y-2">
                            {criterios.map((c, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400 text-sm">{i + 1}.</span>
                                    <input value={c.nombre} onChange={e => updateCriterio(i, e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ilinyx-300 shadow-sm"
                                        placeholder={`Criterio ${i + 1} (Ej: Claridad expositiva)`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md flex items-center gap-2 transition-colors">
                        <Save className="w-4 h-4"/> Guardar Rúbrica
                    </button>
                </div>
            </div>
        </div>
    );
}
