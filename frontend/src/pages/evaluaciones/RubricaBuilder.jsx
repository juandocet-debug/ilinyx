import React, { useState } from 'react';
import { X, Plus, Save, GripVertical, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const NIVELES_DEFAULT = [
    { valor: 1, descripcion: '' },
    { valor: 2, descripcion: '' },
    { valor: 3, descripcion: '' },
    { valor: 4, descripcion: '' },
    { valor: 5, descripcion: '' },
];

const NIVEL_LABELS = { 1:'Insuficiente', 2:'Básico', 3:'Adecuado', 4:'Bueno', 5:'Excelente' };
const NIVEL_COLORS = { 1:'#ef4444', 2:'#f97316', 3:'#eab308', 4:'#22c55e', 5:'#6366f1' };

function CriterioRow({ criterio, idx, total, onChange, onRemove, dragHandlers }) {
    const [expanded, setExpanded] = useState(true);

    const updateNivel = (nIdx, field, val) => {
        const newNiveles = criterio.niveles.map((n, i) => i === nIdx ? { ...n, [field]: val } : n);
        onChange({ ...criterio, niveles: newNiveles });
    };

    const addNivel = () => {
        const nextVal = (criterio.niveles[criterio.niveles.length - 1]?.valor || 0) + 1;
        onChange({ ...criterio, niveles: [...criterio.niveles, { valor: nextVal, descripcion: '' }] });
    };

    const removeNivel = (nIdx) => {
        onChange({ ...criterio, niveles: criterio.niveles.filter((_, i) => i !== nIdx) });
    };

    return (
        <div style={{ border:'1.5px solid #e2e8f0', borderRadius:'12px', overflow:'hidden', background: expanded ? '#fff' : '#fafafa' }}>
            {/* Fila de cabecera del criterio */}
            <div {...dragHandlers} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', background:'#f8fafc', cursor:'grab' }}>
                <GripVertical size={15} style={{ color:'#c4b5fd', flexShrink:0 }}/>
                <span style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'0.62rem', flexShrink:0 }}>{idx + 1}</span>
                <input
                    value={criterio.nombre}
                    onChange={e => onChange({ ...criterio, nombre: e.target.value })}
                    placeholder={`Nombre del criterio ${idx + 1}`}
                    style={{ flex:1, border:'none', background:'transparent', outline:'none', fontSize:'0.87rem', color:'#1e293b', fontWeight:600 }}
                    onPointerDown={e => e.stopPropagation()}
                />
                <button onClick={() => setExpanded(v => !v)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', display:'flex', padding:'4px' }}>
                    {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                </button>
                {total > 1 && (
                    <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'#f87171', display:'flex', padding:'4px' }}>
                        <Trash2 size={14}/>
                    </button>
                )}
            </div>

            {/* Niveles expandibles */}
            {expanded && (
                <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:'6px' }}>
                    <p style={{ margin:'0 0 6px', fontSize:'0.7rem', fontWeight:700, color:'#6b7280', textTransform:'uppercase' }}>Niveles de logro</p>
                    {criterio.niveles.map((n, nIdx) => (
                        <div key={nIdx} style={{ display:'grid', gridTemplateColumns:'80px 1fr auto', gap:'8px', alignItems:'flex-start' }}>
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                                <span style={{ fontWeight:900, fontSize:'1.1rem', color: NIVEL_COLORS[n.valor] || '#64748b' }}>{n.valor}</span>
                                <span style={{ fontSize:'0.62rem', fontWeight:700, color: NIVEL_COLORS[n.valor] || '#94a3b8' }}>{NIVEL_LABELS[n.valor] || `Nivel ${n.valor}`}</span>
                                <input type="number" min={1} max={10} value={n.valor}
                                    onChange={e => updateNivel(nIdx, 'valor', parseInt(e.target.value))}
                                    style={{ width:'50px', textAlign:'center', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'2px 4px', fontSize:'0.75rem' }}
                                />
                            </div>
                            <textarea
                                value={n.descripcion}
                                onChange={e => updateNivel(nIdx, 'descripcion', e.target.value)}
                                placeholder={`Describe qué significa obtener ${n.valor} en este criterio...`}
                                rows={2}
                                style={{ border:'1.5px solid #e2e8f0', borderRadius:'8px', padding:'8px', fontSize:'0.8rem', color:'#1e293b', resize:'vertical', outline:'none', fontFamily:'inherit', width:'100%', boxSizing:'border-box' }}
                            />
                            {criterio.niveles.length > 1 && (
                                <button onClick={() => removeNivel(nIdx)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', padding:'4px', marginTop:'2px' }}>
                                    <X size={13}/>
                                </button>
                            )}
                        </div>
                    ))}
                    <button className="eval-btn-ghost" onClick={addNivel} style={{ alignSelf:'flex-start', fontSize:'0.72rem', padding:'4px 10px', marginTop:'4px' }}>
                        <Plus size={12}/> Agregar nivel
                    </button>
                </div>
            )}
        </div>
    );
}

export default function RubricaBuilder({ rubricaInicial, saveRubrica, onClose }) {
    const [titulo, setTitulo] = useState(rubricaInicial?.titulo || '');
    const [descripcion, setDescripcion] = useState(rubricaInicial?.descripcion || '');
    const [cantEvaluadores, setCantEvaluadores] = useState(rubricaInicial?.cant_evaluadores || 1);
    const [criterios, setCriterios] = useState(
        rubricaInicial?.criterios?.map(c => ({
            _id: c.id,
            nombre: c.nombre,
            niveles: c.niveles?.length ? c.niveles : [...NIVELES_DEFAULT],
        })) || [{ _id: Date.now(), nombre: '', niveles: [...NIVELES_DEFAULT.map(n => ({ ...n }))] }]
    );
    const [dragIdx, setDragIdx] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const addCriterio = () => setCriterios(p => [...p, { _id: Date.now(), nombre: '', niveles: NIVELES_DEFAULT.map(n => ({ ...n })) }]);
    const removeCriterio = (idx) => setCriterios(p => p.filter((_, i) => i !== idx));
    const updateCriterio = (idx, val) => setCriterios(p => p.map((c, i) => i === idx ? val : c));

    const handleDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e, idx) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) return;
        setCriterios(p => { const l = [...p]; const [m] = l.splice(dragIdx, 1); l.splice(idx, 0, m); return l; });
        setDragIdx(idx);
    };
    const handleDragEnd = () => setDragIdx(null);

    const handleSave = async () => {
        setError('');
        if (!titulo.trim()) { setError('El título es obligatorio.'); return; }
        const crits = criterios.filter(c => c.nombre.trim()).map(c => ({
            nombre: c.nombre.trim(),
            niveles: c.niveles.filter(n => n.valor > 0).map(n => ({
                valor: n.valor,
                descripcion: n.descripcion || '',
            }))
        }));
        if (crits.length === 0) { setError('Agrega al menos un criterio con nombre.'); return; }
        setSaving(true);
        const ok = await saveRubrica({
            id: rubricaInicial?.id || null,  // null = nueva, number = edición
            titulo: titulo.trim(),
            descripcion,
            cant_evaluadores: cantEvaluadores,
            criterios: crits
        });
        setSaving(false);
        if (ok) onClose(true);
    };

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'720px', display:'flex', flexDirection:'column', boxShadow:'0 24px 60px rgba(0,0,0,0.25)', maxHeight:'92vh' }}>
                <div style={{ padding:'1.25rem 1.5rem', background:'linear-gradient(135deg,#1e1b4b,#4f46e5)', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'20px 20px 0 0', flexShrink:0 }}>
                    <h2 style={{ margin:0, fontWeight:800, fontSize:'1.05rem' }}>
                        {rubricaInicial ? '✏️ Editar Rúbrica' : '➕ Nueva Rúbrica'}
                    </h2>
                    <button onClick={() => onClose(false)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', cursor:'pointer', borderRadius:'8px', padding:'6px', display:'flex' }}><X size={18}/></button>
                </div>

                <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'1rem', overflowY:'auto' }}>
                    {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:'8px', padding:'8px 12px', fontSize:'0.82rem', fontWeight:600 }}>{error}</div>}

                    <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'12px' }}>
                        <div>
                            <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#6b7280', marginBottom:'5px', textTransform:'uppercase' }}>Título *</label>
                            <input value={titulo} onChange={e => setTitulo(e.target.value)} className="eval-select" placeholder="Ej: Evaluación Proyecto Final" />
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#6b7280', marginBottom:'5px', textTransform:'uppercase' }}>Evaluadores</label>
                            <input type="number" min={1} max={10} value={cantEvaluadores} onChange={e => setCantEvaluadores(Number(e.target.value))} className="eval-select" style={{ width:'80px' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#6b7280', marginBottom:'5px', textTransform:'uppercase' }}>Descripción general</label>
                        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="eval-select" placeholder="Propósito de esta rúbrica..." rows={2} style={{ resize:'vertical' }} />
                    </div>

                    <div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                            <label style={{ fontSize:'0.7rem', fontWeight:800, color:'#6b7280', textTransform:'uppercase' }}>
                                Criterios y Niveles — arrastra para reordenar
                            </label>
                            <button className="eval-btn-ghost" onClick={addCriterio} style={{ fontSize:'0.75rem', padding:'5px 12px' }}>
                                <Plus size={13}/> Criterio
                            </button>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                            {criterios.map((c, idx) => (
                                <CriterioRow key={c._id} criterio={c} idx={idx} total={criterios.length}
                                    onChange={(val) => updateCriterio(idx, val)}
                                    onRemove={() => removeCriterio(idx)}
                                    dragHandlers={{ draggable:true, onDragStart: e => handleDragStart(e, idx), onDragOver: e => handleDragOver(e, idx), onDragEnd: handleDragEnd }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid #f1f5f9', background:'#fafafa', display:'flex', justifyContent:'flex-end', gap:'10px', borderRadius:'0 0 20px 20px', flexShrink:0 }}>
                    <button onClick={() => onClose(false)} className="eval-btn-ghost">Cancelar</button>
                    <button onClick={handleSave} disabled={saving} className="eval-btn-primary">
                        <Save size={14}/> {saving ? 'Guardando...' : 'Guardar Rúbrica'}
                    </button>
                </div>
            </div>
        </div>
    );
}
