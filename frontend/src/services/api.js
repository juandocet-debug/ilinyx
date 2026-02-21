import axios from 'axios';

// En dev apunta al backend de Ilinyx. En producción Render lo sirve todo junto.
const ILINYX_URL = import.meta.env.VITE_ILINYX_API_URL || '/api';
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
// El browser solo envía su JWT de ILINYX, la API key de AGON nunca sale del servidor
export const getTeachers = () => agonApi.get('/users/?role=TEACHER');
export const searchUsers = (q) => api.get(`/actas/usuarios/buscar/?q=${encodeURIComponent(q)}`);
export const getMe = () => agonApi.get('/users/me/');


export default api;
