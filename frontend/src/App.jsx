import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import api from './services/api';

const Login = lazy(() => import('./pages/Login'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ActasPage = lazy(() => import('./pages/Actas'));
const GruposPage = lazy(() => import('./pages/Grupos'));
const EvaluacionesPage = lazy(() => import('./pages/evaluaciones/Evaluaciones'));
const EntornosHub = lazy(() => import('./pages/entornos/EntornosHub'));
const EntornoDetalle = lazy(() => import('./pages/entornos/EntornoDetalle'));
const EntornoForm = lazy(() => import('./pages/entornos/EntornoForm'));

const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ilinyx-600" />
        <p className="text-slate-400 text-sm font-medium">Cargando Ilinyx...</p>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useUser();
    const token = localStorage.getItem('ilinyx_token');
    if (loading) return <PageLoader />;
    if (!user && !token) return <Navigate to="/login" replace />;
    return children;
};

const RootRedirect = () => {
    const { user, loading } = useUser();
    const token = localStorage.getItem('ilinyx_token');
    if (loading) return <PageLoader />;
    return (user || token) ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
    // Wakeup ping — despierta el backend (Render free tier se duerme)
    useEffect(() => {
        api.get('/actas/reuniones/').catch(() => { });
    }, []);

    return (
        <UserProvider>
            <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/login" element={<Login />} />

                        <Route element={
                            <ProtectedRoute>
                                <Suspense fallback={<PageLoader />}>
                                    <DashboardLayout />
                                </Suspense>
                            </ProtectedRoute>
                        }>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/actas" element={<ActasPage />} />
                            <Route path="/grupos" element={<GruposPage />} />
                            {/* Hub de evaluaciones (entrono + legacy en tabs) */}
                            <Route path="/evaluaciones" element={<EntornosHub />} />
                            {/* Entornos */}
                            <Route path="/entornos/nuevo" element={<EntornoForm />} />
                            <Route path="/entornos/:id" element={<EntornoDetalle />} />
                            <Route path="/entornos/:id/editar" element={<EntornoForm />} />
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;
