import { useEffect, useState } from 'react';
import { Users, Activity, Shield, Globe, TrendingUp, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api/tenantApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card p-5 flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-3 py-2 text-xs">
        <p className="text-gray-400">{label}</p>
        {payload.map((p, i) => <p key={i} className="text-white font-semibold">{p.name}: {p.value}</p>)}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const [users, setUsers] = useState([]);
  const [loginLogsData, setLoginLogsData] = useState([]);
  const [activityLogsData, setActivityLogsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, lRes, aRes] = await Promise.all([
          api.listUsers().catch(() => ({ data: { data: { users: [] } } })),
          api.loginLogs({ limit: 30 }).catch(() => ({ data: { data: { logs: [] } } })),
          api.activityLogs({ limit: 30 }).catch(() => ({ data: { data: { logs: [] } } })),
        ]);
        setUsers(uRes.data.data.users);
        setLoginLogsData(lRes.data.data.logs);
        setActivityLogsData(aRes.data.data.logs);
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const chartData = (() => {
    const map = {};
    loginLogsData.forEach((log) => {
      const d = new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).slice(-7).map(([date, logins]) => ({ date, logins }));
  })();

  const subStatus = tenant?.subscription?.status || 'trial';
  const subBadge = { active: 'badge-green', trial: 'badge-yellow', past_due: 'badge-red', cancelled: 'badge-red', expired: 'badge-red' }[subStatus] || 'badge-yellow';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-5 bg-brand-gradient relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative">
          <p className="text-brand-100 text-sm font-medium">Welcome back,</p>
          <h2 className="text-2xl font-bold text-white mt-1">{user?.name}</h2>
          <p className="text-brand-200 text-sm mt-1">{tenant?.brand_name} · {tenant?.primary_domain}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`badge ${subBadge}`}>Plan: {tenant?.subscription?.plan?.name || 'No Plan'}</span>
            <span className={`badge ${subBadge}`}>Status: {subStatus}</span>
            {tenant?.maintenance_mode && <span className="badge badge-red">⚠️ Maintenance Mode</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={loading ? '...' : users.length} icon={Users} color="bg-brand-gradient" sub="Sub-admin accounts" />
        <StatCard label="Active Users" value={loading ? '...' : users.filter(u => u.status === 'active').length} icon={Activity} color="bg-emerald-500/80" />
        <StatCard label="Login Events" value={loading ? '...' : loginLogsData.length} icon={Shield} color="bg-violet-500/80" sub="Last 30 records" />
        <StatCard label="Activities" value={loading ? '...' : activityLogsData.length} icon={TrendingUp} color="bg-cyan-500/80" sub="Last 30 records" />
      </div>

      {/* Chart + users */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Login Activity</h3>
            <span className="badge badge-purple">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="lGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="logins" name="Logins" stroke="#059669" strokeWidth={2} fill="url(#lGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Users list */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold text-white mb-4">Team Members</h3>
          <div className="space-y-3">
            {loading ? <p className="text-gray-500 text-sm">Loading...</p> :
            users.length === 0 ? <p className="text-gray-500 text-sm">No users yet</p> :
            users.slice(0, 6).map((u) => (
              <div key={u._id} className="flex items-center justify-between border-b border-surface-border/50 pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.type}</p>
                  </div>
                </div>
                <span className={u.status === 'active' ? 'badge badge-green' : 'badge badge-red'}>{u.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription info */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-brand-400" /> Subscription Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Plan', value: tenant?.subscription?.plan?.name || 'No Plan' },
            { label: 'Status', value: subStatus },
            { label: 'Started', value: tenant?.subscription?.starts_at ? new Date(tenant.subscription.starts_at).toLocaleDateString() : '—' },
            { label: 'Expires', value: tenant?.subscription?.ends_at ? new Date(tenant.subscription.ends_at).toLocaleDateString() : 'Never' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-lg bg-surface border border-surface-border">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="font-semibold text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
