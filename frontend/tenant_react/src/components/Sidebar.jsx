import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, CreditCard, Settings, LogOut, Shield, Monitor,
  Globe, Activity, Menu, X, Zap, Palette, FileText, ChevronRight, Wrench, UserCircle
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, exact: true },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Subscription', to: '/subscription', icon: CreditCard },
  { label: 'KYC Settings', to: '/kyc', icon: Shield },
  { label: 'Themes', to: '/themes', icon: Palette },
  { label: 'Domains', to: '/domains', icon: Globe },
  {
    label: 'Logs', icon: FileText, children: [
      { label: 'Login Logs', to: '/logs/login', icon: Activity },
      { label: 'Activity Logs', to: '/logs/activity', icon: Zap },
    ]
  },
  { label: 'Maintenance', to: '/maintenance', icon: Wrench },
  { label: 'Sessions', to: '/sessions', icon: Monitor },
  { label: 'Security', to: '/security', icon: Shield },
  { label: 'Profile', to: '/profile', icon: UserCircle },
];

function NavItem({ item, collapsed }) {
  const [open, setOpen] = useState(false);
  if (item.children) {
    return (
      <div>
        <button onClick={() => setOpen(!open)} className={`sidebar-link w-full justify-between ${open ? 'text-white bg-surface-hover' : ''}`}>
          <span className="flex items-center gap-3"><item.icon size={18} />{!collapsed && <span>{item.label}</span>}</span>
          {!collapsed && <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-90' : ''}`} />}
        </button>
        {open && !collapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => (
              <NavLink key={child.to} to={child.to} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                <child.icon size={16} /><span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <NavLink to={item.to} end={item.exact} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'} title={collapsed ? item.label : undefined}>
      <item.icon size={18} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-surface-card border-r border-surface-border flex flex-col transition-all duration-300 z-30 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                <Zap size={16} className="text-white" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-white truncate max-w-[120px]">{tenant?.brand_name || 'Tenant'}</p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white transition-colors">
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => <NavItem key={item.label} item={item} collapsed={collapsed} />)}
      </nav>

      <div className="p-3 border-t border-surface-border">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.type}</p>
            </div>
          </div>
        )}
        <button onClick={() => { logout(); navigate('/login'); }} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={18} />{!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
