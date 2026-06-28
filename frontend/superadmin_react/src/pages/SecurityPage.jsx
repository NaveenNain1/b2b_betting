import { useState } from 'react';
import { Shield, Lock, Smartphone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/superAdminApi';
import { useAuth } from '../contexts/AuthContext';

function PasswordSection() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.changePassword({ current_password: form.current_password, new_password: form.new_password });
      toast.success('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'current_password', label: 'Current Password', show: show.current, toggle: () => setShow((s) => ({ ...s, current: !s.current })) },
    { key: 'new_password', label: 'New Password', show: show.new, toggle: () => setShow((s) => ({ ...s, new: !s.new })) },
    { key: 'confirm', label: 'Confirm New Password', show: show.confirm, toggle: () => setShow((s) => ({ ...s, confirm: !s.confirm })) },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
          <Lock size={18} className="text-brand-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Change Password</h3>
          <p className="text-xs text-gray-500">Use a strong, unique password</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map(({ key, label, show: s, toggle }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <div className="relative">
              <input
                id={`sa-${key}`}
                type={s ? 'text' : 'password'}
                required
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="input pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {s ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}
        <button id="sa-change-password-btn" type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

function TwoFactorSection() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState('idle'); // idle | setup | enable | disable
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await api.setup2fa();
      setSetupData(res.data.data);
      setStep('setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.enable2fa({ code });
      toast.success('2FA enabled');
      updateUser({ is_2fa_enabled: true });
      setStep('idle');
      setCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.disable2fa({ password, code });
      toast.success('2FA disabled');
      updateUser({ is_2fa_enabled: false });
      setStep('idle');
      setCode('');
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const is2faEnabled = user?.is_2fa_enabled;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Smartphone size={18} className="text-cyan-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
          <p className="text-xs text-gray-500">Secure your account with TOTP</p>
        </div>
        <div className="ml-auto">
          <span className={is2faEnabled ? 'badge badge-green' : 'badge badge-red'}>
            {is2faEnabled ? '2FA Enabled' : '2FA Disabled'}
          </span>
        </div>
      </div>

      {step === 'idle' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            {is2faEnabled
              ? 'Two-factor authentication is active. You can disable it below.'
              : 'Enable 2FA to add an extra layer of security to your account.'}
          </p>
          {!is2faEnabled ? (
            <button id="sa-setup-2fa-btn" onClick={handleSetup} disabled={loading} className="btn-primary">
              <Smartphone size={16} />
              {loading ? 'Setting up...' : 'Setup 2FA'}
            </button>
          ) : (
            <button id="sa-disable-2fa-btn" onClick={() => setStep('disable')} className="btn-danger">
              Disable 2FA
            </button>
          )}
        </div>
      )}

      {step === 'setup' && setupData && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-surface border border-brand-500/30">
            <p className="text-xs text-gray-400 mb-2">Scan this QR code with your authenticator app, or enter the secret manually:</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setupData.otpauth_url)}&bgcolor=13,17,23&color=255,255,255`} alt="QR Code" className="rounded-lg mx-auto" />
            <p className="mt-2 text-center">
              <code className="text-xs text-cyan-400 bg-surface px-2 py-1 rounded">{setupData.secret}</code>
            </p>
          </div>
          <form onSubmit={handleEnable} className="space-y-3">
            <div>
              <label className="label">Enter 6-digit code from your app</label>
              <input id="sa-2fa-enable-code" type="text" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="000000" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep('idle'); setSetupData(null); }} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'disable' && (
        <form onSubmit={handleDisable} className="space-y-3">
          <p className="text-sm text-gray-400">Enter your password and current 2FA code to disable:</p>
          <div>
            <label className="label">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">2FA Code</label>
            <input type="text" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="000000" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('idle')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-danger flex-1">
              {loading ? 'Processing...' : 'Disable 2FA'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SecurityPage() {
  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield size={20} className="text-brand-400" /> Security Settings
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account security</p>
      </div>
      <PasswordSection />
      <TwoFactorSection />
    </div>
  );
}
