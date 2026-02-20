import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, FileSignature, Users2,
    LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const UPN_LOGO = 'https://i.ibb.co/C5SB6zj4/Identidad-UPN-25-vertical-azul-fondo-blanco.png';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { to: '/actas', icon: FileSignature, label: 'Registro de Actas' },
    { to: '/grupos', icon: Users2, label: 'Cohortes / Grupos' },
];

export default function DashboardLayout() {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Header sidebar */}
            <div className="px-6 py-6 border-b border-ilinyx-800/50">
                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-xl p-1.5 shadow-md flex-shrink-0">
                        <img src={UPN_LOGO} alt="UPN" className="h-8 object-contain" />
                    </div>
                    <div>
                        <p className="text-white font-black text-sm tracking-widest uppercase">ILINYX</p>
                        <p className="text-ilinyx-300 text-[10px] font-medium">Gestión de Actas</p>
                    </div>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
              ${isActive
                                ? 'bg-ilinyx-600 text-white shadow-lg shadow-ilinyx-900/30'
                                : 'text-ilinyx-200 hover:bg-ilinyx-800/60 hover:text-white'}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{label}</span>
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            {/* Footer sidebar — info usuario */}
            <div className="px-4 py-4 border-t border-ilinyx-800/50">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-ilinyx-800/50">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ilinyx-400 to-ilinyx-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">
                            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                        </p>
                        <p className="text-ilinyx-300 text-[10px] truncate capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                    <button onClick={handleLogout}
                        className="text-ilinyx-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
                        title="Cerrar sesión">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* ── Sidebar Desktop ──────────────────────────────────────── */}
            <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 z-40 bg-ilinyx-900 shadow-2xl">
                <SidebarContent />
            </aside>

            {/* ── Sidebar Mobile (drawer) ─────────────────────────────── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/50 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 z-50 w-64 bg-ilinyx-900 shadow-2xl md:hidden"
                        >
                            <button onClick={() => setSidebarOpen(false)}
                                className="absolute top-4 right-4 text-ilinyx-300 hover:text-white p-1">
                                <X className="h-5 w-5" />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Contenido principal ──────────────────────────────────── */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

                {/* Topbar */}
                <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between px-4 md:px-8 h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)}
                                className="md:hidden text-slate-500 hover:text-ilinyx-600 p-1.5 rounded-lg hover:bg-ilinyx-50 transition-colors">
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="hidden md:flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-ilinyx-500 animate-pulse" />
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Ilinyx</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-700">
                                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                                </p>
                                <p className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ilinyx-400 to-ilinyx-600 flex items-center justify-center text-white font-bold text-sm shadow">
                                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Página actual */}
                <main className="flex-1 p-4 md:p-8 page-enter">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
