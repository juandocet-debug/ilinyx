/**
 * Constantes compartidas del módulo de evaluaciones.
 * Centraliza labels, estilos de nivel y helpers de cálculo
 * para evitar duplicación entre RubricaGrid, EvalPDF y CalificarEstudiantes.
 */

export const NIVEL_LABELS = {
    1: 'Insuficiente',
    2: 'Básico',
    3: 'Adecuado',
    4: 'Bueno',
    5: 'Excelente',
};

/** Paleta semántica por nivel — usada en el PDF y badges */
export const NIVEL_STYLE = {
    1: { color: '#B91C1C', bg: '#FEF2F2' },
    2: { color: '#C2410C', bg: '#FFF7ED' },
    3: { color: '#92400E', bg: '#FFFBEB' },
    4: { color: '#166534', bg: '#F0FDF4' },
    5: { color: '#4338CA', bg: '#EEF2FF' },
};

/** Paleta interactiva por nivel — usada en el grid de calificación */
export const NIVEL_COLORS = {
    1: { color: '#ef4444', bg: '#fee2e2', label: 'Insuficiente' },
    2: { color: '#f97316', bg: '#ffedd5', label: 'Básico' },
    3: { color: '#eab308', bg: '#fef9c3', label: 'Adecuado' },
    4: { color: '#22c55e', bg: '#dcfce7', label: 'Bueno' },
    5: { color: '#6366f1', bg: '#ede9fe', label: 'Excelente' },
};

export function getNivelStyle(v) {
    return NIVEL_STYLE[v] || { color: '#475569', bg: '#F8FAFC' };
}

export function getNivelColor(v) {
    return NIVEL_COLORS[v] || { color: '#64748b', bg: '#f1f5f9', label: `Nivel ${v}` };
}

/** Calcula promedio de un set de puntajes dado un array de criterios */
export function calcPromedioFromScores(criterios, scores) {
    if (!criterios?.length) return 0;
    const vals = criterios.map(c => scores?.[c.id] || 0).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}
