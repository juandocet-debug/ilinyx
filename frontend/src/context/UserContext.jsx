import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, agonApi } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const { data } = await getMe();
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Login usando las credenciales de Agon
    const login = async (username, password) => {
        const agonBase = import.meta.env.VITE_AGON_API_URL || 'http://localhost:8000/api';
        const { data } = await agonApi.post('/token/', { username, password });
        localStorage.setItem('ilinyx_token', data.access);
        localStorage.setItem('ilinyx_refresh', data.refresh);
        await fetchUser();
        return data;
    };

    const logout = () => {
        localStorage.removeItem('ilinyx_token');
        localStorage.removeItem('ilinyx_refresh');
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('ilinyx_token');
        if (token) fetchUser();
        else setLoading(false);
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, login, logout, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
