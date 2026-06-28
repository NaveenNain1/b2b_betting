import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const routeLabels = {
  '/': 'Dashboard', '/users': 'Users', '/subscription': 'Subscription',
  '/kyc': 'KYC Settings', '/themes': 'Theme Settings', '/domains': 'Domain Management',
  '/logs/login': 'Login Logs', '/logs/activity': 'Activity Logs',
  '/maintenance': 'Maintenance Mode', '/sessions': 'Sessions',
  '/security': 'Security', '/profile': 'Profile',
};

export default function Topbar({ collapsed }) {
  const location = useLocation();
  const { user, tenant } = useAuth();
  const title = routeLabels[location.pathname] || 'Dashboard';

  return (
    <header className={`fixed top-0 right-0 h-16 bg-surface-card border-b border-surface-border flex items-center justify-between px-6 z-20 transition-all duration-300 ${collapsed ? 'left-16' : 'left-60'}`}>
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <p className="text-xs text-gray-500">{tenant?.brand_name || 'Tenant Panel'}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-input rounded-lg border border-surface-border text-gray-500">
          <Search size={14} /><span className="text-xs hidden md:block">Search...</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold shadow-glow">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
