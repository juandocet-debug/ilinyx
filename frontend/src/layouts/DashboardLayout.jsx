import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, FileSignature, Users2,
    LogOut, Menu, X, ChevronRight, Bell, User
} from 'lucide-react';
import ServerStatus from '../components/ui/ServerStatus';

const ROLE_ES = { ADMIN: 'Administrador', TEACHER: 'Docente', STUDENT: 'Estudiante' };

const UPN_LOGO = 'https://i.ibb.co/C5SB6zj4/Identidad-UPN-25-vertical-azul-fondo-blanco.png';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { to: '/actas', icon: FileSignature, label: 'Registro de Actas' },
    { to: '/grupos', icon: Users2, label: 'Cohortes / Grupos' },
    { to: '/evaluaciones', icon: FileSignature, label: 'Evaluaciones' },
];

export default function DashboardLayout() {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* ── Cabecera: Perfil del usuario ── */}
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                        {user?.photo ? (
                            <img
                                src={user.photo}
                                alt="User"
                                className="w-11 h-11 rounded-full object-cover border-2 border-white/20 shadow-sm"
                            />
                        ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-ilinyx-400 to-ilinyx-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-ilinyx-900 rounded-full"></span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">
                            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                        </h3>
                        <p className="text-[11px] text-ilinyx-300 font-medium">
                            {ROLE_ES[user?.role] || user?.role || '—'}
                        </p>
                    </div>
                </div>
            </div>
            {/* Línea sutil */}
            <div className="mx-5 border-t border-ilinyx-800/50"></div>

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

            {/* Footer sidebar — branding ILINYX */}
            <div className="px-4 py-4 border-t border-ilinyx-800/50">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-ilinyx-800/50">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <img src={UPN_LOGO} alt="UPN" className="h-6 w-6 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">ILINYX</p>
                        <p className="text-ilinyx-300 text-[10px] truncate">Gestión de Actas</p>
                    </div>
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full mt-3 px-3 py-2.5 rounded-xl text-ilinyx-200 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm font-medium">
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
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
                                className="absolute top-3 right-3 z-[60] text-white bg-ilinyx-700 hover:bg-red-500 p-2 rounded-full shadow-lg transition-colors"
                                style={{ touchAction: 'manipulation' }}>
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
                        <div className="flex items-center gap-4">
                            {/* Indicador AGON */}
                            <ServerStatus />

                            {/* Campana */}
                            <button className="relative text-slate-400 hover:text-ilinyx-600 transition-colors p-1">
                                <Bell className="h-5 w-5" />
                            </button>

                            {/* Separador vertical rojo */}
                            <div className="w-px h-8 bg-red-400/60"></div>

                            {/* Nombre + Rol */}
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-700 leading-tight">
                                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                                </p>
                                <p className="text-xs text-slate-400">{ROLE_ES[user?.role] || user?.role || '—'}</p>
                            </div>

                            {/* Icono usuario con dropdown */}
                            <div className="relative">
                                <button onClick={() => setProfileOpen(p => !p)}
                                    className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                                    <User className="h-6 w-6" />
                                </button>
                                {/* Dropdown */}
                                <AnimatePresence>
                                    {profileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                                <div className="px-4 py-3 border-b border-slate-100">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{user?.email || (ROLE_ES[user?.role] || user?.role)}</p>
                                                </div>
                                                <button onClick={() => { setProfileOpen(false); handleLogout(); }}
                                                    className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                                                    <LogOut className="h-4 w-4" />
                                                    Cerrar sesión
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
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
