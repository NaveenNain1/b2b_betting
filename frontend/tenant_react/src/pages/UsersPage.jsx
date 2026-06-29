import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Key, Users, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const ALL_PERMISSIONS = ['Users', 'Payments', 'Casino', 'Reports', 'Bonuses', 'KYC', 'Settings'];

function UserForm({ user, onSave, onClose }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    type: user?.type || 'sub-admin',
    status: user?.status || 'active',
    permissions: user?.permissions || [],
  });
  const [loading, setLoading] = useState(false);

  const togglePermission = (perm) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      if (isEdit) {
        await api.updateUser(user._id, payload);
        toast.success('Sub Admin updated');
      } else {
        await api.createUser(payload);
        toast.success('Sub Admin created');
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
        <div>
          <label className="label">Full Name *</label>
          <input name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="John Doe" />
        </div>
        <div>
          <label className="label">Email *</label>
          <input name="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="john@example.com" disabled={isEdit} />
        </div>
        <div>
          <label className="label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
          <input name="password" type="password" required={!isEdit} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="••••••••" />
        </div>
        <div>
          <label className="label">Role</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
            <option value="sub-admin">Sub Admin</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {isEdit && (
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="label">Permissions</label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_PERMISSIONS.map((perm) => (
            <label key={perm} className="flex items-center gap-2 p-2 rounded-lg border border-surface-border hover:border-brand-500/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={form.permissions.includes(perm)}
                onChange={() => togglePermission(perm)}
                className="rounded text-brand-500"
              />
              <span className="text-sm text-gray-300">{perm}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? 'Saving...' : isEdit ? 'Update Sub Admin' : 'Create Sub Admin'}
        </button>
      </div>
    </form>
  );
}

function ChangePasswordModal({ user, onClose }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateUserPassword(user._id, { password });
      toast.success('Password updated');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={!!user} onClose={onClose} title={`Change Password — ${user?.name}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label">New Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formModal, setFormModal] = useState({ open: false, user: null });
  const [pwdUser, setPwdUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.listUsers();
      setUsers(res.data.data.users);
    } catch (_) { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.deleteUser(deleteDialog.user._id);
      toast.success('Sub Admin deleted');
      setDeleteDialog({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'name', label: 'Sub Admin', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
            {v?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{v}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'type', label: 'Role', render: (v) => <span className="badge badge-purple">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={v === 'active' ? 'badge badge-green' : 'badge badge-red'}>{v}</span> },
    {
      key: 'permissions', label: 'Permissions',
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {(v || []).slice(0, 3).map((p) => <span key={p} className="badge badge-blue">{p}</span>)}
          {(v || []).length > 3 && <span className="badge badge-blue">+{v.length - 3}</span>}
        </div>
      )
    },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => setFormModal({ open: true, user: row })} className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white transition-colors"><Edit2 size={14} /></button>
          <button onClick={() => setPwdUser(row)} className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-yellow-400 transition-colors"><Key size={14} /></button>
          <button onClick={() => setDeleteDialog({ open: true, user: row })} className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users size={20} className="text-brand-400" /> Sub Admins</h2>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} sub-admins in your organization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-input rounded-lg border border-surface-border">
            <Search size={14} className="text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sub-admins..." className="bg-transparent text-sm text-gray-200 placeholder:text-gray-500 outline-none w-40" />
          </div>
          <button id="create-user-btn" onClick={() => setFormModal({ open: true, user: null })} className="btn-primary">
            <Plus size={16} /> New Sub Admin
          </button>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No sub-admins found" />
      </div>

      <Modal isOpen={formModal.open} onClose={() => setFormModal({ open: false, user: null })} title={formModal.user ? 'Edit Sub Admin' : 'Create Sub Admin'} size="lg">
        <UserForm user={formModal.user} onSave={fetchUsers} onClose={() => setFormModal({ open: false, user: null })} />
      </Modal>

      <ChangePasswordModal user={pwdUser} onClose={() => setPwdUser(null)} />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        onConfirm={handleDelete}
        title="Delete Sub Admin"
        message={`Are you sure you want to delete "${deleteDialog.user?.name}"?`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
