import { useState } from 'react';
import { Wrench, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import { useAuth } from '../contexts/AuthContext';

export default function MaintenancePage() {
  const { tenant, updateTenant } = useAuth();
  const [form, setForm] = useState({
    maintenance_mode: tenant?.maintenance_mode || false,
    maintenance_mode_text: tenant?.maintenance_mode_text || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateMaintenance(form);
      updateTenant(res.data.data.tenant);
      toast.success('Maintenance settings updated');
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
          <Wrench size={20} className="text-brand-400" /> Maintenance Mode
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Temporarily disable your platform for maintenance</p>
      </div>

      <div className="card p-5 space-y-5">
        {form.maintenance_mode && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
            <AlertTriangle size={16} />
            <span>Maintenance mode is currently <strong>active</strong>. Your platform is not accessible to users.</span>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`w-14 h-7 rounded-full transition-colors relative ${form.maintenance_mode ? 'bg-yellow-500' : 'bg-surface-border'}`}
            onClick={() => setForm((f) => ({ ...f, maintenance_mode: !f.maintenance_mode }))}
          >
            <div className={`w-6 h-6 rounded-full bg-white absolute top-0.5 transition-transform shadow ${form.maintenance_mode ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </div>
          <div>
            <p className="font-medium text-white">Enable Maintenance Mode</p>
            <p className="text-xs text-gray-500">Users will see a maintenance page until disabled</p>
          </div>
        </label>

        <div>
          <label className="label">Maintenance Message</label>
          <textarea
            value={form.maintenance_mode_text}
            onChange={(e) => setForm((f) => ({ ...f, maintenance_mode_text: e.target.value }))}
            className="input"
            rows={3}
            placeholder="We are currently performing scheduled maintenance. We'll be back shortly!"
          />
          <p className="text-xs text-gray-500 mt-1">This message will be shown to users during maintenance</p>
        </div>

        <button id="save-maintenance-btn" onClick={handleSave} disabled={saving} className="btn-primary">
          <Save size={16} />{saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
