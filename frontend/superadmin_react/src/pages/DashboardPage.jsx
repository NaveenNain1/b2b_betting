import { useEffect, useState } from 'react';
import { Globe, CreditCard, Users, Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import * as api from '../api/superAdminApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="stat-card">
    <div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
      {trend !== undefined && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}% from last month
        </p>
      )}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-xs">
        <p className="text-gray-400">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tRes, pRes, lRes] = await Promise.all([
          api.listTenants(),
          api.listPlans(),
          api.tenantLoginLogs({ limit: 30 }),
        ]);
        setTenants(tRes.data.data.tenants);
        setPlans(pRes.data.data.plans);
        setLogs(lRes.data.data.logs);
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const activeTenants = tenants.filter((t) => !t.is_banned).length;
  const bannedTenants = tenants.filter((t) => t.is_banned).length;

  // Build chart data from logs (by day)
  const chartData = (() => {
    const map = {};
    logs.forEach((log) => {
      const d = new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).slice(-7).map(([date, logins]) => ({ date, logins }));
  })();

  const recentTenants = [...tenants].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tenants" value={loading ? '...' : tenants.length} icon={Globe} color="bg-brand-gradient" trend={12} />
        <StatCard label="Active Tenants" value={loading ? '...' : activeTenants} icon={Activity} color="bg-emerald-500/80" trend={8} />
        <StatCard label="Banned Tenants" value={loading ? '...' : bannedTenants} icon={Users} color="bg-red-500/80" />
        <StatCard label="Active Plans" value={loading ? '...' : plans.length} icon={CreditCard} color="bg-cyan-500/80" />
      </div>

      {/* Chart + Recent Tenants */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Chart */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Tenant Login Activity</h3>
            <span className="badge badge-purple">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="logins" name="Logins" stroke="#7c3aed" strokeWidth={2} fill="url(#loginGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Tenants */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold text-white mb-4">Recent Tenants</h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : recentTenants.length === 0 ? (
              <p className="text-gray-500 text-sm">No tenants yet</p>
            ) : recentTenants.map((t) => (
              <div key={t._id} className="flex items-center justify-between py-2 border-b border-surface-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.brand_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.brand_name}</p>
                    <p className="text-xs text-gray-500">{t.primary_domain}</p>
                  </div>
                </div>
                <span className={t.is_banned ? 'badge badge-red' : 'badge badge-green'}>
                  {t.is_banned ? 'Banned' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plans Overview */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-brand-400" />
          Plans Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {loading ? <p className="text-gray-500 text-sm col-span-full">Loading...</p> :
          plans.map((plan) => (
            <div key={plan._id} className="p-4 bg-surface-hover rounded-xl border border-surface-border hover:border-brand-500/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-white">{plan.name}</p>
                <span className={plan.is_active ? 'badge badge-green' : 'badge badge-red'}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-2xl font-bold text-brand-400">${plan.price_per_month}<span className="text-sm text-gray-500 font-normal">/mo</span></p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {plan.sports_allowed && <span className="badge badge-blue">Sports</span>}
                {plan.casino_allowed && <span className="badge badge-purple">Casino</span>}
                <span className="badge badge-yellow">Up to {plan.max_users} users</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
