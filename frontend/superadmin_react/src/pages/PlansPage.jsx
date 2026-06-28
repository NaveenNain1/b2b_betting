import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CreditCard, Check, X as XIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/superAdminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

function PlanForm({ plan, onSave, onClose }) {
  const isEdit = Boolean(plan);
  const [form, setForm] = useState({
    name: plan?.name || '',
    price_per_month: plan?.price_per_month || '',
    max_users: plan?.max_users || '',
    sports_allowed: plan?.sports_allowed ?? false,
    casino_allowed: plan?.casino_allowed ?? false,
    is_active: plan?.is_active ?? true,
    features: (plan?.features || []).join('\n'),
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price_per_month: Number(form.price_per_month),
        max_users: Number(form.max_users),
        features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      };
      if (isEdit) {
        await api.updatePlan(plan._id, payload);
        toast.success('Plan updated');
      } else {
        await api.createPlan(payload);
        toast.success('Plan created');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Plan Name *</label>
          <input name="name" required value={form.name} onChange={handleChange} className="input" placeholder="Starter" />
        </div>
        <div>
          <label className="label">Price / Month ($) *</label>
          <input name="price_per_month" type="number" required min="0" value={form.price_per_month} onChange={handleChange} className="input" placeholder="99" />
        </div>
        <div>
          <label className="label">Max Sub-Admin Users *</label>
          <input name="max_users" type="number" required min="1" value={form.max_users} onChange={handleChange} className="input" placeholder="10" />
        </div>
        <div className="col-span-2">
          <label className="label">Features (one per line)</label>
          <textarea name="features" value={form.features} onChange={handleChange} className="input" rows={4} placeholder="Unlimited sports bets&#10;24/7 Support&#10;Custom branding" />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {[
          { name: 'sports_allowed', label: 'Sports Allowed' },
          { name: 'casino_allowed', label: 'Casino Allowed' },
          { name: 'is_active', label: 'Active Plan' },
        ].map(({ name, label }) => (
          <label key={name} className="flex items-center gap-2 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-colors ${form[name] ? 'bg-brand-600' : 'bg-surface-border'} relative`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${form[name] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <input name={name} type="checkbox" checked={form[name]} onChange={handleChange} className="sr-only" />
            <span className="text-sm text-gray-300">{label}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
        </button>
      </div>
    </form>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState({ open: false, plan: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, plan: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.listPlans();
      setPlans(res.data.data.plans);
    } catch (_) { toast.error('Failed to load plans'); }
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.deletePlan(deleteDialog.plan._id);
      toast.success('Plan deleted');
      setDeleteDialog({ open: false, plan: null });
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard size={20} className="text-brand-400" /> Subscription Plans
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{plans.length} plans configured</p>
        </div>
        <button id="create-plan-btn" onClick={() => setFormModal({ open: true, plan: null })} className="btn-primary">
          <Plus size={16} /> New Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="card p-12 text-center">
          <CreditCard size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No plans yet. Create your first plan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan._id} className={`card p-5 relative overflow-hidden ${!plan.is_active ? 'opacity-60' : ''}`}>
              {/* Glow accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gradient opacity-10 rounded-full -translate-y-8 translate-x-8" />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white text-lg">{plan.name}</p>
                  <p className="text-3xl font-extrabold text-brand-400 mt-1">
                    ${plan.price_per_month}
                    <span className="text-sm text-gray-500 font-normal">/mo</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setFormModal({ open: true, plan })} className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteDialog({ open: true, plan })} className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={plan.is_active ? 'badge badge-green' : 'badge badge-red'}>{plan.is_active ? 'Active' : 'Inactive'}</span>
                {plan.sports_allowed && <span className="badge badge-blue">Sports</span>}
                {plan.casino_allowed && <span className="badge badge-purple">Casino</span>}
                <span className="badge badge-yellow">Up to {plan.max_users} users</span>
              </div>

              {plan.features.length > 0 && (
                <ul className="space-y-1.5 mt-3 border-t border-surface-border pt-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check size={13} className="text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={formModal.open} onClose={() => setFormModal({ open: false, plan: null })} title={formModal.plan ? 'Edit Plan' : 'Create Plan'}>
        <PlanForm plan={formModal.plan} onSave={fetchPlans} onClose={() => setFormModal({ open: false, plan: null })} />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, plan: null })}
        onConfirm={handleDelete}
        title="Delete Plan"
        message={`Are you sure you want to delete "${deleteDialog.plan?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
