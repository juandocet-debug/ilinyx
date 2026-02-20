import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSignature, Users2, TrendingUp, Clock } from 'lucide-react';
import { getActas, getGrupos } from '../services/api';
import { useUser } from '../context/UserContext';

const card = (delay, children) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
    >
        {children}
    </motion.div>
);

export default function Dashboard() {
    const { user } = useUser();
    const [stats, setStats] = useState({ actas: 0, grupos: 0 });

    useEffect(() => {
        Promise.all([getActas(), getGrupos()])
            .then(([a, g]) => setStats({ actas: a.data.length, grupos: g.data.length }))
            .catch(() => { });
    }, []);

    const CARDS = [
        {
            to: '/actas',
            icon: FileSignature,
            label: 'Registro de Actas',
            desc: 'Crea y consulta actas estudiantiles con logros, acuerdos y evidencias.',
            count: stats.actas,
            countLabel: 'Actas registradas',
            gradient: 'from-ilinyx-600 to-ilinyx-800',
            delay: 0.1,
        },
        {
            to: '/grupos',
            icon: Users2,
            label: 'Cohortes / Grupos',
            desc: 'Administra las cohortes académicas y asigna asesores de grupo.',
            count: stats.grupos,
            countLabel: 'Grupos activos',
            gradient: 'from-violet-500 to-purple-700',
            delay: 0.2,
        },
    ];

    return (
        <div className="space-y-8">

            {/* Saludo */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    Bienvenido, {user?.first_name || 'usuario'} 👋
                </h1>
                <p className="text-slate-500 mt-1">Panel de gestión de actas y cohortes — Ilinyx</p>
            </motion.div>

            {/* Stats rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Actas totales', value: stats.actas, icon: FileSignature, color: 'text-ilinyx-600 bg-ilinyx-50' },
                    { label: 'Cohortes', value: stats.grupos, icon: Users2, color: 'text-violet-600 bg-violet-50' },
                    { label: 'Este mes', value: '—', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Última actividad', value: 'Hoy', icon: Clock, color: 'text-amber-600 bg-amber-50' },
                ].map(({ label, value, icon: Icon, color }, i) => (
                    <motion.div key={label}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-xl ${color}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-800">{value}</p>
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Accesos rápidos */}
            <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Accesos rápidos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CARDS.map(({ to, icon: Icon, label, desc, count, countLabel, gradient, delay }) =>
                        card(delay,
                            <Link to={to}
                                className="group block bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-md`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-ilinyx-700 transition-colors">{label}</h3>
                                <p className="text-sm text-slate-500 mt-1 mb-4">{desc}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">{countLabel}</span>
                                    <span className="text-2xl font-black text-ilinyx-600">{count}</span>
                                </div>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
