import React, { useState, useEffect, useCallback } from 'react';
import { Database } from 'lucide-react';
import { agonApi } from '../../services/api';

export default function ServerStatus() {
    const [status, setStatus] = useState('checking'); // checking, online, offline
    const [latency, setLatency] = useState(0);

    const checkStatus = useCallback(async () => {
        const start = Date.now();
        setStatus('checking');
        try {
            // Un ping ligero al servidor AGON
            await agonApi.get('/users/me/', { timeout: 5000 });
            setLatency(Date.now() - start);
            setStatus('online');
        } catch (error) {
            setStatus('offline');
        }
    }, []);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check cada 30 segundos
        return () => clearInterval(interval);
    }, [checkStatus]);

    const isOnline = status === 'online';
    const isOffline = status === 'offline';
    const isChecking = status === 'checking';

    return (
        <button 
            onClick={checkStatus}
            disabled={isChecking}
            title={isOnline ? `Conectado a AGON (${latency}ms)` : 'AGON Offline'}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm active:scale-95
                ${isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' :
                  isOffline ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' :
                  'bg-amber-50 border-amber-200 text-amber-600'}`}
        >
            <div className="relative flex h-2 w-2">
                {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 
                    ${isOnline ? 'bg-emerald-500' : isOffline ? 'bg-red-500' : 'bg-amber-500'}`}></span>
            </div>
            
            <Database className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{isOnline ? 'AGON Activo' : isOffline ? 'AGON Offline' : 'Comprobando...'}</span>
            <span className="inline md:hidden">AGON</span>
            
            {isOnline && latency > 0 && (
                <span className="hidden lg:inline ml-0.5 opacity-70 font-medium text-[10px]">({latency}ms)</span>
            )}
        </button>
    );
}
