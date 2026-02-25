import axios from 'axios';

// En dev apunta al backend de Ilinyx. En producción Render lo sirve todo junto.
const ILINYX_URL = import.meta.env.VITE_API_URL || '/api';
const AGON_URL = import.meta.env.VITE_AGON_API_URL || 'http://localhost:8000/api';

// ── Cliente Ilinyx ──────────────────────────────────────────────────────────
const api = axios.create({ baseURL: ILINYX_URL });

api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('ilinyx_token') || localStorage.getItem('access_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

api.interceptors.response.use(
    r => r,
    async err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('ilinyx_token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ── Cliente Agon (ya no se usa directamente desde el browser) ───────────────
export const agonApi = axios.create({ baseURL: AGON_URL });

// agonApi también necesita enviar el JWT para endpoints como /users/me/
agonApi.interceptors.request.use(cfg => {
    const token = localStorage.getItem('ilinyx_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});


// ── Helpers reutilizables ───────────────────────────────────────────────────
// Actas
export const getActas = () => api.get('/actas/registros/');
export const createActa = data => api.post('/actas/registros/', data);
export const deleteActa = id => api.delete(`/actas/registros/${id}/`);
export const previewActa = id => api.get(`/actas/registros/${id}/preview/`);

// Documentos (base de actas)
export const getDocumentos = () => api.get('/actas/documentos/');
export const createDocumento = data => api.post('/actas/documentos/', data);
export const deleteDocumento = id => api.delete(`/actas/documentos/${id}/`);

// Grupos
export const getGrupos = () => api.get('/grupos/');
export const createGrupo = data => api.post('/grupos/', data);
export const deleteGrupo = id => api.delete(`/grupos/${id}/`);

// Usuarios de AGON — vía proxy seguro de ILINYX (server-to-server con API key)
export const getTeachers = () => agonApi.get('/users/?role=TEACHER');
export const searchUsers = (q) => api.get(`/actas/usuarios/buscar/?q=${encodeURIComponent(q)}`);
export const getMe = () => agonApi.get('/users/me/');

// Clases de AGON
export const getAgonCourses = () => api.get('/actas/clases-agon/');

// Comentarios de actas (legacy)
export const getComments = (actaId) => api.get(`/actas/comentarios/${actaId}/`);
export const postComment = (actaId, text) => api.post(`/actas/comentarios/${actaId}/`, { text, created_at: new Date().toISOString() });

// ── Actas de Reunión — BD compartida ──────────────────────────────────────
export const getActasReunion = () => api.get('/actas/reuniones/');
export const createActaReunion = data => api.post('/actas/reuniones/', data);
export const updateActaReunion = (id, d) => api.put(`/actas/reuniones/${id}/`, d);
export const deleteActaReunion = id => api.delete(`/actas/reuniones/${id}/`);
export const getMisActasReunion = () => api.get('/actas/reuniones/mis/');
export const firmarActaReunion = (id, firma, fecha) => api.post(`/actas/reuniones/${id}/firmar/`, { firma, fecha });
export const comentarActaReunion = (id, text) => api.post(`/actas/reuniones/${id}/comentar/`, { text, created_at: new Date().toISOString() });


export default api;
