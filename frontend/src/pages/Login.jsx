import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff, CreditCard } from 'lucide-react';
import { useUser } from '../context/UserContext';

const UPN_LOGO = 'https://i.ibb.co/C5SB6zj4/Identidad-UPN-25-vertical-azul-fondo-blanco.png';
const SYSTEM_LOGO = 'https://i.ibb.co/7NNjZJ44/Chat-GPT-Image-20-feb-2026-06-33-06-p-m.png';

export default function Login() {
    const { login } = useUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) return;
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch {
            setError('Credenciales inválidas. Verifique su usuario y contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row shadow-2xl overflow-hidden">

            {/* ── Panel izquierdo (decorativo) ────────────────────────── */}
            <div className="hidden md:flex md:w-1/2 bg-ilinyx-700 relative flex-col justify-between items-center text-white p-10 overflow-hidden">

                {/* Fondos decorativos */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-3xl" />
                </div>

                {/* Logo UPN */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 text-center pt-4 w-full"
                >
                    <div className="inline-block bg-white rounded-2xl px-6 py-4 shadow-2xl shadow-black/20">
                        <img src={UPN_LOGO} alt="Logo UPN" className="h-24 object-contain mx-auto" />
                    </div>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
                        Universidad Pedagógica Nacional
                    </p>
                </motion.div>

                {/* Título central */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="relative z-10 text-center space-y-2 px-4"
                >
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-snug">
                        Sistema de Gestión de<br />Actas y Cohortes
                    </h1>
                    <p className="text-purple-200/80 font-medium tracking-[0.2em] uppercase text-xs">
                        Licenciatura en Recreación
                    </p>
                </motion.div>

                {/* Tarjeta ILINYX */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative z-10 w-full pb-2"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-white/15" />
                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.25em]">Potenciado por</span>
                        <div className="flex-1 h-px bg-white/15" />
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl shadow-black/25 overflow-hidden">
                        <div className="bg-gradient-to-r from-ilinyx-600 to-purple-500 px-5 py-3 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black tracking-[0.25em] text-white uppercase">ILINYX</p>
                                <p className="text-[10px] text-purple-100/90 font-medium mt-0.5">Gestión inteligente de actas</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                <span className="text-[10px] text-white font-bold">Activo</span>
                            </div>
                        </div>
                        {/* Logo del sistema */}
                        <div className="bg-white flex items-center justify-center py-6 relative overflow-hidden">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-200/50 blur-xl rounded-full" />
                            <div className="relative flex flex-col items-center gap-2">
                                <img src={SYSTEM_LOGO} alt="Logo ILINYX" className="h-24 w-24 object-contain rounded-2xl shadow-xl shadow-ilinyx-500/20" />
                                <p className="text-ilinyx-700 font-black text-lg tracking-widest uppercase">ILINYX</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── Panel derecho (formulario) ───────────────────────────── */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">

                    {/* Mobile header */}
                    <div className="md:hidden mb-6 -mt-6 -mx-6 bg-ilinyx-700 px-6 py-5 rounded-b-[2.5rem] shadow-xl relative overflow-hidden text-white">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-50%] w-[400px] h-[400px] rounded-full bg-white blur-3xl" />
                        </div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="bg-white p-2 rounded-xl shadow-md flex-shrink-0">
                                <img src={UPN_LOGO} alt="UPN" className="h-12 object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-tight">ILINYX</p>
                                <p className="text-purple-200 text-[10px] tracking-widest uppercase mt-0.5">Gestión de Actas</p>
                            </div>
                        </div>
                    </div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div className="text-center md:text-left mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Iniciar sesión</h2>
                            <p className="text-slate-500">Usa tu cuenta de Agon para ingresar.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Cédula */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Número de Cédula</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CreditCard className="h-5 w-5 text-slate-400 group-focus-within:text-ilinyx-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ilinyx-500/20 focus:border-ilinyx-600 transition-all font-medium"
                                        placeholder="1234567890"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>

                            {/* Contraseña */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-ilinyx-600 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ilinyx-500/20 focus:border-ilinyx-600 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full bg-ilinyx-700 hover:bg-ilinyx-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-ilinyx-700/30 hover:shadow-ilinyx-700/40 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] text-base disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? 'Ingresando...' : 'Iniciar sesión'} <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>

                        <div className="mt-10 flex items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="w-7 h-7 rounded-lg bg-ilinyx-700 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-400">ILINYX · © 2026 Universidad Pedagógica Nacional</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
