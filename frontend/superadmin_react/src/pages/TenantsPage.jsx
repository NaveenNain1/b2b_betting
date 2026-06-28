import { useEffect, useState } from 'react';
import { Plus, Edit2, Ban, Users, Search, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/superAdminApi';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_BADGES = {
  trial: 'badge-yellow',
  active: 'badge-green',
  past_due: 'badge-red',
  cancelled: 'badge-red',
  expired: 'badge-red',
};

function TenantForm({ tenant, plans, onSave, onClose }) {
  const isEdit = Boolean(tenant);
  const [form, setForm] = useState({
    brand_name: tenant?.brand_name || '',
    primary_domain: tenant?.primary_domain || '',
    frontend_url: tenant?.frontend_url || '',
    website_title: tenant?.website_title || '',
    website_description: tenant?.website_description || '',
    theme: tenant?.theme || 'default',
    logo: null,
    favicon: null,
    'subscription[plan]': tenant?.subscription?.plan?._id || tenant?.subscription?.plan || '',
    'subscription[status]': tenant?.subscription?.status || 'trial',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') fd.append(k, v);
      });
      if (isEdit) {
        await api.updateTenant(tenant._id, fd);
        toast.success('Tenant updated successfully');
      } else {
        await api.createTenant(fd);
        toast.success('Tenant created successfully');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Brand Name *</label>
          <input name="brand_name" required value={form.brand_name} onChange={handleChange} className="input" placeholder="BetKing" />
        </div>
        <div>
          <label className="label">Primary Domain *</label>
          <input name="primary_domain" required value={form.primary_domain} onChange={handleChange} disabled={isEdit} className="input" placeholder="betking.com" />
        </div>
        <div className="col-span-2">
          <label className="label">Frontend URL *</label>
          <input name="frontend_url" required value={form.frontend_url} onChange={handleChange} className="input" placeholder="https://betking.com" />
        </div>
        <div>
          <label className="label">Website Title</label>
          <input name="website_title" value={form.website_title} onChange={handleChange} className="input" placeholder="BetKing - Sports Betting" />
        </div>
        <div>
          <label className="label">Theme</label>
          <select name="theme" value={form.theme} onChange={handleChange} className="input">
            <option value="default">Default</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Website Description</label>
          <textarea name="website_description" value={form.website_description} onChange={handleChange} className="input" rows={2} />
        </div>
        <div>
          <label className="label">Logo</label>
          <input name="logo" type="file" accept="image/*" onChange={handleChange} className="input py-1.5 text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white" />
        </div>
        <div>
          <label className="label">Favicon</label>
          <input name="favicon" type="file" accept="image/*" onChange={handleChange} className="input py-1.5 text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white" />
        </div>
      </div>

      {/* Subscription */}
      <div className="p-3 rounded-lg bg-surface border border-surface-border">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Subscription</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Plan</label>
            <select name="subscription[plan]" value={form['subscription[plan]']} onChange={handleChange} className="input">
              <option value="">No Plan</option>
              {plans.map((p) => <option key={p._id} value={p._id}>{p.name} (${p.price_per_month}/mo)</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select name="subscription[status]" value={form['subscription[status]']} onChange={handleChange} className="input">
              {['trial', 'active', 'past_due', 'cancelled', 'expired'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? 'Saving...' : isEdit ? 'Update Tenant' : 'Create Tenant'}
        </button>
      </div>
    </form>
  );
}

function TenantUsersModal({ tenant, isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tenant) {
      setLoading(true);
      api.tenantUsers(tenant._id)
        .then((r) => setUsers(r.data.data.users))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, tenant]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Users — ${tenant?.brand_name}`} size="lg">
      {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : (
        <div className="space-y-2">
          {users.length === 0 ? <p className="text-gray-500 text-center py-8">No users found</p> :
          users.map((u) => (
            <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
              <div>
                <p className="font-medium text-white">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-purple">{u.type}</span>
                <span className={u.status === 'active' ? 'badge badge-green' : 'badge badge-red'}>{u.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formModal, setFormModal] = useState({ open: false, tenant: null });
  const [usersModal, setUsersModal] = useState({ open: false, tenant: null });
  const [banDialog, setBanDialog] = useState({ open: false, tenant: null });
  const [banLoading, setBanLoading] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([api.listTenants(), api.listPlans()]);
      setTenants(tRes.data.data.tenants);
      setPlans(pRes.data.data.plans);
    } catch (_) { toast.error('Failed to load tenants'); }
    setLoading(false);
  };

  useEffect(() => { fetchTenants(); }, []);

  const filtered = tenants.filter((t) =>
    t.brand_name.toLowerCase().includes(search.toLowerCase()) ||
    t.primary_domain.toLowerCase().includes(search.toLowerCase())
  );

  const handleBan = async () => {
    setBanLoading(true);
    try {
      await api.banTenant(banDialog.tenant._id, { is_banned: !banDialog.tenant.is_banned });
      toast.success(banDialog.tenant.is_banned ? 'Tenant unbanned' : 'Tenant banned');
      setBanDialog({ open: false, tenant: null });
      fetchTenants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setBanLoading(false);
    }
  };

  const columns = [
    {
      key: 'brand_name', label: 'Tenant', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          {row.logo_url ? (
            <img src={row.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
              {v?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-white">{v}</p>
            <p className="text-xs text-gray-500">{row.primary_domain}</p>
          </div>
        </div>
      )
    },
    {
      key: 'subscription', label: 'Plan',
      render: (v) => v?.plan?.name ? (
        <span className="badge badge-purple">{v.plan.name}</span>
      ) : <span className="text-gray-500 text-xs">No plan</span>
    },
    {
      key: 'subscription', label: 'Sub Status',
      render: (v, row) => (
        <span className={`badge ${STATUS_BADGES[v?.status] || 'badge-yellow'}`}>
          {v?.status || 'trial'}
        </span>
      )
    },
    {
      key: 'is_banned', label: 'Status',
      render: (v) => <span className={v ? 'badge badge-red' : 'badge badge-green'}>{v ? 'Banned' : 'Active'}</span>
    },
    {
      key: 'createdAt', label: 'Created', sortable: true,
      render: (v) => v ? new Date(v).toLocaleDateString() : '—'
    },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => setFormModal({ open: true, tenant: row })} className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white transition-colors" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={() => setUsersModal({ open: true, tenant: row })} className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-blue-400 transition-colors" title="Users">
            <Users size={14} />
          </button>
          <button onClick={() => setBanDialog({ open: true, tenant: row })} className={`p-1.5 rounded-lg hover:bg-surface-hover transition-colors ${row.is_banned ? 'text-emerald-400' : 'text-red-400'}`} title={row.is_banned ? 'Unban' : 'Ban'}>
            <Ban size={14} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe size={20} className="text-brand-400" /> Tenants
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{tenants.length} total tenants</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-input rounded-lg border border-surface-border">
            <Search size={14} className="text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tenants..."
              className="bg-transparent text-sm text-gray-200 placeholder:text-gray-500 outline-none w-48"
            />
          </div>
          <button id="create-tenant-btn" onClick={() => setFormModal({ open: true, tenant: null })} className="btn-primary">
            <Plus size={16} /> New Tenant
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No tenants found" />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, tenant: null })}
        title={formModal.tenant ? 'Edit Tenant' : 'Create New Tenant'}
        size="lg"
      >
        <TenantForm
          tenant={formModal.tenant}
          plans={plans}
          onSave={fetchTenants}
          onClose={() => setFormModal({ open: false, tenant: null })}
        />
      </Modal>

      {/* Users Modal */}
      <TenantUsersModal
        tenant={usersModal.tenant}
        isOpen={usersModal.open}
        onClose={() => setUsersModal({ open: false, tenant: null })}
      />

      {/* Ban Dialog */}
      <ConfirmDialog
        isOpen={banDialog.open}
        onClose={() => setBanDialog({ open: false, tenant: null })}
        onConfirm={handleBan}
        title={banDialog.tenant?.is_banned ? 'Unban Tenant' : 'Ban Tenant'}
        message={`Are you sure you want to ${banDialog.tenant?.is_banned ? 'unban' : 'ban'} ${banDialog.tenant?.brand_name}?`}
        confirmLabel={banDialog.tenant?.is_banned ? 'Unban' : 'Ban'}
        danger={!banDialog.tenant?.is_banned}
        loading={banLoading}
      />
    </div>
  );
}
