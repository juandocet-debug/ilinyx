import React, { useState } from 'react';
import { X, Plus, Save, GripVertical } from 'lucide-react';

export default function RubricaBuilder({ rubricaInicial, saveRubrica, onClose }) {
    const [titulo, setTitulo] = useState(rubricaInicial?.titulo || '');
    const [descripcion, setDescripcion] = useState(rubricaInicial?.descripcion || '');
    const [cantEvaluadores, setCantEvaluadores] = useState(rubricaInicial?.cant_evaluadores || 1);
    const [criterios, setCriterios] = useState(
        rubricaInicial?.criterios?.map(c => ({ nombre: c.nombre, _id: c.id }))
        || [{ nombre: '', _id: Date.now() }]
    );
    const [dragIdx, setDragIdx] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const addCriterio = () =>
        setCriterios(prev => [...prev, { nombre: '', _id: Date.now() }]);

    const updateCriterio = (idx, value) =>
        setCriterios(prev => prev.map((c, i) => i === idx ? { ...c, nombre: value } : c));

    const removeCriterio = (idx) =>
        setCriterios(prev => prev.filter((_, i) => i !== idx));

    const handleDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e, idx) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) return;
        setCriterios(prev => {
            const list = [...prev];
            const [moved] = list.splice(dragIdx, 1);
            list.splice(idx, 0, moved);
            return list;
        });
        setDragIdx(idx);
    };
    const handleDragEnd = () => setDragIdx(null);

    const handleSave = async () => {
        setError('');
        if (!titulo.trim()) { setError('El título es obligatorio.'); return; }
        const crits = criterios.map(c => c.nombre.trim()).filter(Boolean);
        if (crits.length === 0) { setError('Agrega al menos un criterio.'); return; }
        setSaving(true);
        const ok = await saveRubrica({
            titulo: titulo.trim(),
            descripcion,
            cant_evaluadores: cantEvaluadores,
            criterios: crits,
        });
        setSaving(false);
        if (ok) onClose(true); // true = se guardó
    };

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'640px', display:'flex', flexDirection:'column', boxShadow:'0 24px 60px rgba(0,0,0,0.25)', maxHeight:'90vh' }}>
                {/* Header */}
                <div style={{ padding:'1.25rem 1.5rem', background:'linear-gradient(135deg,#1e1b4b,#4f46e5)', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'20px 20px 0 0' }}>
                    <h2 style={{ margin:0, fontWeight:800, fontSize:'1.05rem' }}>
                        {rubricaInicial ? '✏️ Editar Rúbrica' : '➕ Nueva Rúbrica de Evaluación'}
                    </h2>
                    <button onClick={() => onClose(false)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', cursor:'pointer', borderRadius:'8px', padding:'6px', display:'flex' }}>
                        <X size={18}/>
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', overflowY:'auto' }}>
                    {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:'8px', padding:'8px 12px', fontSize:'0.82rem', fontWeight:600 }}>{error}</div>}

                    <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'12px' }}>
                        <div>
                            <label style={{ display:'block', fontSize:'0.72rem', fontWeight:800, color:'#6b7280', marginBottom:'6px', textTransform:'uppercase' }}>Título *</label>
                            <input value={titulo} onChange={e => setTitulo(e.target.value)} className="eval-select"
                                placeholder="Ej: Evaluación Proyecto Final" />
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:'0.72rem', fontWeight:800, color:'#6b7280', marginBottom:'6px', textTransform:'uppercase' }}>Evaluadores</label>
                            <input type="number" min={1} max={10} value={cantEvaluadores}
                                onChange={e => setCantEvaluadores(Number(e.target.value))}
                                className="eval-select" style={{ width:'80px' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display:'block', fontSize:'0.72rem', fontWeight:800, color:'#6b7280', marginBottom:'6px', textTransform:'uppercase' }}>Descripción</label>
                        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="eval-select"
                            placeholder="Describe el propósito de esta rúbrica..." rows={2} style={{ resize:'vertical' }} />
                    </div>

                    {/* Criterios drag & drop */}
                    <div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                            <label style={{ fontSize:'0.72rem', fontWeight:800, color:'#6b7280', textTransform:'uppercase' }}>
                                Criterios — arrastra para reordenar
                            </label>
                            <button className="eval-btn-ghost" onClick={addCriterio} style={{ fontSize:'0.75rem', padding:'4px 10px' }}>
                                <Plus size={13}/> Agregar
                            </button>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                            {criterios.map((c, idx) => (
                                <div key={c._id} draggable
                                    onDragStart={e => handleDragStart(e, idx)}
                                    onDragOver={e => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                    style={{
                                        display:'flex', alignItems:'center', gap:'8px', padding:'9px 10px',
                                        borderRadius:'10px',
                                        background: dragIdx === idx ? '#ede9fe' : '#f8fafc',
                                        border: dragIdx === idx ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                                        cursor:'grab', transition:'all 0.12s'
                                    }}>
                                    <GripVertical size={16} style={{ color:'#c4b5fd', flexShrink:0 }}/>
                                    <span style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'0.65rem', flexShrink:0 }}>{idx + 1}</span>
                                    <input value={c.nombre} onChange={e => updateCriterio(idx, e.target.value)}
                                        placeholder={`Criterio ${idx + 1}`}
                                        style={{ flex:1, border:'none', background:'transparent', outline:'none', fontSize:'0.85rem', color:'#1e293b', fontWeight:500 }}/>
                                    {criterios.length > 1 && (
                                        <button onClick={() => removeCriterio(idx)}
                                            style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', padding:'4px', borderRadius:'6px', display:'flex' }}>
                                            <X size={14}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid #f1f5f9', background:'#fafafa', display:'flex', justifyContent:'flex-end', gap:'10px', borderRadius:'0 0 20px 20px' }}>
                    <button onClick={() => onClose(false)} className="eval-btn-ghost">Cancelar</button>
                    <button onClick={handleSave} disabled={saving} className="eval-btn-primary">
                        <Save size={14}/> {saving ? 'Guardando...' : 'Guardar Rúbrica'}
                    </button>
                </div>
            </div>
        </div>
    );
}
