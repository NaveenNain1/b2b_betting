import { useState } from 'react';
import { UserCircle, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile({ name });
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCircle size={20} className="text-brand-400" /> Profile
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Update your personal information</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-surface-border">
          <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center text-white text-2xl font-bold shadow-glow">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="badge badge-purple mt-1">{user?.type}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input value={user?.email || ''} disabled className="input opacity-50 cursor-not-allowed" />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <button id="save-profile-btn" type="submit" disabled={saving} className="btn-primary">
            <Save size={16} />{saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
