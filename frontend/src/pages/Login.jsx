import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff, CreditCard } from 'lucide-react';
import { useUser } from '../context/UserContext';

const UPN_LOGO = 'https://i.ibb.co/C5SB6zj4/Identidad-UPN-25-vertical-azul-fondo-blanco.png';
const ILINYX_LOGO = 'https://i.ibb.co/4w0QCLPs/ilixlogo.jpg';

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
        <div className="min-h-screen flex overflow-hidden font-sans">

            {/* ── Panel izquierdo — Morado ILINYX ── */}
            <div
                className="hidden md:flex md:w-[45%] relative flex-col justify-between items-center overflow-hidden py-10 px-8"
                style={{ background: 'linear-gradient(160deg, #3b0764 0%, #6d28d9 45%, #8b5cf6 100%)' }}
            >
                {/* Círculos decorativos de fondo */}
                <div className="absolute -top-32 -right-28 w-[400px] h-[400px] rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-24 -left-16 w-[320px] h-[320px] rounded-full opacity-10 bg-white" />
                <div className="absolute top-[35%] -left-14 w-[180px] h-[180px] rounded-full opacity-[0.06] bg-white" />

                {/* Logo UPN — arriba */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 flex flex-col items-center gap-2"
                >
                    <div className="bg-white rounded-2xl px-5 py-3 shadow-2xl shadow-black/30">
                        <img src={UPN_LOGO} alt="Logo UPN" className="h-20 object-contain" />
                    </div>
                    <p className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.3em]">
                        Universidad Pedagógica Nacional
                    </p>
                </motion.div>

                {/* Tarjeta central con logo ILINYX */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 90 }}
                    className="relative z-10 w-full flex flex-col items-center gap-5"
                >
                    {/* Nombre del sistema */}
                    <h1 className="text-5xl font-black text-white tracking-[0.12em] drop-shadow-lg">
                        ILINYX
                    </h1>
                    <p className="text-purple-200/80 text-xs font-semibold uppercase tracking-[0.25em]">
                        Gestión de Actas y Cohortes
                    </p>

                    {/* Tarjeta rectangular con logo */}
                    <div
                        className="w-56 rounded-3xl overflow-hidden shadow-2xl shadow-black/40"
                        style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.25)' }}
                    >
                        <div className="bg-white/95 flex items-center justify-center p-6">
                            <img
                                src={ILINYX_LOGO}
                                alt="Logo ILINYX"
                                className="w-32 h-32 object-contain rounded-2xl shadow-md"
                            />
                        </div>
                        <div className="px-4 py-3 text-center">
                            <p className="text-white/90 text-[11px] font-bold uppercase tracking-widest">Actas Estudiantiles</p>
                            <p className="text-white/50 text-[10px] mt-0.5">Licenciatura en Recreación</p>
                        </div>
                    </div>
                </motion.div>

                {/* Pie — copyright */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative z-10 text-white/30 text-[10px] text-center"
                >
                    © 2026 · UPN-CIAR
                </motion.p>
            </div>

            {/* ── Panel derecho — Formulario ── */}
            <div className="w-full md:w-[55%] flex items-center justify-center bg-white px-6 md:px-12 lg:px-20">
                <div className="w-full max-w-md">

                    {/* Header mobile */}
                    <div className="md:hidden mb-8 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-700 flex items-center justify-center overflow-hidden shadow">
                            <img src={ILINYX_LOGO} alt="ILINYX" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                            <p className="font-black text-purple-800 text-sm tracking-widest">ILINYX</p>
                            <p className="text-slate-400 text-xs">Gestión de Actas · UPN</p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                    >
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-1">Iniciar sesión</h2>
                            <p className="text-slate-400 text-sm">Usa tu cuenta de Agon para ingresar al sistema.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Número de Cédula</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CreditCard className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-sm font-medium"
                                        placeholder="1234567890"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-sm font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, #5b21b6, #8b5cf6)', boxShadow: '0 4px 24px rgba(109,40,217,0.4)' }}>
                                {loading ? 'Ingresando...' : 'Iniciar sesión'}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>

                        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
                            <img src={ILINYX_LOGO} alt="ILINYX" className="h-5 w-5 object-contain rounded opacity-50" />
                            <span className="text-xs">ILINYX · © 2026 Universidad Pedagógica Nacional</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
