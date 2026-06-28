import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Topbar collapsed={collapsed} />
      <main className={`pt-16 min-h-screen transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <div className="p-6 animate-fade-in"><Outlet /></div>
      </main>
    </div>
  );
}
