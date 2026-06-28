import { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';

const FIELD_TYPES = ['text', 'number', 'date', 'file', 'select'];

export default function KycPage() {
  const [settings, setSettings] = useState({ is_kyc_required: false, kyc_fields: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getKycSettings()
      .then((r) => { if (r.data.data.settings) setSettings(r.data.data.settings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addField = () => {
    setSettings((s) => ({
      ...s,
      kyc_fields: [...s.kyc_fields, { name: '', label: '', type: 'text', required: true }],
    }));
  };

  const removeField = (idx) => {
    setSettings((s) => ({ ...s, kyc_fields: s.kyc_fields.filter((_, i) => i !== idx) }));
  };

  const updateField = (idx, key, value) => {
    setSettings((s) => ({
      ...s,
      kyc_fields: s.kyc_fields.map((f, i) => i === idx ? { ...f, [key]: value } : f),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveKycSettings(settings);
      toast.success('KYC settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield size={20} className="text-brand-400" /> KYC Settings
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure Know Your Customer verification fields</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.is_kyc_required ? 'bg-brand-600' : 'bg-surface-border'}`}
                onClick={() => setSettings((s) => ({ ...s, is_kyc_required: !s.is_kyc_required }))}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings.is_kyc_required ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <p className="font-medium text-white">Require KYC Verification</p>
                <p className="text-xs text-gray-500">Users must complete KYC before using the platform</p>
              </div>
            </label>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">KYC Fields</h3>
              <button onClick={addField} className="btn-secondary gap-2 text-xs">
                <Plus size={14} /> Add Field
              </button>
            </div>

            {settings.kyc_fields.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No KYC fields configured. Add fields to collect user verification data.</p>
            ) : (
              <div className="space-y-3">
                {settings.kyc_fields.map((field, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface border border-surface-border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="label text-xs">Field Name</label>
                        <input value={field.name} onChange={(e) => updateField(idx, 'name', e.target.value)} className="input" placeholder="id_number" />
                      </div>
                      <div>
                        <label className="label text-xs">Label</label>
                        <input value={field.label} onChange={(e) => updateField(idx, 'label', e.target.value)} className="input" placeholder="ID Number" />
                      </div>
                      <div>
                        <label className="label text-xs">Type</label>
                        <select value={field.type} onChange={(e) => updateField(idx, 'type', e.target.value)} className="input">
                          {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input type="checkbox" checked={field.required} onChange={(e) => updateField(idx, 'required', e.target.checked)} className="rounded" />
                          <span className="text-sm text-gray-300">Required</span>
                        </label>
                        <button onClick={() => removeField(idx)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button id="save-kyc-btn" onClick={handleSave} disabled={saving} className="btn-primary mt-4">
              <Save size={16} />{saving ? 'Saving...' : 'Save KYC Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
