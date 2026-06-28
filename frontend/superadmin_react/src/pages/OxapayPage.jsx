import { useEffect, useState } from 'react';
import { Zap, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/superAdminApi';

export default function OxapayPage() {
  const [settings, setSettings] = useState({ merchant_api_key: '', payout_api_key: '', sandbox: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState({ merchant: false, payout: false });

  useEffect(() => {
    api.getOxapay()
      .then((r) => {
        if (r.data.data.settings) setSettings(r.data.data.settings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateOxapay(settings);
      toast.success('OxaPay settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap size={20} className="text-brand-400" /> Payment Gateway
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure OxaPay crypto payment gateway</p>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* OxaPay branding */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-brand-500/30">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">OxaPay Integration</p>
                <p className="text-xs text-gray-400">Crypto payment processing for tenant subscriptions</p>
              </div>
            </div>

            <div>
              <label className="label">Merchant API Key</label>
              <div className="relative">
                <input
                  id="oxapay-merchant-key"
                  type={showKeys.merchant ? 'text' : 'password'}
                  value={settings.merchant_api_key || ''}
                  onChange={(e) => setSettings({ ...settings, merchant_api_key: e.target.value })}
                  className="input pr-10"
                  placeholder="Enter merchant API key"
                />
                <button type="button" onClick={() => setShowKeys((s) => ({ ...s, merchant: !s.merchant }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showKeys.merchant ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Payout API Key</label>
              <div className="relative">
                <input
                  id="oxapay-payout-key"
                  type={showKeys.payout ? 'text' : 'password'}
                  value={settings.payout_api_key || ''}
                  onChange={(e) => setSettings({ ...settings, payout_api_key: e.target.value })}
                  className="input pr-10"
                  placeholder="Enter payout API key"
                />
                <button type="button" onClick={() => setShowKeys((s) => ({ ...s, payout: !s.payout }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showKeys.payout ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-12 h-6 rounded-full transition-colors relative ${settings.sandbox ? 'bg-brand-600' : 'bg-surface-border'}`} onClick={() => setSettings((s) => ({ ...s, sandbox: !s.sandbox }))}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings.sandbox ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">Sandbox Mode</p>
                <p className="text-xs text-gray-500">Use OxaPay test environment</p>
              </div>
            </label>

            {settings.sandbox && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                ⚠️ Sandbox mode is enabled. No real payments will be processed.
              </div>
            )}

            <button id="save-oxapay-btn" type="submit" disabled={saving} className="btn-primary">
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
