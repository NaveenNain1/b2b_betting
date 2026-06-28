import { useState } from 'react';
import { Shield, Lock, Smartphone, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import { useAuth } from '../contexts/AuthContext';

function PasswordSection() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.changePassword({ current_password: form.current_password, new_password: form.new_password });
      toast.success('Password changed');
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center"><Lock size={18} className="text-brand-400" /></div>
        <div><h3 className="font-semibold text-white">Change Password</h3><p className="text-xs text-gray-500">Use a strong, unique password</p></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { key: 'current_password', label: 'Current Password' },
          { key: 'new_password', label: 'New Password' },
          { key: 'confirm', label: 'Confirm New Password' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <div className="relative">
              <input type={show[key] ? 'text' : 'password'} required value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="input pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Updating...' : 'Update Password'}</button>
      </form>
    </div>
  );
}

function TwoFactorSection() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState('idle');
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
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.enable2fa({ code });
      toast.success('2FA enabled');
      updateUser({ is_2fa_enabled: true });
      setStep('idle'); setCode('');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid code'); }
    finally { setLoading(false); }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.disable2fa({ password, code });
      toast.success('2FA disabled');
      updateUser({ is_2fa_enabled: false });
      setStep('idle'); setCode(''); setPassword('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const is2fa = user?.is_2fa_enabled;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center"><Smartphone size={18} className="text-violet-400" /></div>
          <div><h3 className="font-semibold text-white">Two-Factor Auth</h3><p className="text-xs text-gray-500">TOTP-based authentication</p></div>
        </div>
        <span className={`badge ${is2fa ? 'badge-green' : 'badge-red'}`}>{is2fa ? 'Enabled' : 'Disabled'}</span>
      </div>

      {step === 'idle' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">{is2fa ? '2FA is active. Disable it below.' : 'Add an extra layer of security.'}</p>
          {!is2fa ? (
            <button onClick={handleSetup} disabled={loading} className="btn-primary"><Smartphone size={16} />{loading ? 'Setting up...' : 'Setup 2FA'}</button>
          ) : (
            <button onClick={() => setStep('disable')} className="btn-danger">Disable 2FA</button>
          )}
        </div>
      )}

      {step === 'setup' && setupData && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-surface border border-brand-500/30">
            <p className="text-xs text-gray-400 mb-2">Scan with your authenticator app:</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setupData.otpauth_url)}&bgcolor=10,14,26&color=255,255,255`} alt="QR Code" className="rounded-lg mx-auto" />
            <p className="mt-2 text-center"><code className="text-xs text-cyan-400 bg-surface px-2 py-1 rounded">{setupData.secret}</code></p>
          </div>
          <form onSubmit={handleEnable} className="space-y-3">
            <div>
              <label className="label">Enter 6-digit code</label>
              <input type="text" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="000000" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep('idle'); setSetupData(null); }} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">{loading ? 'Verifying...' : 'Enable 2FA'}</button>
            </div>
          </form>
        </div>
      )}

      {step === 'disable' && (
        <form onSubmit={handleDisable} className="space-y-3">
          <div><label className="label">Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" /></div>
          <div><label className="label">2FA Code</label><input type="text" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="000000" /></div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('idle')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-danger flex-1">{loading ? 'Processing...' : 'Disable 2FA'}</button>
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
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield size={20} className="text-brand-400" /> Security</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account security settings</p>
      </div>
      <PasswordSection />
      <TwoFactorSection />
    </div>
  );
}
