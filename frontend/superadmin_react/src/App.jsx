import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import PlansPage from './pages/PlansPage';
import OxapayPage from './pages/OxapayPage';
import LoginLogsPage from './pages/LoginLogsPage';
import TenantLoginLogsPage from './pages/TenantLoginLogsPage';
import SecurityPage from './pages/SecurityPage';
import SessionsPage from './pages/SessionsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/payment" element={<OxapayPage />} />
        <Route path="/logs/login" element={<LoginLogsPage />} />
        <Route path="/logs/tenant" element={<TenantLoginLogsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          toastStyle={{ background: '#161b22', color: '#f1f5f9', border: '1px solid #21262d' }}
          theme="dark"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
