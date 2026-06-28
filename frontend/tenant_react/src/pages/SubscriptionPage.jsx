import { useEffect, useState } from 'react';
import { CreditCard, Check, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import { useAuth } from '../contexts/AuthContext';

export default function SubscriptionPage() {
  const { tenant, updateTenant } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
    api.getPlans()
      .then((r) => setPlans(r.data.data.plans))
      .catch(() => toast.error('Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  const currentPlanId = tenant?.subscription?.plan?._id || tenant?.subscription?.plan;

  const handleUpgrade = async (plan) => {
    setUpgrading(plan._id);
    try {
      const res = await api.updateSubscription({ plan_id: plan._id, status: 'active' });
      updateTenant(res.data.data.tenant);
      toast.success(`Upgraded to ${plan.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upgrade');
    } finally {
      setUpgrading(null);
    }
  };

  const subStatus = tenant?.subscription?.status || 'trial';
  const subBadge = { active: 'badge-green', trial: 'badge-yellow', past_due: 'badge-red', cancelled: 'badge-red', expired: 'badge-red' }[subStatus];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard size={20} className="text-brand-400" /> Subscription
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your platform plan</p>
      </div>

      {/* Current subscription */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4">Current Subscription</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Plan', value: tenant?.subscription?.plan?.name || 'No Plan' },
            { label: 'Status', value: <span className={`badge ${subBadge}`}>{subStatus}</span> },
            { label: 'Started', value: tenant?.subscription?.starts_at ? new Date(tenant.subscription.starts_at).toLocaleDateString() : '—' },
            { label: 'Expires', value: tenant?.subscription?.ends_at ? new Date(tenant.subscription.ends_at).toLocaleDateString() : 'Never' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-lg bg-surface border border-surface-border">
              <p className="text-xs text-gray-500">{label}</p>
              <div className="font-semibold text-white mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="font-semibold text-white mb-4">Available Plans</h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = String(currentPlanId) === String(plan._id);
              return (
                <div key={plan._id} className={`card p-5 relative overflow-hidden transition-all duration-200 ${isCurrent ? 'border-brand-500/50 shadow-glow' : 'hover:border-brand-500/30'}`}>
                  {isCurrent && (
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-green">Current Plan</span>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gradient opacity-10 rounded-full -translate-y-8 translate-x-8" />

                  <p className="font-bold text-white text-lg">{plan.name}</p>
                  <p className="text-3xl font-extrabold text-brand-400 mt-1">
                    ${plan.price_per_month}<span className="text-sm text-gray-500 font-normal">/mo</span>
                  </p>

                  <div className="flex flex-wrap gap-2 my-3">
                    {plan.sports_allowed && <span className="badge badge-blue">⚽ Sports</span>}
                    {plan.casino_allowed && <span className="badge badge-purple">🎰 Casino</span>}
                    <span className="badge badge-yellow">👥 Up to {plan.max_users} users</span>
                  </div>

                  {plan.features.length > 0 && (
                    <ul className="space-y-1.5 mt-3 mb-4 border-t border-surface-border pt-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <Check size={13} className="text-emerald-400 flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  )}

                  {!isCurrent && (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgrading === plan._id}
                      className="btn-primary w-full justify-center mt-2"
                    >
                      <Zap size={14} />
                      {upgrading === plan._id ? 'Upgrading...' : 'Select Plan'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
