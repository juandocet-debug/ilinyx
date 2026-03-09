import React, { createContext, useContext, useState, useEffect } from 'react';
import { agonApi } from '../services/api';
import api from '../services/api';

const UserContext = createContext(null);

function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        return JSON.parse(json);
    } catch { return null; }
}

function tokenExpirado(payload) {
    if (!payload?.exp) return false;
    return Date.now() / 1000 > payload.exp;
}

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const cargarDesdeToken = (token) => {
        const payload = decodeJWT(token);
        if (!payload || tokenExpirado(payload)) return null;
        // AGON JWT estándar solo incluye user_id + exp; los demás campos pueden no estar
        return {
            id:         payload.user_id || payload.id || null,
            pk:         payload.user_id || payload.id || null,
            username:   payload.username || '',
            email:      payload.email || '',
            first_name: payload.first_name || '',
            last_name:  payload.last_name || '',
            role:       payload.role || '',
            photo:      payload.photo || null,
            is_staff:   payload.is_staff || false,
        };
    };

    const login = async (username, password) => {
        const { data } = await agonApi.post('/token/', { username, password });
        localStorage.setItem('ilinyx_token', data.access);
        localStorage.setItem('ilinyx_refresh', data.refresh);
        const base = cargarDesdeToken(data.access);
        setUser(base);
        // Fetch perfil completo en background
        try {
            const r = await api.get('/auth/me/');
            setUser(prev => ({ ...prev, ...r.data }));
        } catch {}
        return data;
    };

    const logout = () => {
        localStorage.removeItem('ilinyx_token');
        localStorage.removeItem('ilinyx_refresh');
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('ilinyx_token');
        if (token) {
            const base = cargarDesdeToken(token);
            if (base) {
                setUser(base);                       // ← UI visible inmediatamente
                setLoading(false);
                // Fetch perfil completo en background (no bloquea la UI)
                api.get('/auth/me/')
                   .then(r => setUser(prev => ({ ...prev, ...r.data })))
                   .catch(() => {});                 // silencioso si AGON falla
            } else {
                localStorage.removeItem('ilinyx_token');
                localStorage.removeItem('ilinyx_refresh');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
