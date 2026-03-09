import React, { createContext, useContext, useState, useEffect } from 'react';
import { agonApi } from '../services/api';

const UserContext = createContext(null);

/**
 * Decodifica el payload del JWT sin necesidad de red.
 * El token ya contiene id, username, email, role, etc.
 * La validación real de seguridad ocurre en el backend de Ilinyx.
 */
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
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
        if (!payload) return null;
        if (tokenExpirado(payload)) return null;
        // El JWT de AGON incluye estos campos en el payload
        return {
            id:         payload.user_id || payload.id,
            pk:         payload.user_id || payload.id,
            username:   payload.username || '',
            email:      payload.email || '',
            first_name: payload.first_name || '',
            last_name:  payload.last_name || '',
            role:       payload.role || '',
            is_staff:   payload.is_staff || false,
        };
    };

    // Login: obtiene el JWT de AGON y decodifica localmente los datos del usuario
    const login = async (username, password) => {
        const { data } = await agonApi.post('/token/', { username, password });
        localStorage.setItem('ilinyx_token', data.access);
        localStorage.setItem('ilinyx_refresh', data.refresh);
        const userData = cargarDesdeToken(data.access);
        setUser(userData);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('ilinyx_token');
        localStorage.removeItem('ilinyx_refresh');
        setUser(null);
    };

    // Al montar: leer el token del localStorage e información instantáneamente (sin red)
    useEffect(() => {
        const token = localStorage.getItem('ilinyx_token');
        if (token) {
            const userData = cargarDesdeToken(token);
            if (userData) {
                setUser(userData);
            } else {
                // Token expirado o inválido → limpiar y mostrar login
                localStorage.removeItem('ilinyx_token');
                localStorage.removeItem('ilinyx_refresh');
            }
        }
        setLoading(false); // Siempre termina inmediatamente
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
