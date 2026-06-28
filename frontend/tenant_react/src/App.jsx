import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import SubscriptionPage from './pages/SubscriptionPage';
import KycPage from './pages/KycPage';
import ThemesPage from './pages/ThemesPage';
import DomainsPage from './pages/DomainsPage';
import LoginLogsPage from './pages/LoginLogsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import MaintenancePage from './pages/MaintenancePage';
import SessionsPage from './pages/SessionsPage';
import SecurityPage from './pages/SecurityPage';
import ProfilePage from './pages/ProfilePage';

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
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/kyc" element={<KycPage />} />
        <Route path="/themes" element={<ThemesPage />} />
        <Route path="/domains" element={<DomainsPage />} />
        <Route path="/logs/login" element={<LoginLogsPage />} />
        <Route path="/logs/activity" element={<ActivityLogsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
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
          toastStyle={{ background: '#111827', color: '#f1f5f9', border: '1px solid #1f2937' }}
          theme="dark"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
